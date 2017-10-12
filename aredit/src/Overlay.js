import React, { Component } from 'react';
import './Overlay.css';

export default class Overlay extends Component {
  render() {
    return (
      <div className='Overlay' onClick={this.clickedOverlay.bind(this)}>
        <div className='_OverlayWindow'>
          {this.props.children}
        </div>
      </div>
    )
  }
  clickedOverlay(e) {
    if (e.target === e.currentTarget) this.props.onDismiss();
  }
}
