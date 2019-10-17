import React, { Component } from 'react';
import { Connect } from 'aws-amplify-react';
import { graphqlOperation } from 'aws-amplify';
import AlbumsList from './AlbumList';

class AlbumsListLoader extends Component {
  onNewAlbum = (prevQuery, newData) => {
    // When we get data about a new album, we need to put in into an object 
    // with the same shape as the original query results, but with the new data added as well
    console.log('Inside onNewAlbum')
    let updatedQuery = Object.assign({}, prevQuery);
    updatedQuery.listAlbums.items = prevQuery.listAlbums.items.concat([newData.onCreateAlbum]);
    //console.log(JSON.stringify(updatedQuery))
    return updatedQuery;
  }

  render() {
    const ListAlbums = `query ListAlbums {
      listAlbums(limit: 9999) {
          items {
              id
              name
          }
      }
    }`;

    const SubscribeToNewAlbums = `
    subscription OnCreateAlbum($owner: String!) {
      onCreateAlbum (owner: $owner) {
        id
        name
      }
    }
    `;
    console.log('Inside AlbumsListLoader render() ', this.props)

    return (
      <Connect
        query={graphqlOperation(ListAlbums)}
        subscription={graphqlOperation(SubscribeToNewAlbums, { owner: this.props.owner })}
        onSubscriptionMsg={this.onNewAlbum}
      >
        {({ data, loading, err }) => {
          if (loading) { return <div>Loading...</div>; }
          if (err) console.log(err);
          if (!data.listAlbums) return;

          return <AlbumsList albums={data.listAlbums.items} />;
        }}
      </Connect>
    );
  }
}

export default AlbumsListLoader;