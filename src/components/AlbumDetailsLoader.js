import React, { Component } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import AlbumDetails from './AlbumDetails';
import AWS from 'aws-sdk';
import { Message, Icon } from 'semantic-ui-react';

const GetAlbum = `query GetAlbum($id: ID!, $nextTokenForPhotos: String) {
  getAlbum(id: $id) {
  id
  name
  photos(sortDirection: DESC, nextToken: $nextTokenForPhotos) {
    nextToken
    items {
      id
      createdAt
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
    console.log('inside loadMorePhotos')
    if (!this.state.hasMorePhotos) return;
    //var data = null;

    this.setState({ loading: true });
    try {
      var { data } = await API.graphql(graphqlOperation(GetAlbum, { id: this.props.id, nextTokenForPhotos: this.state.nextTokenForPhotos }));
    } catch (err) {
      console.error('Error loading album photos: ',err);  
    }

    let album;
    if (!this.state.album) {
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

      const credentials = await (Auth.currentCredentials());
      // console.log('credentials: ', credentials)
      // console.log('essential credentials: ', Auth.essentialCredentials(credentials))
      const s3 = new AWS.S3({ credentials: Auth.essentialCredentials(credentials) });

      console.log('before S3delete data=', data)
      let deleted = data.deletePhoto;
      let params1 = { Bucket: deleted.bucket, Key: deleted.thumbnail.key };
      // s3.getBucketPolicy({ Bucket: deleted.bucket }, function (err, data) {
      //   if (err) console.log('Error getBucketPolicy', err, err.stack);
      //   else console.log(data);
      // });
      // s3.getBucketPolicyStatus({ Bucket: deleted.bucket }, function (err, data) {
      //   if (err) console.log('Error getBucketPolicyStatus', err, err.stack);
      //   else console.log(data);
      // });
      s3.deleteObject(params1, function (err, data) {
        if (err) console.log('Error deleting thumbnail from S3', err, err.stack);
        else console.log('thumbnail deleted from S3: ', data);
      });
      let params2 = { Bucket: deleted.bucket, Key: deleted.fullsize.key };
      s3.deleteObject(params2, function (err, data) {
        if (err) console.log('Error deleting fullsize from S3', err, err.stack);
        else console.log('fullsize deleted from S3: ', data);
      });

    } catch (e) {
      console.error("Error deleting photo: ", e)
    }
  }

  needReloadPhotos = () => {
    console.log('inside needReloadphotos')
    this.setState({
      loading: true
    });

    setTimeout(() => {
      this.setState({
        nextTokenForPhotos: null,
        hasMorePhotos: true,
        album: null,
        loading: true
      })
      this.loadMorePhotos();
    }, 10000);
  }

  componentDidMount() {
    this.loadMorePhotos();
  }

  render() {
    return (<>
      {
        this.state.loading && (<Message icon>
          <Icon name='circle notched' loading />
          <Message.Content>
            <Message.Header>Please wait</Message.Header>
            Your photo is being analyzed ...
          </Message.Content>
        </Message>)
      }

      <AlbumDetails
        loadingPhotos={this.state.loading}
        album={this.state.album}
        loadMorePhotos={this.loadMorePhotos.bind(this)}
        hasMorePhotos={this.state.hasMorePhotos}
        owner={this.props.owner}
        onDeletePhoto={this.onDeletePhoto}
        needReloadPhotos={this.needReloadPhotos}
      />
    </>
    );
  }
}

export default AlbumDetailsLoader;