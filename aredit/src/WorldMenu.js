import React, { Component } from 'react';
import './WorldMenu.css';

export default class WorldMenu extends Component {
  render() {
    return (
      <div className='WorldMenu'>
        <input className='worldTitle' type='text' value={(this.props.world ? this.props.world.title : null) || ''} onChange={this.renameWorld.bind(this)} placeholder='Untitled World' />
        <SlidePicker world={this.props.world} />
        <div className='fullWidthButton exit'>Exit this world</div>
      </div>
    )
  }
  renameWorld(e) {
    this.props.worldRef.child('title').set(e.target.value);
  }
}

let SlidePicker = ({world}) => {
  let nums = [0,1,2].map((i) => <div key={i}>{i}</div>);
  return <div className='SlidePicker grid'>{nums}</div>;
}
