import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import './Controls.css';

export default class Controls extends Component {
  // props: showEditWorldButton, onEditWorld, onEditObject, onAdd, onMenu, showRotationSwitches
  render() {
    let bottomLeft;
    if (this.props.showEditWorldButton) {
      bottomLeft = <div className='Button bottom left' onClick={this.props.onEditWorld}><FontAwesome name='globe' /></div>
    } else {
      bottomLeft = <div className='Button bottom left' onClick={this.props.onEditObject}><FontAwesome name='cube' /></div>
    }
    let bottomRight = <div className='Button bottom right' onClick={this.props.onAdd}><FontAwesome name='plus' /></div>;
    let topLeft = <div className='Button top left' onClick={this.props.onMenu}><FontAwesome name='bars' /></div>;
    
    let showRotationSwitches = this.props.showRotationSwitches;
    let pitchSwitch = showRotationSwitches ? <div className='pitch switch'><FontAwesome name='arrows-v' /></div> : null;
    let yawSwitch = showRotationSwitches ? <div className='yaw switch'><FontAwesome name='arrows-h' /></div> : null;
    
    return (
      <div className='Controls'>
        {this.props.children}
        {bottomLeft} {bottomRight} {topLeft}
        {pitchSwitch} {yawSwitch}
      </div>
    )
  }
}
