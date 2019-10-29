import React, { Component } from 'react';
import { Segment, Grid, List, Label, Button, Header, Divider } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { formatDate } from '../util';

const GetPhoto = `query GetPhoto($id: ID!) {
  getPhoto(id: $id) {
    id
    createdAt
    thumbnail {
      width
      height
      key
    }
    fullsize {
      width
      height
      key
    }
    labels
    words
    faces
  }
}
`;

class PhotoInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoData: null,
      isLoading: true
    }
  }

  async loadPhoto() {
    try {
      const { data } = await API.graphql(graphqlOperation(GetPhoto, { id: this.props.id }));
      console.log('API return: ', data);
      this.setState({ photoData: data.getPhoto, isLoading: false });
    } catch (err) {
      console.error(err);
      return;
    }
  }

  displayArray = (data) => {
    if (data.length <= 0) return (<>None</>);
      
    return (
      <>
        <List as='ol'>
          {
            data.map(
              (item, i) => {
                return (
                  <List.Item as='li' value='*' key={i}>
                    {item}
                  </List.Item>
                )
              })
          }
        </List>
      </>
    )
  }

  dispEmotions(emotions) {
    return emotions.filter(item => item.Confidence > 20).map((item, i) => (
      <Button labelPosition='right' key={i}><Label color='pink' size='medium'>{item.Type}</Label><Label pointing='left' color='grey' size='tiny'>{item.Confidence.toFixed() + '%'}</Label></Button>)
    );
  }

  displayOneFace = (data) => {
    return (
      <>
        {/* <Button.Group as='div' color='teal' size='medium'> */}
        {/* <Label.Group color='teal' size='medium'> */}
        {data.Beard.Value && (<Button labelPosition='right'><Label color='teal' size='medium'>Beard</Label><Label pointing='left' color='grey' size='mini'>{data.Beard.Confidence.toFixed() + '%'}</Label></Button>)}

        {data.Mustache.Value && (<Button labelPosition='right'><Label color='teal' size='medium'>Mustache</Label><Label pointing='left' color='grey' size='mini'>{data.Mustache.Confidence.toFixed() + '%'}</Label></Button>)}

        {data.Sunglasses.Value && (<Button labelPosition='right'><Label color='teal' size='medium'>Sunglasses</Label><Label pointing='left' color='grey' size='mini'>{data.Sunglasses.Confidence.toFixed() + '%'}</Label></Button>)}

        {data.Eyeglasses.Value && (<Button labelPosition='right'><Label color='teal' size='medium'>Eyeglasses</Label><Label pointing='left' color='grey' size='mini'>{data.Eyeglasses.Confidence.toFixed() + '%'}</Label></Button>)}

        {data.Smile.Value && (<Button labelPosition='right'><Label color='teal' size='medium'>Smile</Label><Label pointing='left' color='grey' size='mini'>{data.Smile.Confidence.toFixed() + '%'}</Label></Button>)}

        <Button labelPosition='right'><Label color='teal' size='medium'>{data.Gender.Value}</Label><Label pointing='left' color='grey' size='mini'>{data.Gender.Confidence.toFixed() + '%'}</Label></Button>

        <Button labelPosition='right'><Label color='teal' size='medium'>Age</Label><Label pointing='left' color='grey' size='mini'>{data.AgeRange.Low} ~ {data.AgeRange.High}</Label></Button>

        {this.dispEmotions(data.Emotions)}

        {/* </Label.Group> */}
        {/* </Button.Group> */}
      </>
    )
  }

  displayMultiFaces(faceData) {
    return faceData.map((item, i) =>
      (<Segment key={i}>
        <div>Face #{i + 1} {i===0 && '(with confidenve level)'}</div>
        {this.displayOneFace(JSON.parse(item))}
      </Segment>
      )
    )
  }

  componentDidMount() {
    console.log('PhotoInfo: id=', this.props.id)
    this.loadPhoto();
  }

  render() {
    if (this.state.isLoading) return "Loading ...";

    return (
      <Grid stackable columns={2}>
        <Grid.Column>
          <S3Image
            imgKey={this.state.photoData.fullsize.key.replace('public/', '')}
            theme={{ photoImg: { width: '100%' } }}
          />
        </Grid.Column>
        <Grid.Column>
          <Segment>
            <Segment>
              Photo size: {this.state.photoData.fullsize.width}x{this.state.photoData.fullsize.height} | 
              Uploaded at: {formatDate(this.state.photoData.createdAt)}
            </Segment>

            <Segment inverted><Header as='h3' inverted color='olive'>Object and Scene Recognition:</Header></Segment>
            {this.displayArray(this.state.photoData.labels)}

            <Segment inverted><Header as='h3' inverted color='olive'>Words and Numbers Recognition:</Header></Segment>
            {this.displayArray(this.state.photoData.words)}

            <Segment inverted><Header as='h3' inverted color='olive'>Facial Recognition:</Header></Segment>
            {this.state.photoData.faces && this.state.photoData.faces.length>0 && this.displayMultiFaces(this.state.photoData.faces)}
          </Segment>
        </Grid.Column >
      </Grid >
    )
  }
}

export default PhotoInfo;