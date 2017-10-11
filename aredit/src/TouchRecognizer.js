import React, { Component } from 'react';

export default class TouchRecognizer extends Component {
  constructor(props) {
    super(props);
    this.reset();
  }
  render() {
    return <div onTouchStart={this.touchStart.bind(this)} onTouchMove={this.touchMove.bind(this)} onTouchEnd={this.touchEnd.bind(this)} onTouchCancel={this.touchEnd.bind(this)}>{this.props.children}</div>;
  }
  touchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.reset();
      this.props.onTouchesBegan();
    }
    let { centroid, distance } = this.computeProps(e.touches);
    this.lastCentroid = centroid;
    this.lastDistance = distance;
  }
  touchMove(e) {
    e.preventDefault();
    let { centroid, distance } = this.computeProps(e.touches);
    if (centroid && this.lastCentroid) {
      let delta = {x: centroid.x - this.lastCentroid.x, y: centroid.y - this.lastCentroid.y};
      if (e.touches.length === 1) {
        this.props.onPan(delta);
      } else if (e.touches.length === 2) {
        this.props.onTwoFingerPan(delta);
      }
    }
    if (e.touches.length === 2 && distance && this.lastDistance) {
      this.props.onScale(distance / this.lastDistance);
    }
    this.lastCentroid = centroid;
    this.lastDistance = distance;
  }
  touchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) {
      this.props.onTouchesEnded();
    }
    let { centroid, distance } = this.computeProps(e.touches);
    this.lastCentroid = centroid;
    this.lastDistance = distance;
  }
  reset() {
    this.lastCentroid = null;
    this.lastDistance = null;
  }
  computeProps(touches) {
    let centroid = {x: 0, y: 0};
    for (let touch of touches) {
      centroid.x += touch.screenX;
      centroid.y += touch.screenY;
    }
    centroid = {x: centroid.x / touches.length, y: centroid.y / touches.length};
    let distance = null;
    if (touches.length === 2) {
      distance = Math.sqrt(Math.pow(touches[0].screenX - touches[1].screenX, 2) + Math.pow(touches[0].screenY - touches[1].screenY, 2));
    }
    return {centroid, distance};
  }
}
