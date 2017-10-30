import { Component } from 'react';
import { Euler, Matrix4 } from 'three';

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
    this.observer = this.valueChanged.bind(this);
    this.props.firebaseRef.on('value', this.observer);
  }
  componentWillUnmount() {
    if (this.observer) {
      this.props.firebaseRef.off('value', this.observer);
      this.observer = null;
    }
  }
  valueChanged(snapshot) {
    this.setState({value: snapshot.val()});
  }
  render() {
    return this.props.render(this.state.value);
  }
}

export let applyRotation = (existingRotation, aboutAxis, angle) => {
  // aboutAxis is either 'x', 'y' or 'z'
  // inputs in degrees:
  let e = new Euler(degToRad(existingRotation.x), degToRad(existingRotation.y), degToRad(existingRotation.z), 'YXZ');
  
  let existingRotationMatrix = new Matrix4();
  existingRotationMatrix.makeRotationFromEuler(e);
  
  let newRotation = new Matrix4();
  if (aboutAxis === 'x') {
    newRotation.makeRotationX(degToRad(angle));
  } else if (aboutAxis === 'y') {
    newRotation.makeRotationY(degToRad(angle));
  } else if (aboutAxis === 'z') {
    newRotation.makeRotationZ(degToRad(angle));
  }
  
  newRotation.multiply(existingRotationMatrix);
  // existingRotationMatrix.multiply(newRotation);
  e.setFromRotationMatrix(newRotation, 'YXZ');
  
  return {x: radToDeg(e.x), y: radToDeg(e.y), z: radToDeg(e.z)};
}

export let deduplicateStringArray = (array) => {
  let seen = {};
  return array.filter((val) => {
    if (seen[val]) return false;
    seen[val] = true;
    return true;
  });
}
