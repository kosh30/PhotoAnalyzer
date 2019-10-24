import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Divider, Segment, Label, Icon } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
// import Lightbox from './Lightbox';

class PhotosList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhoto: null
    };
  }

  handlePhotoClick = (photo) => {
    console.log("selected photo = ", photo)
    this.setState({
      selectedPhoto: photo
    });
  }

  handleLightboxClose = () => {
    this.setState({
      selectedPhoto: null
    });
  }

  handleDelete = (photo) => {
    console.log("Deleting: ", photo)
    this.props.onDeletePhoto(photo);
  }

  photoItems() {
    console.log("photoItems: ", this.props.photos)
    return this.props.photos.map(photo => {
      return (
        <Segment key={photo.thumbnail.key}
          style={{ display: 'inline-block', 'paddingRight': '10px' }}
        >
          <NavLink to={`/photos/${photo.id}`}>
            <S3Image
              imgKey={photo.thumbnail.key.replace('public/', '')}
            // onClick={this.handlePhotoClick.bind(this, photo)}
            />
          </NavLink>
          <Label size='tiny' floating>
              <Icon name='delete' onClick={()=>this.handleDelete(photo)}/>
          </Label>
        </Segment>
      )
    });
  }

  render() {
    return (
      <div>
        <Divider hidden />
        {this.photoItems()}
        {/* <Lightbox photo={this.state.selectedPhoto} onClose={this.handleLightboxClose} /> */}
      </div>
    );
  }
}

export default PhotosList;