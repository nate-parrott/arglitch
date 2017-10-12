import React, { Component } from 'react';
import './StretchControl.css';
import FontAwesome from 'react-fontawesome';
import { clampScale } from './util';

export default class StretchControl extends Component {
  render() {
    return (
      <div className='StretchControl' onTouchStart={this.touchStart.bind(this)} onTouchMove={this.touchMove.bind(this)} onTouchEnd={this.touchEnd.bind(this)}>
        <div>
          <div className='icon'><FontAwesome name='arrows' /></div>
          <h2>Drag horizontally or vertically to stretch the object</h2>
        </div>
      </div>
    )
  }
  touchStart(e) {
    e.preventDefault();
    this.posAtStartOfGesture = {x: e.touches[0].screenX, y: e.touches[0].screenY};
    this.scaleAtStartOfGesture = this.props.getEntityValue().scale || {x: 1, y: 1, z: 1};
  }
  touchMove(e) {
    e.preventDefault();
    let pos = {x: e.touches[0].screenX, y: e.touches[0].screenY};
    let delta = {x: pos.x - this.posAtStartOfGesture.x, y: pos.y - this.posAtStartOfGesture.y};
    let k = 0.01;
    let s = this.scaleAtStartOfGesture;
    let newScale = {
      x: clampScale(s.x + delta.x * k), 
      y: clampScale(s.y - delta.y * k), 
      z: s.z
    };
    this.props.entityRef.child('scale').set(newScale);
  }
  touchEnd(e) {
    e.preventDefault();
  }
}
