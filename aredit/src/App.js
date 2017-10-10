import React, { Component } from 'react';
import './App.css';
// import AFRAME from 'aframe';
import {Entity, Scene} from 'aframe-react';
import { initAR, AR_AVAILABLE } from './ar';
import { Matrix4 } from 'three';
import { radToDeg, degToRad } from './util';
import TouchRecognizer from './TouchRecognizer';

if (AR_AVAILABLE) {
  initAR();
}

let hammerOptions = {
    touchAction:'compute',
    recognizers: {
        press: {
          time: 1,
          threshold: 9999999
        }
    }
};

if (AR_AVAILABLE) {
  hammerOptions.recognizers.pan = {
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {world: {}, selection: "", drags: [], offsetPosition: {x: 0, y: 0, z: 0}, offsetRotation: {x: 0, y: 0, z: 0}};
    this.cameraNode = null;
    this.cameraOffsetNode = null;
    this.prevPanDelta = null;
  }
  componentDidMount() {
    console.log(this.props.database.ref('worlds/' + this.props.identifier))
    this.worldRef = this.props.database.ref('worlds/' + this.props.identifier);
    this.worldRef.on('value', (snapshot) => {
      this.setState({world: snapshot.val()});
    });
  }
  render() {
    return (
      <div className="App">
        <TouchRecognizer onTouchesBegan={this.startDrag.bind(this)} onTouchesEnded={this.finishDrag.bind(this)} onPan={this.onPan.bind(this)} onScale={this.onScale.bind(this)}>
          <Scene>
            <Camera onSelectionChanged={(sel) => this.changeSelection(sel)} onCameraNode={(n) => this.cameraNode = n} draggedObjects={this.renderDraggedObjects()} onCameraOffsetNode={(n) => this.cameraOffsetNode = n} offsetPosition={this.state.offsetPosition} offsetRotation={this.state.offsetRotation} />
            { this.renderEntities() }
            <Floor />
          </Scene>
        </TouchRecognizer>
      </div>
    );
  }
  changeSelection(sel) {
    if (this.state.selection !== sel) this.setState({selection: sel});
  }
  renderEntities() {
    let entities = this.state.world.entities || {};
    let selectedIds = this.state.selection.split(' ');
    let hideIds = (this.state.drags || []).map((d) => d.id);
    return Object.keys(entities).map((key) => {
      let val = entities[key];
      let hide = hideIds.indexOf(key) > -1;
      if (hide) return null;
      return <AREntity key={ key } id={ key } value={ val } selected={ selectedIds.indexOf(key) > -1 } />;
    })
  }
  domNodeForEntity(id) {
    return document.querySelector('[data-entity-id=' + id + ']');
  }
  firebaseRefForEntity(id) {
    return this.worldRef.child('entities').child(id);
  }
  // DRAGGING:
  startDrag() {    
    if (this.state.selection) {
      // start a drag:
      let drags = this.state.selection.split(' ').map((id) => {
        let object3D = this.domNodeForEntity(id).object3D;
        let cameraObject3D = this.cameraNode.object3D;
        cameraObject3D.updateMatrixWorld();
        let worldToLocal = new Matrix4().getInverse(cameraObject3D.matrixWorld);
        object3D.applyMatrix(worldToLocal);
        let pos = object3D.getWorldPosition();
        let rot = object3D.getWorldRotation();
        return {
          id: id,
          posInCameraSpace: {x: pos.x, y: pos.y, z: pos.z},
          rotationInCameraSpace: {x: radToDeg(rot.x), y: radToDeg(rot.y), z: radToDeg(rot.z)}
        };
      });
      this.setState({drags: drags});
    }
  }
  finishDrag() {
    for (let drag of this.state.drags) {      
      let object3D = this.domNodeForEntity(drag.id).object3D;
      object3D.updateMatrixWorld();
      let pos = object3D.getWorldPosition();
      let rot = object3D.getWorldRotation();
      // rot.reorder('XYZ');
      let ref = this.firebaseRefForEntity(drag.id);
      ref.child('position').set({x: pos.x, y: pos.y, z: pos.z});
      ref.child('rotation').set({x: radToDeg(rot.x), y: radToDeg(rot.y), z: radToDeg(rot.z)});
    }
    this.setState({drags: []});
  }
  renderDraggedObjects() {
    let entities = this.state.world.entities || {};
    return (this.state.drags || []).map((drag) => {
      let val = entities[drag.id];
      return <AREntity key={drag.id} id={drag.id} value={val} selected={true} dragState={drag} />;
    });
  }
  // EVENT HANDLING:
  onPan(delta) {
    let forwardMotion = delta.y * 0.02;
    // for now, assume world rotation is only on the y axis:
    let angle = this.cameraNode.object3D.getWorldRotation().y;
    let dx = Math.sin(angle) * forwardMotion;
    let dz = Math.cos(angle) * forwardMotion;
    let rotateY = AR_AVAILABLE ? delta.x * -0.2 : 0;
    // do an optimistic, direct update for performance:
    
    let cameraObject3D = this.cameraNode.object3D;
    cameraObject3D.translateX(dx);
    cameraObject3D.translateZ(dz);
    cameraObject3D.rotateY(degToRad(rotateY));
    
    // update the canonical state:
    this.setState((state) => {
      let newPos = {x: state.offsetPosition.x + dx, y: state.offsetPosition.y, z: state.offsetPosition.z + dz};
      let newRot = {...state.offsetRotation, y: state.offsetRotation.y + rotateY};
      return {offsetPosition: newPos, offsetRotation: newRot};
    });
  }
  // onPan(e) {
  //   let panDelta = {x: e.deltaX, y: e.deltaY};
  //   let forwardMotion = (panDelta.y - this.prevPanDelta.y) * 0.02;
  //   // for now, assume world rotation is only on the y axis:
  //   let angle = this.cameraNode.object3D.getWorldRotation().y;
  //   let dx = Math.sin(angle) * forwardMotion;
  //   let dz = Math.cos(angle) * forwardMotion;
  //   if (AR_AVAILABLE) {
  //     this.setState((state) => {
  //       let newPos = {x: state.offsetPosition.x + dx, y: state.offsetPosition.y, z: state.offsetPosition.z + dz};
  //       return {...state, offsetPosition: newPos};
  //     });
  //   }
  //   this.prevPanDelta = panDelta;
  // }
  onScale(scale) {
    
  }
}

