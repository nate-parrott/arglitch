import React, { Component } from 'react';
import tinycolor from 'tinycolor2';
import { loadImage } from './util';
import ColorPicker, { hsvaToColorString } from './ColorPicker';
import { NavBar, NavBarButton, Tabs } from './Overlay';
import CanvasRenderer from './CanvasRenderer';
import { Entity } from 'aframe-react';

export let defaultSky = {
  horizonColor: '#76D2FF',
  skyColor: '#1798E2',
  starColor: 'transparent',
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

let starImageLoader = createImageLoader('/stars.png');
let cloudImageLoader = createImageLoader('/clouds.png');

let renderSky = (sky, ctx, starImageLoader, cloudImageLoader, width, height, callback) => {
  let gradient = ctx.createLinearGradient(0, 0, 0, height);
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

export class VRSkyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {src: null};
  }
  render() {
    let w = 2048;
    let h = 1024;
    let draw = (ctx, props) => {
      renderSky(props.sky, ctx, starImageLoader, cloudImageLoader, w, h, () => {});
    }
    let canvasRenderer = <CanvasRenderer width={w} height={h} renderProps={{sky: this.props.sky || defaultSky}} draw={draw} renderToImageUrl={this.setSrc.bind(this)} />;
    return <Entity primitive='a-sky' src={this.state.src}>{canvasRenderer}</Entity>;
  }
  setSrc(url) {
    console.log(url.length)
    if (this.state.src) URL.revokeObjectURL(this.state.src);
    this.setState({src: url});
  }
}

export default class SkyEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sky: this.props.initialSky || defaultSky,
      editingProperty: 'skyColor'
    };
  }
  renderPreview() {
    let w = 512;
    let h = 200;
    return <CanvasRenderer renderProps={{sky: this.state.sky}} width={w} height={h} draw={(ctx, props) => renderSky(props.sky, ctx, starImageLoader, cloudImageLoader, w, h*2, () => {})} />;
    
  }
  render() {
    return (
      <div className='SkyEditor'>
        <NavBar title="Edit Sky" rightButton={<NavBarButton title="Apply" onClick={this.apply.bind(this)} />} />
        {this.renderPreview()}
        {this.renderTabs()}
        {this.renderEditor()}
      </div>
    )
  }
  renderTabs() {
    return <Tabs tabs={['horizonColor', 'skyColor', 'starColor', 'cloudColor']} labels={{horizonColor: 'horizon', skyColor: 'sky', starColor: 'stars', cloudColor: 'clouds'}} value={this.state.editingProperty} onChange={(v) => this.setState({editingProperty: v})} />;
  }
  renderEditor() {
    let onChange = (color) => {
      let sky = {...this.state.sky};
      sky[this.state.editingProperty] = color;
      this.setState({sky});
    }
    return <ColorPicker color={this.state.sky[this.state.editingProperty]} onChange={onChange} />;
  }
  apply() {
    this.props.onChange(this.state.sky);
  }
}
