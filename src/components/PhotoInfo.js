import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';

class PhotoInfo extends Component {
  render() {
    console.log('labels: ', this.props.photo.labels);
    console.log('words: ', this.props.photo.words);

    return (
      <Segment>
        <>
          {JSON.stringify(this.props.photo.labels)}
        </>
        <>
          {JSON.stringify(this.props.photo.words)}
        </>
      </Segment>
    )
  }
}

export default PhotoInfo;