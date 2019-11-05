import React, { Component } from 'react';
import { v4 as uuid } from 'uuid';
import { Form } from 'semantic-ui-react';
import { Storage } from 'aws-amplify';
import { Message } from 'semantic-ui-react';

class S3ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      errorMsg: ''
    }
  }

  uploadFile = async (file) => {
    const fileName = uuid();
    try {
      const result = await Storage.put(
        fileName,
        file,
        {
          customPrefix: { public: 'uploads/' },
          //metadata: { albumid: this.props.albumId, owner: user.username }
          metadata: { albumid: this.props.albumId, owner: this.props.owner }
        }
      );
      console.log('Uploaded file: ', result);
    } catch (err) {
      console.error('S3ImageUpload: ', err);
      this.setState({ errorMsg: err.errors[0].message, uploading: false });
    }
  }

  onChange = async (e) => {
    this.setState({ uploading: true });

    let files = [];
    for (var i = 0; i < e.target.files.length; i++) {
      files.push(e.target.files.item(i));
    }
    await Promise.all(files.map(f => this.uploadFile(f)));

    this.setState({ uploading: false });
    this.props.needReloadPhotos();
  }

  render() {
    if (this.state.errorMsg)
      return (<Message
        header='Sorry'
        content={this.state.errorMsg}
        onDismiss={() => this.setState({  errorMsg: '' })
        }
      />)

    return (
      <div>
        <Form.Button
          onClick={() => document.getElementById('add-image-file-input').click()}
          disabled={this.state.uploading}
          icon='file image outline'
          content={this.state.uploading ? 'Uploading...' : 'Add Images'}
        />
        <input
          id='add-image-file-input'
          type="file"
          accept='image/*'
          multiple
          onChange={this.onChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
}

export default S3ImageUpload;