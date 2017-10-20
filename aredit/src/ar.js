import AFRAME from 'aframe';
// import { Quaternion, Euler, Vector3, Matrix4 } from 'three';
// import { degToRad } from './util';

export let AR_AVAILABLE = navigator.userAgent.indexOf("!ARKit!") > -1;

// let rotateAroundWorldAxis = ( object, axis, radians ) => {
//     let rotWorldMatrix = new Matrix4();
//     rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
//     rotWorldMatrix.multiply(object.matrix);        // pre-multiply
//     object.matrix.set(rotWorldMatrix);
//     object.rotation.setEulerFromRotationMatrix(object.matrix, object.order);
// }

// let yAxis = new Vector3(0, 1, 0);

export let initAR = () => {
  window.lastARPos = null;
  
  window.updatedARPosition = function(pos) {
    window.lastARPos = pos;
  }
  
  AFRAME.registerComponent('ar-driven', {
    init: function() {
      // window.arTrackedElement = this.el;
      // this.el.object3D.matrixAutoUpdate = false;
      
    },
    tick: function() {
      let pos = window.lastARPos;
      if (pos) {
        // let yRotation = degToRad(this.data.offsetRotation.y);
        // let offsetRotation = new Matrix4();
        // offsetRotation.makeRotationY(yRotation);
        //
        // let quaternionRotation = new Matrix4();
        // quaternionRotation.makeRotationFromQuaternion(new Quaternion(pos.q0, pos.q1, pos.q2, pos.q3));
        //
        // // let translation = new Matrix4();
        // // translation.setPosition(new Vector3(pos.x, pos.y, pos.z));
        //
        // let m = new Matrix4();
        // m.setPosition(new Vector3(pos.x, pos.y, pos.z));
        // // m.multiply(translation);
        // m.multiply(offsetRotation);
        // m.multiply(quaternionRotation);
        // this.el.object3D.matrix = m;
        
        if (this.data.position) this.el.object3D.position.set(pos.x, pos.y, pos.z);
        if (this.data.rotation) this.el.object3D.quaternion.set(pos.q0, pos.q1, pos.q2, pos.q3);
        // this.el.object3D.rotateY(degToRad(this.data.offsetRotation.y));
        // let yRotation = degToRad(this.data.offsetRotation.y);
        // rotateAroundWorldAxis(this.el.object3D, new Vector3(0, 1, 0), yRotation);
        // this.el.object3D.setRotationFromEuler(new Euler(0, yRotation, 0));
        // this.el.object3D.applyQuaternion(new Quaternion(pos.q0, pos.q1, pos.q2, pos.q3));
      }
    }
  });
}

