import React, { Component } from 'react';
import './App.css';
// import AFRAME from 'aframe';
import { Scene } from 'aframe-react';
import { initAR, AR_AVAILABLE } from './ar';
import { Matrix4 } from 'three';
import { radToDeg, scaleAllAxes, vecToAFramePosition, vecToAFrameRotation, applyRotation } from './util';
import TouchRecognizer from './TouchRecognizer';
import WorldMenu from './WorldMenu';
import Controls from './Controls';
import Overlay from './Overlay';
import EntityEditor from './EntityEditor';
import WorldEditor from './WorldEditor';
import AddSheet from './AddSheet';
import World from './World';
import AREntity from './AREntity';
import Camera from './Camera';
import { clampScale } from './util';
import { MAIN_SLIDE, SLIDE_PROPS, TRANSITION_DURATION } from './constants.js';
import { ensureDefaultAssets }  from './defaultAssets';
import { getUserId } from './user';
import './AppUI.css';
require('aframe-text-geometry-component');
require('aframe-animation-component');

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
      shadowMapPos: {x: 0, z: 0},
      currentSlide: MAIN_SLIDE,
      transitioningFromSlide: null
    };
    this.cameraNode = null;
    this.cameraOffsetNode = null;
    this.prevPanDelta = null;
  }
  componentDidMount() {
    this.worldRef = this.props.database.ref('worlds/' + this.props.identifier);
    this.worldRef.on('value', (snapshot) => {
      this.setState({world: snapshot.val()});
    });
    this.shadowMapUpdateLoop();
    ensureDefaultAssets(this.assetsRef());
    this.updateUserWorldMetadata('last_opened', +new Date());
  }
  componentWillUnmount() {
    if (this._shadowMapTimeout) clearTimeout(this._shadowMapTimeout);
    delete this._shadowMapTimeout;
  }
  render() {
    // return <ColorPickerDemo />;
    // return <ImageUploader storage={this.props.storage} />;
    // return <SkyEditor />;
    return (
      <div className="App">
        <Controls showEditWorldButton={!this.state.selection} onEditObject={this.editSelectedObject.bind(this)} onAdd={this.addObject.bind(this)} showRotationSwitches={this.state.selection} onMenu={this.showMenu.bind(this)} onEditWorld={this.editWorld.bind(this)}>
          <TouchRecognizer onTouchesBegan={this.startDrag.bind(this)} onTouchesEnded={this.finishDrag.bind(this)} onPan={this.onPan.bind(this)} onScale={this.onScale.bind(this)} onTwoFingerPan={this.onTwoFingerPan.bind(this)} rightEdgePan={this.onPitch.bind(this)} bottomEdgePan={this.onYaw.bind(this)}>
            <Scene vr-mode-ui={{enabled: false}}>
              <Camera onSelectionChanged={(sel) => this.changeSelection(sel)} onCameraNode={(n) => this.cameraNode = n} draggedObjects={this.renderDraggedObjects()} offsetPosition={this.state.offsetPosition} offsetRotation={this.state.offsetRotation} onHandNode={(n) => this.handNode = n} />
              { this.renderEntities() }
              <World shadowMapPos={this.state.shadowMapPos} world={this.state.world} />
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
  suppressSelectedState() {
    return this.state.overlayFunctions.length > 0;
  }
  renderEntities() {
    let entities = (this.state.world || {}).entities || {};
    let selectedIds = this.suppressSelectedState() ? [] : this.state.selection.split(' ');
    let hideIds = (this.state.drags || []).map((d) => d.id);
    return Object.keys(entities).map((key) => {
      let hide = hideIds.indexOf(key) > -1;
      if (hide) return null;
      let value = this.propertiesForEntity(key);
      let transitioningFromValue = this.state.transitioningFromSlide ? this.propertiesForEntityWithSlide(key, this.state.transitioningFromSlide) : null;
      return <AREntity key={ key } id={ key } value={ value } transitioningFromValue={ transitioningFromValue } selected={ selectedIds.indexOf(key) > -1 } />;
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
  // SLIDEABLE PROPERTIES:
  propertiesForEntity(id) {
    return this.propertiesForEntityWithSlide(id, this.state.currentSlide);
  }
  propertiesForEntityWithSlide(id, slide) {
    let world = this.state.world || {};
    let curSlide = (world.slides || {})[slide] || {};
    let worldProps = (world.entities || {})[id] || {};
    let slideProps = curSlide[id] || {};
    return {...worldProps, ...slideProps};
  }
  updatePropertiesForEntity(id, props) {
    let entityRef = this.worldRef.child('entities').child(id);
    let slideEntityRef = this.worldRef.child('slides').child(this.state.currentSlide).child(id);
    for (let key of Object.keys(props)) {
      if (SLIDE_PROPS[key]) {
        slideEntityRef.child(key).set(props[key]);
      }
      // also set on the entity itself as a fallback:
      entityRef.child(key).set(props[key]);
    }
  }
  changeSlide(slide) {
    if (slide !== this.state.currentSlide) {
      let transitioningFromSlide = this.state.currentSlide;
      this.setState({currentSlide: slide, transitioningFromSlide});
      setTimeout(() => {
        // remove the transition state:
        this.setState((state) => {
          if (state.transitioningFromSlide === transitioningFromSlide) {
            return {transitioningFromSlide: null};
          } else {
            return {};
          }
        });
      }, TRANSITION_DURATION * 1000);
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
      this.updatePropertiesForEntity(drag.id, {
        position: {x: pos.x, y: pos.y, z: pos.z},
        rotation: {x: radToDeg(rot.x), y: radToDeg(rot.y), z: radToDeg(rot.z)},
        scale: scale
      });
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
    // we can safely ignore the other directions b/c aframe uses YXZ-order rotation, so rotations on other axes won't change the final Y direction of the camera
    let angle = this.cameraNode.object3D.getWorldRotation().y;
    let dx = Math.sin(angle) * forwardMotion;
    let dz = Math.cos(angle) * forwardMotion;
    let rotateY = delta.x * -0.2;
    
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
    let k = 0.02;
    this.setState(({drags, offsetPosition}) => {
      // use delta.y to vertically move the selection in camera space: (TODO: should be WORLD space)
      let newDrags = drags.map((drag) => {
        let {x,y,z} = drag.posInCameraSpace;
        return {...drag, posInCameraSpace: {y: y - delta.y * k, x, z}}
      });
      
      let sidewaysMotion = delta.x * 0.02;
      let angle = this.cameraNode.object3D.getWorldRotation().y + Math.PI / 2;
      let dx = Math.sin(angle) * sidewaysMotion;
      let dz = Math.cos(angle) * sidewaysMotion;
      let newOffsetPosition = {y: offsetPosition.y, x: offsetPosition.x + dx, z: offsetPosition.z + dz};
      
      return {drags: newDrags, offsetPosition: newOffsetPosition};
    });
  }
  onRotate(angle) {
    
  }
  onPitch(d) {
    let k = 1;
    this.updateGrabbedObjectRotation((r) => {
      return applyRotation(r, 'x', d * k);
    });
  }
  onYaw(d) {
    let k = 1;
    this.updateGrabbedObjectRotation((r) => {
      return applyRotation(r, 'y', d * k);
    });
  }
  updateGrabbedObjectRotation(func) {
    this.setState(({drags}) => {
      let newDrags = drags.map((drag) => {
        let rotation = drag.rotationInCameraSpace;
        let newRotation = func(rotation);
        return {...drag, rotationInCameraSpace: newRotation};
      });
      return {drags: newDrags};
    });
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
  assetsRef() {
    return this.worldRef.child('assets');
  }
  materialsListRef() {
    return this.assetsRef().child('materials');
  }
  // CONTROL ACTIONS:
  editSelectedObject() {
    if (this.state.selection) {
      let id = this.state.selection.split(' ')[0];
      let entityRef = this.worldRef.child('entities').child(id);
      let materialsListRef = this.materialsListRef();
      let updateEntityProps = (props) => this.updatePropertiesForEntity(id, props);
      let getEntityProps = () => this.propertiesForEntity(id);
      let getEntityValue = () => this.state.world.entities[id];
      let renderEditor = () => {
        return <EntityEditor pushOverlay={this.pushOverlay.bind(this)} id={id} entityRef={entityRef} materialsListRef={materialsListRef} getEntityValue={getEntityValue} onDuplicate={() => this.duplicateEntity(id)} dismiss={this.dismissOverlays.bind(this)} updateEntityProps={updateEntityProps} getEntityProps={getEntityProps} />;
      };
      this.setState({overlayFunctions: [renderEditor]});
    }
  }
  editWorld() {
    let materialsListRef = this.materialsListRef();
    let renderEditor = () => {
      return <WorldEditor pushOverlay={this.pushOverlay.bind(this)} world={this.state.world} worldRef={this.worldRef} materialsListRef={materialsListRef} />;
    }
    this.setState({overlayFunctions: [renderEditor]});
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
  duplicateEntity(id) {
    this.dismissOverlays();
    
    let entityJson = this.state.world.entities[id];
    let {x,y,z} = entityJson.position;
    let angle = this.cameraNode.object3D.getWorldRotation().y + Math.PI / 2;
    let sidewaysMotion = 2;
    let dx = Math.sin(angle) * sidewaysMotion;
    let dz = Math.cos(angle) * sidewaysMotion;
    let newPosition = {x: x+dx, y: y, z: z+dz};
    let newJson = {...entityJson, position: newPosition};
    this.worldRef.child('entities').push(newJson);
  }
  showMenu() {
    let renderMenu = () => {
      return <WorldMenu world={this.state.world || {}} pushOverlay={this.pushOverlay.bind(this)} worldRef={this.worldRef} currentSlide={this.state.currentSlide} onChangeSlide={this.changeSlide.bind(this)} onTitleChanged={(t) => this.updateUserWorldMetadata('title', t)} />
    }
    this.setState({overlayFunctions: [renderMenu]});
  }
  updateUserWorldMetadata(key, val) {
    this.props.database.ref('/users/' + getUserId() + '/worlds/' + this.props.identifier).child(key).set(val);
  }
}

export default App;
