import React, { Component } from 'react';
import { Container, Modal, Segment } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
import PhotoInfo from './PhotoInfo';

class Lightbox extends Component {
  render() {
    return (
      <Modal
        open={this.props.photo !== null}
        onClose={this.props.onClose}
      >
        <Modal.Content>
          <Container textAlign='center'>
            {
              this.props.photo ?
                <Segment>
                  <S3Image
                    imgKey={this.props.photo.fullsize.key.replace('public/', '')}
                    theme={{ photoImg: { maxWidth: '100%' } }}
                    onClick={this.props.onClose}
                  />
                  <PhotoInfo photo={this.props.photo} />
                </Segment>
                :
                null
            }
          </Container>
        </Modal.Content>
      </Modal>
    );
  }
}

export default Lightbox;