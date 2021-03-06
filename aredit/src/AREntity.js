import React from 'react';
import { scaleAllAxes } from './util';
import { Entity } from 'aframe-react';
// import { TRANSITION_DURATION } from './constants';
// import equal from 'fast-deep-equal';
import { materialPropForMaterialJson } from './material';
import './constraintsComponent';

// let ANIMATABLE_PROPS = ['position', 'rotation', 'scale'];

let AREntity = ({id, value, transitioningFromValue, selected, dragState, gestureScale}) => {
  let defaultSelectionColor = '#37f';
  
  let material = null;
  if (selected) {
    material = {color: defaultSelectionColor};
  } else {
    let materialJson = value.material || {color: '#e44'};
    material = materialPropForMaterialJson(materialJson, 1);
  }
  
  let props = {};
  props.geometry = {primitive: 'sphere'}; // text and .obj gemoetry is loaded async, but raycaster crashes if we have a mesh with empty geometry; work around this by initializing with a box primitive (which will be instantiated immediately)
  if (value.objModel) {
    props['obj-model'] = value.objModel;
  } else if (value.primitive === 'text') {
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
  
  if (value.constraints) {
    let constraints = {};
    for (let key of ['xRotation', 'yRotation', 'zRotation']) {
      constraints[key] = value.constraints[key];
    }
    props.constraints = constraints;
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
