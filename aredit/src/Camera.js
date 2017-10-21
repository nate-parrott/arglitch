import React from 'react';
import { Entity } from 'aframe-react';
import { AR_AVAILABLE } from './ar';
import { deduplicateStringArray } from './util';

let Camera = ({onSelectionChanged, onCameraNode, onCameraRotation, draggedObjects, offsetPosition, offsetRotation, onHandNode}) => {
  let handDist = 3;
  let onRaycast = (e) => {
    let intersectedIds = deduplicateStringArray(e.target.components.raycaster.intersectedEls.map((el) => el.getAttribute('data-entity-id'))).join(' ');
    onSelectionChanged(intersectedIds);
  }
  let raycasterHandlers = {
    "raycaster-intersection": onRaycast,
    "raycaster-intersection-cleared": onRaycast
  }
  
  let camProps = {};
  let posProps = {};
  if (AR_AVAILABLE) {
    camProps['ar-driven'] = {rotation: true};
    posProps['ar-driven'] = {position: true};
  } else {
    camProps['look-controls'] = true;
  }
  
  return (
    <Entity position={offsetPosition}>
      <Entity key='ar-position' {...posProps}>
        <Entity key='camera' camera wasd-controls _ref={onCameraNode} {...camProps}>
  {draggedObjects}
          <Entity raycaster={{objects: '[data-entity-id]', far: handDist, direction: {x: 0, y: 0, z: -1}}} events={raycasterHandlers} />
          <Entity position={{x: 0, y: 0, z: -handDist}} _ref={onHandNode}>
            <Entity rotation={{x: 45, y: 0, z: 0}}>
              <Entity obj-model="obj: url(/mickeyhand.obj)" material={{color: '#eee'}} scale={{x: 0.3, y: 0.3, z: 0.3}} rotation={{x: 0, y: 90, z: 0}} />
            </Entity>
          </Entity>
        </Entity>
      </Entity>
    </Entity>
  )
};

export default Camera;
