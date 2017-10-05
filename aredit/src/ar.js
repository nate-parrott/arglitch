import AFRAME from 'aframe';

export let AR_AVAILABLE = navigator.userAgent.indexOf("!ARKit!") > -1;

export let initAR = () => {
  window.lastARPos = null;
  
  window.updatedARPosition = function(pos) {
    window.lastARPos = pos;
  }
  
  AFRAME.registerComponent('ar-driven', {
    init: function() {
      // window.arTrackedElement = this.el;
    },
    tick() {
      let pos = window.lastARPos;
      if (pos) {
        this.el.object3D.position.set(pos.x, pos.y, pos.z);
        this.el.object3D.quaternion.set(pos.q0, pos.q1, pos.q2, pos.q3);
      }
    }
  });
}

