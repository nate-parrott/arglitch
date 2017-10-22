import AFRAME from 'aframe';
import { Quaternion, Euler, Vector3, Matrix4 } from 'three';
import { degToRad } from './util';

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
    schema: {
      yRotation: {
        type: 'float', default: 0
      }
    },
    init: function() {
      this.worldPosition = {x: 0, y: 0, z: 0};
      this.lastARPos = {x: 0, y: 0, z: 0};
    },
    tick: function() {
      let pos = window.lastARPos;
      if (pos) {
        let kScale = 2;
        // if (this.data.position) this.el.object3D.position.set(pos.x * kScale, pos.y * kScale, pos.z * kScale);
        // if (this.data.rotation) this.el.object3D.quaternion.set(pos.q0, pos.q1, pos.q2, pos.q3);
        
        let delta = new Vector3(pos.x - this.lastARPos.x, pos.y - this.lastARPos.y, pos.z - this.lastARPos.z);
        
        let cameraSpace = new Matrix4();
        cameraSpace.makeRotationFromQuaternion(new Quaternion(pos.q0, pos.q1, pos.q2, pos.q3));

        let rotationIntoCameraSpace = new Matrix4();
        rotationIntoCameraSpace.getInverse(cameraSpace);
        
        let externalRotation = new Matrix4();
        externalRotation.makeRotationY(degToRad(this.data.yRotation));

        let rotationIntoWorldSpace = new Matrix4();
        rotationIntoWorldSpace.makeRotationFromQuaternion(new Quaternion(pos.q0, pos.q1, pos.q2, pos.q3));

        rotationIntoWorldSpace.premultiply(externalRotation);
        
        delta.applyMatrix4(rotationIntoCameraSpace);
        delta.applyMatrix4(rotationIntoWorldSpace);
        
        this.worldPosition.x += delta.x * kScale;
        this.worldPosition.y += delta.y * kScale;
        this.worldPosition.z += delta.z * kScale;
        
        this.el.object3D.position.set(this.worldPosition.x, this.worldPosition.y, this.worldPosition.z);
        // this.el.object3D.quaternion.set(pos.q0, pos.q1, pos.q2, pos.q3);
        this.el.object3D.quaternion.setFromRotationMatrix(rotationIntoWorldSpace);
        
        this.lastARPos = pos;
      }
      window.lastARPos = null;
    }
  });
}
