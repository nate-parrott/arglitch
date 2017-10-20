import { Component } from 'react';

export let radToDeg = (rad) => {
  return rad / Math.PI * 180;
}

export let degToRad = (deg) => {
  return deg * Math.PI / 180;
}

export let scaleAllAxes = ({x,y,z}, scale) => {
  return {x: x*scale, y: y*scale, z: z*scale};
}

export let vecToAFramePosition = (vec) => {
  return {x: vec.x, y: vec.y, z: vec.z};
}

export let vecToAFrameRotation = (vec) => {
  return {x: radToDeg(vec.x), y: radToDeg(vec.y), z: radToDeg(vec.z)};
}

export let clampScale = (s) => Math.max(0.05, Math.min(500, s));

export let loadImage = (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = src; 
  });
}

export class FirebaseObserver extends Component {
  // props: firebaseRef and render(value)
  constructor(props) {
    super(props);
    this.state = {value: null};
  }
  componentDidMount() {
    this.props.firebaseRef.on('value', this.valueChanged.bind(this));
  }
  componentWillUnmount() {
    this.props.firebaseRef.off('value', this.valueChanged.bind(this));
  }
  valueChanged(snapshot) {
    this.setState({value: snapshot.val()});
  }
  render() {
    return this.props.render(this.state.value);
  }
}
