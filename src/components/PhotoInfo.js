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
      isLoading: true,
      facesShown: false,
      hasFaces: false
    }

    this.img = null;
    this.canvas = null;
  }

  loadPhoto = async () => {
    try {
      const { data } = await API.graphql(graphqlOperation(GetPhoto, { id: this.props.id }));
      console.log('API return: ', data);
      const hasFaces = (data.getPhoto.faces && data.getPhoto.faces.length > 0);
      this.setState({ photoData: data.getPhoto, isLoading: false, hasFaces });
      this.draw();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  draw = () => {
    if (this.canvas) this.clearCanvas();
    else {
      this.img = document.getElementById('pic');
      this.canvas = document.getElementById('canvas');
    
      this.canvas.width = this.img.offsetWidth;
      this.canvas.height = this.img.offsetWidth * (this.state.photoData.fullsize.height / this.state.photoData.fullsize.width);
      this.canvas.style.position = "absolute";
      this.canvas.style.left = this.img.offsetLeft + "px";
      this.canvas.style.top = this.img.offsetTop + "px";
    }
    //console.log('canvas:',this.canvas);

    var ctx = this.canvas.getContext("2d");
    //     ctx.lineWidth = 3;
    // ctx.strokeStyle = '#00ff00';
    // ctx.beginPath();
    // ctx.arc(250, 210, 200, 0, 2 * Math.PI, false);
    // ctx.stroke();
    const { faces } = this.state.photoData;
    faces.forEach(face => {
      const pbox = JSON.parse(face).BoundingBox;
      //console.log('pbox: ', pbox)
      const Left = pbox.Left * this.img.offsetWidth;
      const Top = pbox.Top * this.canvas.offsetHeight;
      const Width = pbox.Width * this.img.offsetWidth;
      const Height = pbox.Height * this.canvas.offsetHeight;
      const box = { Left, Top, Width, Height };
      //console.log('box: ', box)

      // const Left = 0;
      // const Top = 0;
      // const Width = 200;
      // const Height = 10;
      // const box = { Left, Top, Width, Height };

      // ctx.moveTo(box.Left, box.Top);
      // ctx.lineTo(box.Left + box.Width, box.Top);
      // ctx.lineTo(box.Left + box.Width, box.Top + box.Height);
      // ctx.lineTo(box.Left, box.Top + box.Height);
      // ctx.lineTo(box.Left, box.Top);
      ctx.fillStyle = "rgba(0, 181, 173, 0.4)";
ctx.fillRect(box.Left, box.Top, box.Width, box.Height);

    });
    ctx.stroke();
    this.setState({ facesShown: true })
  }

  clearCanvas = () => {
    var context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setState({ facesShown: false })
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

  dispEmotions = (emotions) => {
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

  displayMultiFaces = (faceData) => {
    return (
      (faceData.map((item, i) =>
        (<Segment key={i}>
          <div>Face #{i + 1} {i === 0 && '(with confidenve level)'}</div>
          {this.displayOneFace(JSON.parse(item))}
        </Segment>
        )
      ))
    )
  }

  displayButton = () => {
    console.log('displayButton: ',this.state.facesShown)
    return (
      <Button size='mini' floated='right' onClick={this.state.facesShown ? this.clearCanvas : this.draw}
        disabled={!this.state.hasFaces} style={{ marginLeft: '10px' }}>
        {this.state.facesShown ? 'Clear' : 'Mark the image'}
      </Button>
    )
  }

  componentDidMount() {
    console.log('PhotoInfo: id=', this.props.id)
    this.loadPhoto();
  }

  render() {
    if (this.state.isLoading) return "Loading ...";
console.log('render() called')
    return (
      <Grid stackable columns={2}>
        <Grid.Column>
          <div id='pic'>
            <S3Image
              imgKey={this.state.photoData.fullsize.key.replace('public/', '')}
              theme={{ photoImg: { width: '100%' } }}
            />
          </div>
          <canvas id='canvas'/>
        </Grid.Column>
        <Grid.Column>
          <Segment>
            {/* <Segment> */}
            Photo size: {this.state.photoData.fullsize.width}x{this.state.photoData.fullsize.height} |
              Uploaded at: {formatDate(this.state.photoData.createdAt)}
            {/* </Segment> */}

            <Segment inverted><Header as='h3' inverted color='olive'>Object and Scene Recognition:</Header></Segment>
            {this.displayArray(this.state.photoData.labels)}

            <Segment inverted><Header as='h3' inverted color='olive'>Words and Numbers Recognition:</Header></Segment>
            {this.displayArray(this.state.photoData.words)}

            <Segment inverted><Header as='h3' inverted color='olive'>Facial Recognition: <Button size='mini' floated='right' style={{ marginLeft: '10px' }}
              onClick={this.state.facesShown ? this.clearCanvas : this.draw}
              disabled={!this.state.hasFaces} 
              content={this.state.facesShown ? 'Clear' : 'Mark the image'} />
      </Header></Segment>
            {this.state.hasFaces && this.displayMultiFaces(this.state.photoData.faces)}
          </Segment>
        </Grid.Column >
      </Grid >
    )
  }
}

export default PhotoInfo;