import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Header, Segment, Form, Icon, Label } from 'semantic-ui-react';
import S3ImageUpload from './S3ImageUpload';
import PhotosList from './PhotosList';
import { API, graphqlOperation } from 'aws-amplify';

class AlbumDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumChanged: false
    }
  }

  handleDelete = async (album) => {
    console.log('handleDelete: ', album)
    const DeleteAlbum = `mutation DeleteAlbum($id: ID!) {
      deleteAlbum(input: {id: $id}) {
        id
        name
        owner
      }
    }`;
    try {
      const result = await API.graphql(graphqlOperation(DeleteAlbum, { id: album.id }));
      console.info(`Deleted album with id ${result.data.deleteAlbum.id}`);
    } catch (err) {
      console.err('Error deleting album: ',err)
    }
    this.setState({ albumChanged: true });
  }

  render() {
    if (this.state.albumChanged) {
      return (<Redirect to='/' />)
    }
    if (!this.props.album) return 'Loading album...';
    return (
      <Segment>
        <Header as='h3'>{this.props.album.name}
          {
            (!this.props.album.photos.items ||this.props.album.photos.items.length <= 0) &&
            <Label size='tiny' floating>
              <Icon name='delete' onClick={() => this.handleDelete(this.props.album)} />
            </Label>
          }
        </Header>

        <S3ImageUpload albumId={this.props.album.id} owner={this.props.owner} needReloadPhotos={this.props.needReloadPhotos}/>

        <PhotosList photos={this.props.album.photos.items} onDeletePhoto={this.props.onDeletePhoto} />

        {
          this.props.hasMorePhotos &&
          <Form.Button
            onClick={this.props.loadMorePhotos}
            icon='refresh'
            disabled={this.props.loadingPhotos}
            content={this.props.loadingPhotos ? 'Loading...' : 'Load more photos'}
          />
        }
      </Segment>
    )
  }
}

export default AlbumDetails;