import React, { Component } from 'react';
let equal = require('fast-deep-equal');

export default class CanvasRenderer extends Component {
  constructor(props) {
    super(props);
    this.lastDrawnProps = null;
    this.requestedRedraw = false;
    this.internalCanvas = this.props.renderToImageUrl ? document.createElement('canvas') : null;
  }
  render() {
    this.dirty();
    if (this.props.externalCanvas || this.props.renderToImageUrl) return null;
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
    let props = this.props.renderProps || {};
    if (!equal(this.lastDrawnProps, props)) {
      let canvas = this.props.externalCanvas || this.internalCanvas || this.canvas;
      if (this.internalCanvas) {
        this.internalCanvas.width = this.props.width;
        this.internalCanvas.height = this.props.height;
      }
      if (canvas) {
        this.props.draw(canvas.getContext('2d'), props);
        this.lastDrawnProps = props;
        if (this.internalCanvas) {
          this.props.renderToImageUrl(this.internalCanvas.toDataURL('image/png'));
        }
      }
    }
    this.requestedRedraw = false;
  }
}
