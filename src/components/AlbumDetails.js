import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Header, Segment, Button, Icon, Label, Divider, Message } from 'semantic-ui-react';
import S3ImageUpload from './S3ImageUpload';
import PhotosList from './PhotosList';
import { API, graphqlOperation } from 'aws-amplify';

class AlbumDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumChanged: false,
      errorMsg:''
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
      this.setState({ albumChanged: true });
    } catch (err) {
      console.error('Error deleting album: ', err);
      this.setState({ errorMsg: err.errors[0].message });
    }
  }

  render() {
    if (this.state.errorMsg)
    return (<Message
      header='Sorry'
      content={this.state.errorMsg}
      onDismiss={()=>this.setState({ errorMsg:'' })
    }
    />)
    if (this.state.albumChanged) {
      return (<Redirect to='/' />)
    }
    if (!this.props.album) return 'Loading album...';

    return (
      <Segment color='teal' raised>
        <Header as='h3'>
          <Icon name='th' />
          <Header.Content>
            {this.props.album.name}
            {
              (!this.props.album.photos.items || this.props.album.photos.items.length <= 0) &&
              <Label size='tiny' floating>
                <Icon name='delete' onClick={() => this.handleDelete(this.props.album)} />
              </Label>
            }
          </Header.Content>
        </Header>

        <S3ImageUpload albumId={this.props.album.id} owner={this.props.owner} needReloadPhotos={this.props.needReloadPhotos} />

        <PhotosList photos={this.props.album.photos.items} onDeletePhoto={this.props.onDeletePhoto} />

        {
          this.props.hasMorePhotos &&
          <Divider horizontal>
            <Button
              onClick={this.props.loadMorePhotos}
              icon='refresh'
              disabled={this.props.loadingPhotos}
              content={this.props.loadingPhotos ? 'Loading...' : 'Load more photos'}
            />
          </Divider>
        }
      </Segment>
    )
  }
}

export default AlbumDetails;