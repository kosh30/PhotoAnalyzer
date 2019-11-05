import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Divider, Label, Icon, Card } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
import { formatDate } from '../util';

class PhotosList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhoto: null
    };
  }

  handlePhotoClick = (photo) => {
    this.setState({
      selectedPhoto: photo
    });
  }

  handleDelete = (photo) => {
    this.props.onDeletePhoto(photo);
  }

  photoItems() {
    console.log("photoItems(): ", this.props.photos)
    return this.props.photos.map(photo => {
      return (
        <Card key={photo.thumbnail.key} raised>
          <Card.Content>

            <NavLink to={`/photos/${photo.id}`}>
              <S3Image
                imgKey={photo.thumbnail.key.replace('public/', '')}
              />
            </NavLink>
            <Label size='tiny' floating>
              <Icon name='delete' onClick={() => this.handleDelete(photo)} />
            </Label>
            <Card.Description style={{fontSize:'0.6em'}}>
              Uploaded at: 
              <p>{formatDate(photo.createdAt)}</p>
            </Card.Description>
          </Card.Content>
        </Card>
      )
    });
  }

  render() {
    return (
      <>
        <Divider hidden />
        <Card.Group stackable itemsPerRow='10'>
          {this.photoItems()}
        </Card.Group>
      </>
    );
  }
}

export default PhotosList;