let AREntity = ({id, value, selected, dragState}) => {
  let defaultSelectionColor = '#37f';
  let color = selected ? (value.selectedColor || defaultSelectionColor) : value.color;
  let position = dragState ? dragState.posInCameraSpace : value.position;
  let rotation = dragState ? dragState.rotationInCameraSpace : value.rotation;
  return <Entity data-entity-id={id} geometry={{primitive: 'box'}} material={{color: color}} position={position} rotation={rotation} />;
};

let Camera = ({onSelectionChanged, onCameraNode, onCameraOffsetNode, draggedObjects, offsetPosition, offsetRotation}) => {
  let handDist = 2;
  let onRaycast = (e) => {
    let intersectedIds = e.target.components.raycaster.intersectedEls.map((el) => el.getAttribute('data-entity-id')).join(' ');
    onSelectionChanged(intersectedIds);
  }
  let raycasterHandlers = {
    "raycaster-intersection": onRaycast,
    "raycaster-intersection-cleared": onRaycast
  }
  let props = {};
  if (AR_AVAILABLE) {
    props['ar-driven'] = true;
  } else {
    props['look-controls'] = true;
  }
  
  return (
    <Entity key='camera-offset' rotation={offsetRotation} position={offsetPosition} _ref={onCameraOffsetNode}>
      <Entity key='camera' camera wasd-controls _ref={onCameraNode} {...props}>
        {draggedObjects}
        <Entity raycaster={{objects: '[data-entity-id]', far: handDist, direction: {x: 0, y: 0, z: -1}}} events={raycasterHandlers} />
        <Entity primitive="a-sphere" material={{color: '#f48'}} position={{x: 0, y: 0, z: -handDist}} scale={{x: 0.05, y: 0.05, z: 0.05}} />
      </Entity>
    </Entity>
  )
};

let Floor = () => {
  return <Entity primitive='a-plane' material={{src: '/grass.jpg', repeat: '200 200'}} position={{x: 0, y: -2, z: 0}} rotation={{x: -90, y: 0, z: 0}} scale={{ x: 1000, y: 1000, z: 1000 }} />;
}

export default App;
