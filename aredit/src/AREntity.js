import React from 'react';
import { scaleAllAxes } from './util';
import { Entity } from 'aframe-react';

let AREntity = ({id, value, selected, dragState, gestureScale}) => {
  let defaultSelectionColor = '#37f';
  
  let material = null;
  if (selected) {
    material = {color: defaultSelectionColor};
  } else if (value.material) {
    material = {color: value.material.color, src: value.material.src};
  } else {
    material = {color: '#e44'};
  }
  
  let position = dragState ? dragState.posInCameraSpace : value.position;
  let rotation = dragState ? dragState.rotationInCameraSpace : value.rotation;
  let scale = scaleAllAxes(value.scale || {x: 1, y: 1, z: 1}, gestureScale || 1);
  
  let props = {};
  if (value.primitive === 'text') {
    props.geometry = {primitive: 'box'}; // text geo is loaded async, but raycaster crashes if we have a mesh with empty geometry; work around this by initializing with a box primitive (which will be instantiated immediately) and follow up by adding a text component
    props['text-geometry'] = {value: value.text};
  } else {
    props.geometry = {primitive: value.primitive || 'box'};
  }
  
  return <Entity data-entity-id={id} material={material} position={position} rotation={rotation} scale={scale} shadow={{receive: false}} {...props} />;
};

export default AREntity;
