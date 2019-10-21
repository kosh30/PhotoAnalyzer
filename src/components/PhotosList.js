import React, { Component } from 'react';
import { Divider } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
import Lightbox from './Lightbox';

class PhotosList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPhoto: null
    };
  }
  
  handlePhotoClick = (photo) => {
    console.log("selected photo = ",photo)
    this.setState({
      selectedPhoto: photo
    }); 
  }
  
  handleLightboxClose = () => {
    this.setState({
      selectedPhoto: null
    }); 
  }

  photoItems() {
    console.log("photoItems: ", this.props.photos)
    return this.props.photos.map(photo =>
      <S3Image 
        key={photo.thumbnail.key} 
        imgKey={photo.thumbnail.key.replace('public/', '')} 
        style={{ display: 'inline-block', 'paddingRight': '5px' }}
        onClick={this.handlePhotoClick.bind(this, photo)}
      />
    );
  }

  render() {
    return (
      <div>
        <Divider hidden />
        {this.photoItems()}
        <Lightbox photo={this.state.selectedPhoto} onClose={this.handleLightboxClose} />
      </div>
    );
  }
}

export default PhotosList;