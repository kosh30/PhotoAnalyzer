import React, {Component} from 'react';
import { Grid } from 'semantic-ui-react';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import NewAlbum from './components/NewAlbum';
import AlbumDetailsLoader from './components/AlbumDetailsLoader';
import AlbumsListLoader from './components/AlbumsListLoader';
import Search from './components/Search';
import PhotoInfo from './components/PhotoInfo';

Amplify.configure(aws_exports);

class App extends Component {
  render() {
    console.log('App: ', this.props);

    return (
      <Router>
        <Grid padded>
          <Grid.Column>
            <Route path="/" exact component={NewAlbum} />
            <Route path="/" exact
              render={() => <AlbumsListLoader owner={this.props.authState==='signedIn'?this.props.authData.username:null} /> }
            />
            <Route path="/" exact component={Search}/>

            <Route
              path="/albums/:albumId"
              render={() => <div><NavLink to='/'>Back to Albums list</NavLink></div>}
            />
            <Route
              path="/albums/:albumId"
              render={props => <AlbumDetailsLoader
                id={props.match.params.albumId}
                owner={this.props.authData.username}
              />}
            />

            <Route
              path="/photos/:photoId"
              render={() => <div><NavLink to='/'>Back to Albums list</NavLink></div>}
            />
            <Route
              path="/photos/:photoId"
              render={props => <PhotoInfo
                id={props.match.params.photoId}
                owner={this.props.authData.username}
              />}
            />

          </Grid.Column>
        </Grid>
      </Router>
    );
  };
}

export default withAuthenticator(App, {includeGreetings: true});
