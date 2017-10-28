import React, { Component } from 'react';
import SkyEditor from './SkyEditor';
import MaterialPicker from './MaterialPicker';

export default class WorldEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        <h1>Edit world</h1>
        <ul className='grid'>
          <li onClick={this.sky.bind(this)}>Sky...</li>
          <li onClick={this.ground.bind(this)}>Ground...</li>
        </ul>
      </div>
    );
  }
  sky() {
    let initialSky = (this.props.world || {}).sky;
    let change = (sky) => {
      this.props.worldRef.child('sky').set(sky);
    }
    this.props.pushOverlay(() => <SkyEditor initialSky={initialSky} onChange={change} />);
  }
  ground() {
    this.props.pushOverlay(() => <MaterialPicker materialsListRef={this.props.materialsListRef} onPicked={(material) => this.props.worldRef.child('ground').child('material').set(material)} pushOverlay={this.props.pushOverlay} />);
  }
}
