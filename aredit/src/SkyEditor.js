import React, { Component } from 'react';
import tinycolor from 'tinycolor2';
import { loadImage } from './util';
import { hsvaToColorString, CanvasRenderer } from './ColorPicker';

let defaultSky = {
  horizonColor: '#76D2FF',
  skyColor: '#1798E2',
  starColor: 'red',
  cloudColor: 'white'
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
        for (let cb of this.callbacks) {
          cb(value);
        }
        this.loadFunction = null;
        this.callbacks = [];
      }
    })
  }
}

let createImageLoader = (url) => {
  return new LazyLoader((callback) => {
    loadImage(url).then((img) => callback(img));
  });
}

let renderSky = (sky, ctx, starImageLoader, cloudImageLoader, width, height, callback) => {
  let gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, sky.skyColor);
  gradient.addColorStop(0.5, sky.horizonColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  let drawMaskedColor = (imageLoader, color, callback) => {
    let {h, s, v, a} = tinycolor(color).toHsv();
    h /= 360;
    if (a > 0) {
      imageLoader.get((img) => {
        let altCanvas = document.createElement('canvas');
        altCanvas.width = width;
        altCanvas.height = height;
        let altCtx = altCanvas.getContext('2d');
        
        altCtx.drawImage(img, 0, 0, width, height);
        altCtx.globalCompositeOperation = 'source-atop';
        altCtx.fillStyle = hsvaToColorString({h, s, v, a: 1});
        altCtx.fillRect(0, 0, width, height);
        ctx.globalAlpha = a;
        ctx.drawImage(altCanvas, 0, 0, width, height);
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
    this.starImageLoader = createImageLoader('/stars.png');
    this.cloudImageLoader = createImageLoader('/clouds.png');
  }
  render() {
    let w = 2048;
    let h = 1024;
    return <CanvasRenderer width={w} height={h} draw={(ctx) => renderSky(defaultSky, ctx, this.starImageLoader, this.cloudImageLoader, w, h, () => {})} />;
  }
}
