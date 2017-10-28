import React, { Component } from 'react';
let equal = require('fast-deep-equal');

export default class CanvasRenderer extends Component {
  constructor(props) {
    super(props);
    this.lastDrawnProps = null;
    this.requestedRedraw = false;
  }
  render() {
    this.dirty();
    if (this.props.externalCanvas) return null;
    return <canvas width={this.props.width} height={this.props.height} ref={(c) => {this.canvas = c}} />;
  }
  dirty() {
    if (!this.requestedRedraw) {
      this.requestedRedraw = true;
      window.requestAnimationFrame(() => {
        this.draw();
      })
    }
  }
  draw() {
    if (!equal(this.lastDrawnProps, this.props)) {
      let canvas = this.props.externalCanvas || this.canvas;
      if (canvas) {
        this.props.draw(canvas.getContext('2d'), this.props);
        this.lastDrawnProps = this.props;
      }
    }
    this.requestedRedraw = false;
  }
}
