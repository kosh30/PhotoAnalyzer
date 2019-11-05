import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Header, Input, Segment, Message } from 'semantic-ui-react';


class NewAlbum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumName: '',
      errorMsg: ''
    };
  }

  handleChange = (event) => {
    this.setState({ albumName: event.target.value });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const NewAlbum = `mutation NewAlbum($name: String!) {
      createAlbum(input: {name: $name}) {
        id
        name
        owner
      }
    }`;
    try {
      const result = await API.graphql(graphqlOperation(NewAlbum, { name: this.state.albumName }));
      console.log('NewAlbum result: ', result)
      this.setState({ albumName: '', errorMsg: '' })
    } catch (err) {
      console.error(err);
      this.setState({ errorMsg: err.errors[0].message });
    }
  }

  render() {
    if (this.state.errorMsg)
      return (<Message
        header='Sorry'
        content={this.state.errorMsg}
        onDismiss={() => this.setState({ albumName: '', errorMsg: '' })
        }
      />)

    return (
      <Segment>
        <Header as='h4'>Add a new album</Header>
        <Input
          type='text'
          placeholder='New Album Name'
          icon='plus'
          iconPosition='left'
          action={{ content: 'Create', onClick: this.handleSubmit }}
          name='albumName'
          value={this.state.albumName}
          onChange={this.handleChange}
        />
      </Segment>
    )
  }
}

export default NewAlbum;