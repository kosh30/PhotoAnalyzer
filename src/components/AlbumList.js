import React, { Component } from 'react';
import { Header, Icon, Segment, Card } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { makeComparator } from '../util';

class AlbumsList extends Component {
  albumItems() {
    return this.props.albums.sort(makeComparator('name')).map(album =>
      <Card raised color='teal' key={album.id}>
        <Header as='h5' icon>
          <NavLink to={`/albums/${album.id}`}>
            <Icon name='th' />
            {album.name}
          </NavLink>
        </Header>
      </Card>
    );
  }

  render() {
    return (
      <Segment>
        <Header as='h2' color='teal'>My Albums</Header>
        {/* <List divided relaxed> */}
        <Card.Group itemsPerRow='6'>
          {this.albumItems()}
        </Card.Group>
      </Segment>
    );
  }
}

export default AlbumsList;