import React, { Component } from 'react';
import './App.css';
// import AFRAME from 'aframe';
import {Entity, Scene} from 'aframe-react';
import { initAR, AR_AVAILABLE } from './ar';
import { Matrix4 } from 'three';
import { radToDeg, degToRad, scaleAllAxes, vecToAFramePosition, vecToAFrameRotation } from './util';
import TouchRecognizer from './TouchRecognizer';
import Controls from './Controls';
import Overlay from './Overlay';
import EntityEditor from './EntityEditor';
import AddSheet from './AddSheet';
import World from './World';
import { clampScale } from './util';
import ImageUploader from './ImageUploader';
// import ColorPicker, {ColorPickerDemo} from './ColorPicker';
require('aframe-text-geometry-component');

if (AR_AVAILABLE) {
  initAR();
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      world: {}, 
      selection: "", 
      drags: [], 
      offsetPosition: {x: 0, y: 0, z: 0}, 
      offsetRotation: {x: 0, y: 0, z: 0},
      gestureScale: 1, // how much have we scaled the objects we're currently dragging?
      overlayFunctions: [],
      shadowMapPos: {x: 0, z: 0}
    };
    this.cameraNode = null;
    this.cameraOffsetNode = null;
    this.prevPanDelta = null;
  }
  componentDidMount() {
    // console.log(this.props.database.ref('worlds/' + this.props.identifier))
    this.worldRef = this.props.database.ref('worlds/' + this.props.identifier);
    this.worldRef.on('value', (snapshot) => {
      this.setState({world: snapshot.val()});
    });
    this.shadowMapUpdateLoop();
    // this.pushOverlay(() => <ColorPicker color='#f44' />);
  }
  componentWillUnmount() {
    if (this._shadowMapTimeout) clearTimeout(this._shadowMapTimeout);
    delete this._shadowMapTimeout;
  }
  render() {
    // return <ColorPickerDemo />;
    // return <ImageUploader storage={this.props.storage} />;
    return (
      <div className="App">
        <Controls showEditWorldButton={!this.state.selection} onEditObject={this.editSelectedObject.bind(this)} onAdd={this.addObject.bind(this)}>
          <TouchRecognizer onTouchesBegan={this.startDrag.bind(this)} onTouchesEnded={this.finishDrag.bind(this)} onPan={this.onPan.bind(this)} onScale={this.onScale.bind(this)} onTwoFingerPan={this.onTwoFingerPan.bind(this)}>
            <Scene>
              <Camera onSelectionChanged={(sel) => this.changeSelection(sel)} onCameraNode={(n) => this.cameraNode = n} draggedObjects={this.renderDraggedObjects()} offsetPosition={this.state.offsetPosition} offsetRotation={this.state.offsetRotation} onHandNode={(n) => this.handNode = n} />
              { this.renderEntities() }
              <World shadowMapPos={this.state.shadowMapPos} />
            </Scene>
          </TouchRecognizer>
        </Controls>
        { this.renderOverlays() }
      </div>
    );
  }
  changeSelection(sel) {
    if (this.state.selection !== sel) this.setState({selection: sel});
  }
  renderEntities() {
    let entities = (this.state.world || {}).entities || {};
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
  cameraPosition() {
    let arPos = window.lastARPos || {x: 0, y: 0, z: 0};
    return {
      x: arPos.x + this.state.offsetPosition.x,
      y: arPos.y + this.state.offsetPosition.y,
      z: arPos.z + this.state.offsetPosition.z
    }
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
      this.setState({drags: drags, gestureScale: 1});
    }
  }
  finishDrag() {
    for (let drag of this.state.drags) {
      let val = this.state.world.entities[drag.id];  
      let object3D = this.domNodeForEntity(drag.id).object3D;
      object3D.updateMatrixWorld();
      let pos = object3D.getWorldPosition();
      let rot = object3D.getWorldRotation();
      let scale = scaleAllAxes(val.scale || {x: 1, y: 1, z: 1}, this.state.gestureScale || 1);
      // rot.reorder('XYZ');
      let ref = this.firebaseRefForEntity(drag.id);
      ref.child('position').set({x: pos.x, y: pos.y, z: pos.z});
      ref.child('rotation').set({x: radToDeg(rot.x), y: radToDeg(rot.y), z: radToDeg(rot.z)});
      ref.child('scale').set(scale);
    }
    this.setState({drags: []});
  }
  renderDraggedObjects() {
    let entities = (this.state.world || {}).entities || {};
    return (this.state.drags || []).map((drag) => {
      let val = entities[drag.id];
      return <AREntity key={drag.id} id={drag.id} value={val} selected={true} dragState={drag} gestureScale={this.state.gestureScale} />;
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
    
    this.setState((state) => {
      let newPos = {x: state.offsetPosition.x + dx, y: state.offsetPosition.y, z: state.offsetPosition.z + dz};
      let newRot = {...state.offsetRotation, y: state.offsetRotation.y + rotateY};
      return {offsetPosition: newPos, offsetRotation: newRot};
    });
  }
  onScale(scale) {
    this.setState(({gestureScale}) => {
      return {gestureScale: clampScale(gestureScale * scale)};
    });
  }
  onTwoFingerPan(delta) {
    alert(delta);
    let k = 0.02;
    this.setState(({drags}) => {
      let newDrags = drags.map((drag) => {
        let {x,y,z} = drag.posInCameraSpace;
        return {...drag, posInCameraSpace: {x: x + delta.x * k, y: y - delta.y * k, z: z}}
      });
      return {drags: newDrags};
    });
  }
  onRotate(angle) {
    
  }
  // OVERLAYS:
  renderOverlays() {
    let fns = this.state.overlayFunctions
    if (fns.length > 0) {
      let showBack = fns.length > 1;
      let onBack = () => {
        this.setState({overlayFunctions: this.state.overlayFunctions.slice(0, fns.length-1)});
      }
      let content = fns[fns.length-1]();
      return <Overlay onBack={showBack ? onBack : null} onDismiss={this.dismissOverlays.bind(this)}>{content}</Overlay>;
    } else {
      return null;
    }
  }
  dismissOverlays() {
    this.setState({overlayFunctions: []});
  }
  pushOverlay(renderFunc) {
    this.setState({overlayFunctions: this.state.overlayFunctions.concat([renderFunc])});
  }
  // CONTROL ACTIONS:
  editSelectedObject() {
    if (this.state.selection) {
      let id = this.state.selection.split(' ')[0];
      let entityRef = this.worldRef.child('entities').child(id);
      let materialsListRef = this.worldRef.child('materials');
      let getEntityValue = () => this.state.world.entities[id];
      let renderEditor = () => {
        return <EntityEditor pushOverlay={this.pushOverlay.bind(this)} id={id} entityRef={entityRef} materialsListRef={materialsListRef} getEntityValue={getEntityValue} />;
      };
      this.setState({overlayFunctions: [renderEditor]})
    }
  }
  addObject() {
    let getWorldPositionAndRotation = () => {
      let object3D = this.handNode.object3D;
      object3D.updateMatrixWorld();
      let position = vecToAFramePosition(object3D.getWorldPosition());
      let rotation = vecToAFrameRotation(object3D.getWorldRotation());
      return {position, rotation};
    };
    let renderAddSheet = () => <AddSheet worldRef={this.worldRef} onDone={this.dismissOverlays.bind(this)} getWorldPositionAndRotation={getWorldPositionAndRotation} />;
    this.setState({overlayFunctions: [renderAddSheet]});
  }
  shadowMapUpdateLoop() {
    if (this.cameraNode) {
      this.cameraNode.object3D.updateMatrixWorld();
      let cameraPos = this.cameraNode.object3D.getWorldPosition();
      this.setState({shadowMapPos: {x: cameraPos.x, z: cameraPos.z}});
    }
    this._shadowMapTimeout = setTimeout(() => this.shadowMapUpdateLoop(), 500);
  }
}

let AREntity = ({id, value, selected, dragState, gestureScale}) => {
  let defaultSelectionColor = '#37f';
  
  let material = null;
  if (selected) {
    material = {color: defaultSelectionColor};
  } else if (value.material) {
    material = value.material;
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

let Camera = ({onSelectionChanged, onCameraNode, onCameraRotation, draggedObjects, offsetPosition, offsetRotation, onHandNode}) => {
  let handDist = 2;
  let onRaycast = (e) => {
    let intersectedIds = e.target.components.raycaster.intersectedEls.map((el) => el.getAttribute('data-entity-id')).join(' ');
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

export default App;
