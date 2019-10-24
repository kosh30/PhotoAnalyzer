import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import AlbumDetails from './AlbumDetails';
import AWS from 'aws-sdk';

const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
  getAlbum(id: $id) {
  id
  name
  photos(sortDirection: DESC, nextToken: $nextTokenForPhotos) {
    nextToken
    items {
      id
      thumbnail {
        width
        height
        key
      }
      fullsize {
        width
        height
        key
      }
    }
  }
}}
`;

class AlbumDetailsLoader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nextTokenForPhotos: null,
      hasMorePhotos: true,
      album: null,
      loading: true
    }
  }

  async loadMorePhotos() {
    if (!this.state.hasMorePhotos) return;

    this.setState({ loading: true });
    const { data } = await API.graphql(graphqlOperation(GetAlbum, { id: this.props.id, nextTokenForPhotos: this.state.nextTokenForPhotos }));

    let album;
    if (this.state.album === null) {
      album = data.getAlbum;
    } else {
      album = this.state.album;
      album.photos.items = album.photos.items.concat(data.getAlbum.photos.items);
    }
    this.setState({
      album: album,
      loading: false,
      nextTokenForPhotos: data.getAlbum.photos.nextToken,
      hasMorePhotos: data.getAlbum.photos.nextToken !== null
    });
  }

  onDeletePhoto = async (photo) => {
    const deletePhoto = `mutation DeletePhoto($input: DeletePhotoInput!) {
      deletePhoto(input: $input) {
        id
        bucket
        thumbnail {
          width
          height
          key
        }
        fullsize {
          width
          height
          key
        }
      }
    }
    `;

    try {
      let { data } = await API.graphql(graphqlOperation(deletePhoto, { input: { id: photo.id } }));
      let photos = this.state.album.photos.items.filter(item => item.id !== photo.id);
      let album = {};
      Object.assign(album, this.state.album);
      album.photos.items = photos;
      this.setState({ album })

      let s3 = new AWS.S3();
      console.log('before S3delete data=', data)
      let deleted = data.deletePhoto;
      let params1 = { Bucket: deleted.bucket, Key: deleted.thumbnail.key };
      s3.deleteObject(params1, function (err, data) {
        if (err) console.log('Error deleting thumbnail from S3', err, err.stack);
        else console.log('thumbnail deleted from S3');
      });
      let params2 = { Bucket: deleted.bucket, Key: deleted.fullsize.key };
      s3.deleteObject(params2, function (err, data) {
        if (err) console.log('Error deleting fullsize from S3', err, err.stack);
        else console.log('fullsize deleted from S3');
      });

    } catch (e) {
      console.error("Error deleting photo: ", e)
    }
  }
  componentDidMount() {
    this.loadMorePhotos();
  }

  render() {
    return (
      <AlbumDetails
        loadingPhotos={this.state.loading}
        album={this.state.album}
        loadMorePhotos={this.loadMorePhotos.bind(this)}
        hasMorePhotos={this.state.hasMorePhotos}
        owner={this.props.owner}
        onDeletePhoto={this.onDeletePhoto}
      />
    );
  }
}

export default AlbumDetailsLoader;