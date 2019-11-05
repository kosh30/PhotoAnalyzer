import React, { Component } from 'react';
import { Segment, Grid, List, Header, Message } from 'semantic-ui-react';
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
    searchPhrases
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
      hasFaces: false,
      wordsShown: false,
      hasWords: false,
      errorMsg: ''
    }

    this.img = null;
    this.canvasData = [];
  }

  loadPhoto = async () => {
    try {
      let { data } = await API.graphql(graphqlOperation(GetPhoto, { id: this.props.id }));
      let photoData = data.getPhoto;
      //console.log('API return: ', photoData);
      const hasFaces = (photoData.faces && photoData.faces.length > 0);
      const hasWords = (photoData.words && photoData.words.length > 0);
      hasFaces && (photoData.faces = photoData.faces.map(item => JSON.parse(item)));
      hasWords && (photoData.words = photoData.words.map(item => JSON.parse(item)));
      photoData.labels = photoData.labels.map(item => JSON.parse(item));
      console.log('API after JSON: ', photoData);

      this.setState({ photoData, isLoading: false, hasFaces, hasWords });
    } catch (err) {
      console.error(err);
      this.setState({ errorMsg: err.errors[0].message });
    }
  }

  draw = (cnum) => {
    if (!this.canvasData[0]) {
      this.img = document.getElementById('pic');
      this.canvasData[0] = {
        canvas: document.getElementById('canvas0'),
        context: document.getElementById('canvas0').getContext('2d')
      };
      this.canvasData[1] = {
        canvas: document.getElementById('canvas1'),
        context: document.getElementById('canvas1').getContext('2d')
      };

      this.canvasData.forEach(item => {
        item.canvas.width = this.img.offsetWidth;
        item.canvas.height = this.img.offsetWidth * (this.state.photoData.fullsize.height / this.state.photoData.fullsize.width);
        item.canvas.style.position = "absolute";
        item.canvas.style.left = this.img.offsetLeft + "px";
        item.canvas.style.top = this.img.offsetTop + "px";
      })
    }

    //if ((cnum===0 && this.facesShown) || (cnum===1 && this.wordsShown)) this.clearCanvas(cnum);

    // ctx.lineWidth = 3;
    // ctx.strokeStyle = '#00ff00';
    // ctx.beginPath();
    // ctx.arc(250, 210, 200, 0, 2 * Math.PI, false);
    // ctx.stroke();
    let info = null;
    if (cnum === 0) {
      info = this.state.photoData.faces;
      this.setState({ facesShown: true });
    } else if (cnum === 1) {
      info = this.state.photoData.words;
      this.setState({ wordsShown: true })
    }

    info.forEach(item => {
      console.log('info item: ', item)
      let box = [];
      if (cnum === 1) box = item.Geometry.Polygon;
      else if (cnum === 0) {
        box = [
          { X: item.BoundingBox.Left, Y: item.BoundingBox.Top },
          { X: item.BoundingBox.Left + item.BoundingBox.Width, Y: item.BoundingBox.Top },
          { X: item.BoundingBox.Left + item.BoundingBox.Width, Y: item.BoundingBox.Top + item.BoundingBox.Height },
          { X: item.BoundingBox.Left, Y: item.BoundingBox.Top + item.BoundingBox.Height }
        ];
      }

      box = box.map(item => {
        return { X: item.X * this.img.offsetWidth, Y: item.Y * this.canvasData[0].canvas.offsetHeight }
      })

      this.canvasData[cnum].context.moveTo(box[0].X, box[0].Y);
      this.canvasData[cnum].context.lineTo(box[1].X, box[1].Y);
      this.canvasData[cnum].context.lineTo(box[2].X, box[2].Y);
      this.canvasData[cnum].context.lineTo(box[3].X, box[3].Y);
      this.canvasData[cnum].context.lineTo(box[0].X, box[0].Y);

      // ctx.fillStyle = "rgba(0, 181, 173, 0.4)";
      // ctx.fillRect(box.Left, box.Top, box.Width, box.Height);
    });
    console.log('befroe strokeStyle: ', this.canvasData[0].context.strokeStyle)
    this.canvasData[0].context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    this.canvasData[0].context.lineWidth = 3;
    this.canvasData[1].context.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    this.canvasData[1].context.lineWidth = 3;
    console.log('after strokeStyle: ', this.canvasData[0].context.strokeStyle)

    this.canvasData[cnum].context.stroke();
  }

  clearCanvas = (cnum) => {
    if (this.canvasData.length <= 0 || !this.canvasData[cnum]) return;
    this.canvasData[cnum].context.clearRect(0, 0, this.canvasData[cnum].canvas.width, this.canvasData[cnum].canvas.height);
    cnum === 0 && this.setState({ facesShown: false });
    cnum === 1 && this.setState({ wordsShown: false });
  }

  displayArray = (data) => {
    if (data.length <= 0) return (<>None</>);
    //console.log(data)
    return (
      <>
        <List bulleted animated>
          {
            data.map(
              (item, i) => {
                return (
                  <List.Item key={i}>
                    {item[0]} ({item[1]})
                  </List.Item>
                )
              })
          }
        </List>
      </>
    )
  }

  dispEmotions = (emotions) => {
    return (
      (<List.Content>
        <List.List>
          {emotions.filter(item => this.state.photoData.searchPhrases.indexOf(item.Type.toLowerCase()) > -1).map((item, i) => (
            <List.Item key={i}>{item.Type} ({item.Confidence.toFixed() + '%'})</List.Item>
          ))
          }
        </List.List>
      </List.Content>)
    )
  }

  displayOneFace = (data) => {
    return (
      <List bulleted animated>
        {data.Beard.Value && <List.Item >Beard ({data.Beard.Confidence.toFixed() + '%'})</List.Item>}
        {data.Mustache.Value && <List.Item >Mustache ({data.Mustache.Confidence.toFixed() + '%'})</List.Item>}
        {data.Sunglasses.Value && <List.Item >Sunglasses ({data.Sunglasses.Confidence.toFixed() + '%'})</List.Item>}
        {data.Eyeglasses.Value && <List.Item >Eyeglasses ({data.Eyeglasses.Confidence.toFixed() + '%'})</List.Item>}
        {data.Smile.Value && <List.Item >Smile ({data.Smile.Confidence.toFixed() + '%'})</List.Item>}
        <List.Item >{data.Gender.Value} ({data.Gender.Confidence.toFixed() + '%'})</List.Item>
        <List.Item >Age: {data.AgeRange.Low} ~ {data.AgeRange.High}</List.Item>
        <List.Item >Emotions: </List.Item>
        {this.dispEmotions(data.Emotions)}
      </List>
    )
  }

  displayMultiFaces = (faceData) => {
    return (
      (faceData.map((item, i) =>
        (<Segment key={i}>
          <div>Face #{i + 1}</div>
          {this.displayOneFace(item)}
        </Segment>
        )
      ))
    )
  }

  displayButton = (cnum) => {
    let disabled = true, content = '', shown = false;
    switch (cnum) {
      case 0:
        disabled = !this.state.hasFaces;
        content = this.state.facesShown ? 'Clear' : 'Mark on image';
        shown = this.state.facesShown;
        break;
      case 1:
        disabled = !this.state.hasWords;
        content = this.state.wordsShown ? 'Clear' : 'Mark on image';
        shown = this.state.wordsShown;
        break;
      default:

    }

    return (
      // <Button size='mini' floated='right' onClick={shown ?
      //   () => this.clearCanvas(cnum) : () => this.draw(cnum)}
      //   disabled={disabled}>
      // {content}
      // </Button>
      <button className="ui basic button inverted right floated mini" onClick={shown ? () => this.clearCanvas(cnum) : () => this.draw(cnum)} disabled={disabled}>
        {content}
      </button>
    )
  }

  componentDidMount() {
    console.log('cmpDidMount: PhotoInfo: id=', this.props.id)
    this.loadPhoto();
  }

  render() {
    if (this.state.isLoading) return "Loading ...";
    if (this.state.errorMsg)
      return (<Message
        header='Sorry'
        content={this.state.errorMsg}
        onDismiss={() => this.setState({ errorMsg: '' })
        }
      />)

    return (
      <Grid stackable columns={2}>
        <Grid.Column>
          <div id='pic'>
            <S3Image
              imgKey={this.state.photoData.fullsize.key.replace('public/', '')}
              theme={{ photoImg: { width: '100%' } }}
            />
          </div>
          <canvas id='canvas0' />
          <canvas id='canvas1' />
        </Grid.Column>
        <Grid.Column>
          <Segment>
            <p>Photo size: {this.state.photoData.fullsize.width}x{this.state.photoData.fullsize.height} |
              Uploaded at: {formatDate(this.state.photoData.createdAt)}</p>
            <i>(Percentage numbers indicate confidence)</i>

            <Segment inverted color='grey' style={{ paddingTop: '8px', paddingBottom: '8px' }}><Header as='h3' color='olive'>Object and Scene Recognition:</Header></Segment>
            {this.displayArray(this.state.photoData.labels.map(item => [item.Name, item.Confidence.toFixed() + '%'])
            )}

            <Segment inverted color='grey' style={{ paddingTop: '8px', paddingBottom: '8px' }}><Header as='h3' color='olive'>Words and Numbers Recognition: {this.displayButton(1)}</Header></Segment>
            {this.displayArray(this.state.photoData.words.map(item => {
              return [item.DetectedText, item.Confidence.toFixed() + '%']
            })
            )}

            <Segment inverted color='grey' style={{ paddingTop: '8px', paddingBottom: '8px' }}>
              <Header as='h3' color='olive'>Facial Recognition: {this.displayButton(0)}
              </Header>
            </Segment>
            {this.state.hasFaces && this.displayMultiFaces(this.state.photoData.faces)}
          </Segment>
        </Grid.Column >
      </Grid >
    )
  }
}

export default PhotoInfo;