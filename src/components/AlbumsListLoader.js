import React, { Component } from 'react';
import { Connect } from 'aws-amplify-react';
import { graphqlOperation } from 'aws-amplify';
import AlbumsList from './AlbumList';
import { Message } from 'semantic-ui-react';

class AlbumsListLoader extends Component {
  onNewAlbum = (prevQuery, newData) => {
    //console.log('Inside onNewAlbum')
    let updatedQuery = Object.assign({}, prevQuery);
    updatedQuery.listAlbums.items = prevQuery.listAlbums.items.concat([newData.onCreateAlbum]);
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
          if (loading)
            return <div>Loading...</div>;
          if (err) {
            console.log(err);
            return (<Message
              header='Sorry'
              content={err.errors[0].message}
              onDismiss={() => this.setState({ errorMsg: '' })}
            />)
          }
          if (data.listAlbums.items.length < 1)
            return <div>Please start by creating an album.</div>;

          return <AlbumsList albums={data.listAlbums.items} />;
        }}
      </Connect>
    );
  }
}

export default AlbumsListLoader;