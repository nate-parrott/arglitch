import React, { Component } from 'react';
import tinycolor from 'tinycolor2';
import loadImage from './util';
import { hsvaToColorString } from './ColorPicker';

let defaultSky = {
  horizonColor: '#76D2FF',
  skyColor: '#1798E2',
  starColor: 'black',
  cloudColor: 'red'
}

class LazyLoader {
  constructor(loadFunction) {
    this.loadFunction = loadFunction;
    this.loadInProgress = false;
    this.loadedValue = null;
    this.callbacks = [];
  }
  get(callback) {
    if (this.loadedValue) {
      callback(this.loadedValue);
    } else {
      this.callbacks.push(callback);
      if (!this.loadInProgress) {
        // load now:
        this._loadNow();
      }
    }
  }
  _loadNow() {
    this.loadInProgress = true;
    this.loadFunction((value) => {
      this.loadInProgress = false;
      if (value) {
        this.loadedValue = value;
        for (let cb of this.callback) {
          cb(value);
        }
        this.loadFunction = null;
        this.callbacks = [];
      }
    })
  }
}

let renderSky = (sky, ctx, starImageLoader, cloudImageLoader, width, height, callback) {
  let gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, sky.skyColor);
  gradient.addColorStop(0.5, sky.horizonColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  let altCanvas = document.createElement('canvas');
  altCanvas.width = width;
  altCanvas.height = height;
  let altCtx = document.getContext('2d');
  
  let drawMaskedColor = (imageLoader, color, callback) => {
    let {h, s, v, a} = tinycolor(color).toHsv();
    h /= 360;
    if (a > 0) {
      imageLoader.get((img) => {
        altCtx.drawImage(img, 0, 0, width, height);
        altCtx.globalCompositeOperation = 'source-atop';
        altCtx.fillColor = hsvaToColorString({h, s, v, a: 1});
        altCtx.fillRect(0, 0, width, height);
        ctx.globalAlpha = a;
        ctx.drawImage(altCtx, 0, 0, width, height);
        ctx.globalAlpha = 1;
        callback();
      });
    } else {
      callback();
    }
  };
  
  drawMaskedColor(starImageLoader, sky.starColor, () => {
    drawMaskedColor(cloudImageLoader, sky.cloudColor, () => {
      callback();
    });
  });
}

export default class SkyEditor extends Component {
  constructor(props) {
    super(props);
  }
}
