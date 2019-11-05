import React, { Component } from 'react';
import { Header, Input, Segment, Message } from 'semantic-ui-react';
import { API, graphqlOperation } from 'aws-amplify';
import PhotosList from './PhotosList';

const ListPhotos = `query listPhotos($label: String!) {
  listPhotos(filter: { searchPhrases: { contains: $label }}) {
    items {
      id
      bucket
      thumbnail {
          key
          width
          height
      }
      fullsize {
          key
          width
          height
      }
      labels
      words
      faces
    }
  }
}`;


class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      album: null,
      label: '',
      hasResults: false,
      searched: false,
      errorMsg: ''
    }
  }

  updateLabel = (e) => {
    this.setState({ label: e.target.value, searched: false });
  }

  getPhotosForLabel = async (e) => {
    console.log('Search: label=', this.state.label)
    e.preventDefault();
    try {
      var result = await API.graphql(graphqlOperation(ListPhotos, { label: this.state.label.toLowerCase() }));
    } catch (err) {
      console.error(err);
      this.setState({ errorMsg: err.errors[0].message });
    }

    let photos = [];
    let label = '';
    let hasResults = false;
    if (result.data.listPhotos.items.length !== 0) {
      hasResults = true;
      photos = result.data.listPhotos.items;
      label = this.state.label;
    }
    const searchResults = { label, photos }
    this.setState({ searchResults, hasResults, searched: true });
  }

  noResults() {
    return !this.state.searched
      ? ''
      : <Header as='h4' color='grey'>No photos found matching '{this.state.label}'</Header>
  }

  componentDidMount() {
    const input = document.getElementById("label");

    input.addEventListener("keyup", (event) => {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        this.getPhotosForLabel(event);
      }
    });
  }

  render() {
    if (this.state.errorMsg)
      return (<Message
        header='Sorry'
        content={this.state.errorMsg}
        onDismiss={() => this.setState({ errorMsg: '' })
        }
      />)

    return (
      <Segment>
        <Header as='h3'>Tag Search</Header>
        <Input
          type='text'
          placeholder='Search for photos'
          icon='search'
          iconPosition='left'
          action={{ content: 'Search', onClick: this.getPhotosForLabel }}
          name='label'
          id='label'
          value={this.state.label}
          onChange={this.updateLabel}
        />
        <p><i>Case insensitive. Search phrase must fully match a tag.</i></p>
        {
          this.state.hasResults
            ? <PhotosList photos={this.state.searchResults.photos} />
            : this.noResults()
        }
      </Segment>
    );
  }
}

export default Search;