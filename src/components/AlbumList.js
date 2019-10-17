import React, { Component } from 'react';
import { Header, List, Segment } from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';
import { makeComparator } from '../util';

class AlbumsList extends Component {
  albumItems() {
    return this.props.albums.sort(makeComparator('name')).map(album =>
      <List.Item key={album.id}>
        <NavLink to={`/albums/${album.id}`}>{album.name}</NavLink>
      </List.Item>
    );
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>My Albums</Header>
        <List divided relaxed>
          {this.albumItems()}
        </List>
      </Segment>
    );
  }
}

export default AlbumsList;