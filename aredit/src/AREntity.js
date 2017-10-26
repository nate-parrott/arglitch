import React from 'react';
import { scaleAllAxes } from './util';
import { Entity } from 'aframe-react';
import { TRANSITION_DURATION } from './constants.js';
import equal from 'fast-deep-equal';

let ANIMATABLE_PROPS = ['position', 'rotation', 'scale'];

let AREntity = ({id, value, transitioningFromValue, selected, dragState, gestureScale}) => {
  let defaultSelectionColor = '#37f';
  
  let material = null;
  if (selected) {
    material = {color: defaultSelectionColor};
  } else if (value.material) {
    material = {color: value.material.color, src: value.material.src};
  } else {
    material = {color: '#e44'};
  }
  
  let props = {};
  if (value.primitive === 'text') {
    props.geometry = {primitive: 'box'}; // text geo is loaded async, but raycaster crashes if we have a mesh with empty geometry; work around this by initializing with a box primitive (which will be instantiated immediately) and follow up by adding a text component
    props['text-geometry'] = {value: value.text};
  } else {
    props.geometry = {primitive: value.primitive || 'box'};
  }
  
  if (dragState) {
    props.position = dragState.posInCameraSpace;
    props.rotation = dragState.rotationInCameraSpace;
    props.scale = scaleAllAxes(value.scale || {x: 1, y: 1, z: 1}, gestureScale || 1);
  } else {
    props.position = value.position;
    props.rotation = value.rotation;
    props.scale = value.scale || {x: 1, y: 1, z: 1};
    // props = {...props, ...animationProps(transitioningFromValue, value)};
  }
  
  return <Entity data-entity-id={id} material={material} shadow={{receive: true}} {...props} />;
};

// let animationProps = (transitioningFromValue, value) => {
//   let props = {};
//   for (let key of ANIMATABLE_PROPS) {
//     if (!transitioningFromValue || !transitioningFromValue[key] || equal(transitioningFromValue[key], value[key])) {
//       props[key] = value[key];
//     } else {
//       // animate this:
//       props['animation__' + key] = {property: key, dur: TRANSITION_DURATION * 1000, to: value[key], easing: 'easeInOutElastic', from: transitioningFromValue[key]};
//     }
//   }
//   return props;
// }

// let renderTransitionAnimations = (fromVals, toVals) => {
//   if (!fromVals) return null;
//   return Object.keys(ANIMATABLE_PROPS).map((prop) => {
//     let fromVal = fromVals[prop];
//     let toVal = toVals[prop];
//     if (fromVal === undefined || equal(fromVal, toVal)) return null;
//     return <Entity
//   })
// }

export default AREntity;
