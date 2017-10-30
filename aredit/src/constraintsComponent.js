import AFRAME from 'aframe';
import { degToRad } from './util';

let magicUnsetValue = -99999.123;

AFRAME.registerComponent('constraints', {
  schema: {
    xRotation: {type: 'float', default: magicUnsetValue},
    yRotation: {type: 'float', default: magicUnsetValue},
    zRotation: {type: 'float', default: magicUnsetValue}
  },
  tick: function() {
    let object3D = this.el.object3D;
    let rotationFunctions = {x: object3D.rotateX, y: object3D.rotateY, z: object3D.rotateZ};
    for (let axis of ['z', 'x', 'y']) {
      let key = axis + 'Rotation';
      if (this.data[key] !== magicUnsetValue) {
        let targetAngle = degToRad(this.data[key]);
        object3D.updateMatrixWorld();
        let worldRotation = object3D.getWorldRotation();
        rotationFunctions[axis].bind(object3D)(targetAngle - worldRotation[axis]);
      }
    }
  }
});
