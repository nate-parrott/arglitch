import React, { Component } from 'react';
import { Entity } from 'aframe-react';
import { VRSkyComponent, defaultSky } from './SkyEditor';
import { mapColor } from './color';

export default class World extends Component {
  render() {
    let world = this.props.world || {};
    let sky = world.sky || defaultSky;
    return (
      <Entity>
        <Floor />
        {this.renderLights(sky)}
        <VRSkyComponent sky={sky} />;
      </Entity>
    )
  }
  renderLights(sky) {
    let {directional, ambient} = computeLighting(sky);
    let shadowSize = 10; // actually twice the side length of the shadow map
    let shadowX = this.props.shadowMapPos.x;
    let shadowZ = -this.props.shadowMapPos.z;
    let directionalLightOptions = {
      type: 'directional', 
      color: directional, 
      intensity: 0.9, 
      castShadow: true, 
      // shadowCameraVisible: true,
      shadowCameraBottom: shadowZ - shadowSize,
      shadowCameraTop: shadowZ + shadowSize,
      shadowCameraLeft: shadowX - shadowSize,
      shadowCameraRight: shadowX + shadowSize
    }
    return [
      <Entity key='sun' position={{x: 0, y: 100, z: 0}} light={directionalLightOptions} />,
      <Entity key='ambient' light={{type: 'ambient', color: ambient, intensity: 0.7 }} />
    ];
  }
}

let Floor = () => {
  return <Entity shadow={{cast: false}} primitive='a-plane' material={{src: '/grass.jpg', repeat: '200 200'}} position={{x: 0, y: -2, z: 0}} rotation={{x: -90, y: 0, z: 0}} scale={{ x: 1000, y: 1000, z: 1000 }} />;
}

let computeLighting = (sky) => {
  let directional = mapColor(sky.skyColor, ({h,s,v,a}) => {
    v = Math.max(0.3, v);
    s /= 2;
    return {h,s,v,a: 1};
  });
  let ambient = mapColor(sky.horizonColor, ({h,s,v,a}) => {
    v = Math.max(0.3, v);
    s /= 2;
    return {h,s,v,a: 1};
  });
  return {directional, ambient};
}
