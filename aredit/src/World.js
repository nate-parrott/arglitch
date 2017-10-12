import React, { Component } from 'react';
import {Entity} from 'aframe-react';

export default class World extends Component {
  render() {
    return (
      <Entity>
        <Floor />
        <Entity primitive='a-sky' src="/sky.png"/>
        {this.renderLights()}
      </Entity>
    )
  }
  renderLights() {
    let shadowSize = 10; // actually twice the side length of the shadow map
    let shadowX = this.props.shadowMapPos.x;
    let shadowZ = -this.props.shadowMapPos.z;
    let directionalLightOptions = {
      type: 'directional', 
      color: '#ffd', 
      intensity: 0.7, 
      castShadow: true, 
      // shadowCameraVisible: true,
      shadowCameraBottom: shadowZ - shadowSize,
      shadowCameraTop: shadowZ + shadowSize,
      shadowCameraLeft: shadowX - shadowSize,
      shadowCameraRight: shadowX + shadowSize
    }
    return [
      <Entity key='sun' position={{x: 0, y: 100, z: 0}} light={directionalLightOptions} />,
      <Entity key='ambient' light={{type: 'ambient', color: '#cdf', intensity: 0.5 }} />
    ];
  }
}

let Floor = () => {
  return <Entity shadow={{cast: false}} primitive='a-plane' material={{src: '/grass.jpg', repeat: '200 200'}} position={{x: 0, y: -2, z: 0}} rotation={{x: -90, y: 0, z: 0}} scale={{ x: 1000, y: 1000, z: 1000 }} />;
}

