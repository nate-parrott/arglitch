import React, { Component } from 'react';
import tinycolor from 'tinycolor2';
import './ColorPicker.css';
import { loadImage } from './util.js';

class CanvasRenderer extends Component {
  constructor(props) {
    super(props);
    this.requestedRedraw = false;
  }
  render() {
    this.dirty();
    return <canvas width={this.props.width} height={this.props.height} ref={(c) => {this.canvas = c}} />;
  }
  dirty() {
    if (!this.requestedRedraw) {
      this.requestedRedraw = true;
      window.requestAnimationFrame(() => {
        this.draw();
      })
    }
  }
  draw() {
    if (this.canvas) this.props.draw(this.canvas.getContext('2d'));
    this.requestedRedraw = false;
  }
}

class ImageLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {image: null};
  }
  componentDidMount() {
    loadImage(this.props.src).then((image) => this.setState({image}));
  }
  render() {
    return this.state.image ? this.props.render(this.state.image) : null;
  }
}

let Slider = ({value, onChange, grabber, children}) => {
  let touch = (e) => {
    e.preventDefault();
    let boundingRect = e.currentTarget.getBoundingClientRect();
    let y = (e.touches[0].clientY - boundingRect.y) / boundingRect.height;
    onChange(Math.max(0, Math.min(1, y)));
  }
  // let mouse = (e) => {
  //   e.preventDefault();
  //   let boundingRect = e.currentTarget.getBoundingClientRect();
  //   let y = (e.clientY - boundingRect.y) / boundingRect.height;
  //   onChange(Math.max(0, Math.min(1, y)));
  // }
  return (
    <div className='Slider' onTouchStart={touch} onTouchMove={touch}>
      {children}
      <div className='grabber-container' style={{top: (value * 100) + '%'}}>{grabber}</div>
    </div>
  );
}

let HueSlider = ({hsva, grabber, onChange}) => {
  let render = (image) => {
    let draw = (ctx) => {
      ctx.drawImage(image, 0, 0, 1, 256);
    }
    return <Slider value={hsva.h} grabber={grabber} onChange={onChange}><CanvasRenderer width="1" height="256" draw={draw}/></Slider>;
  }
  return <div className='HueSlider'><ImageLoader src="/hue.png" render={render} /></div>;
}

let hsvaToColorString = (hsva) => {
  return tinycolor.fromRatio(hsva).toRgbString();
}

let SaturationSlider = ({hsva, grabber, onChange}) => {
  let draw = (ctx) => {
    let gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, hsvaToColorString({...hsva, s: 0, a: 1, v: 1}));
    gradient.addColorStop(1, hsvaToColorString({...hsva, s: 1, a: 1, v: 1}));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
  }
  return (
    <div className='SaturationSlider'>
      <Slider value={hsva.s} grabber={grabber} onChange={onChange}>
        <CanvasRenderer color={hsva} width="1" height="256" draw={draw} />
      </Slider>
    </div>
  );
}

let ValueSlider = ({hsva, grabber, onChange}) => {
  let draw = (ctx) => {
    let gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, hsvaToColorString({...hsva, v: 0, a: 1}));
    gradient.addColorStop(1, hsvaToColorString({...hsva, v: 1, a: 1}));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
  }
  return (
    <div className='ValueSlider'>
      <Slider value={hsva.v} grabber={grabber} onChange={onChange}>
        <CanvasRenderer color={hsva} width="1" height="256" draw={draw} />
      </Slider>
    </div>
  );
}

let AlphaSlider = ({hsva, grabber, onChange}) => {
  let draw = (ctx) => {
    ctx.clearRect(0,0,1,256);
    let gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, hsvaToColorString({...hsva, a: 0}));
    gradient.addColorStop(1, hsvaToColorString({...hsva, a: 1}));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
  }
  return (
    <div className='AlphaSlider'>
      <Slider value={hsva.a} grabber={grabber} onChange={onChange}>
        <CanvasRenderer color={hsva} width="1" height="256" draw={draw} />
      </Slider>
    </div>
  );
}

export class ColorPickerDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {color: '#cf4'};
  }
  render() {
    // console.log(this.state.color);
    return <div className='ColorPickerDemo'><ColorPicker color={this.state.color} onChange={(color) => this.setState({color})} /></div>;
   }
}

export default function ColorPicker({color, onChange}) {
  let {h, s, v, a} = tinycolor(color).toHsv();
  h /= 360;
  let changeColor = (hsva) => onChange(tinycolor.fromRatio(hsva).toRgbString());
  let grabber = <div className='grabber' style={{backgroundColor: color}} />;
  return (
    <div className='ColorPicker'>
      <HueSlider hsva={{h, s, v, a}} grabber={grabber} onChange={(newHue) => changeColor({h: Math.min(newHue, 0.99), s, v, a})} />
      <SaturationSlider hsva={{h, s, v, a}} grabber={grabber} onChange={(newSat) => changeColor({h, s: newSat, v, a})} />
      <ValueSlider hsva={{h, s, v, a}} grabber={grabber} onChange={(newVal) => changeColor({h, s, v: newVal, a})} />
      <AlphaSlider hsva={{h, s, v, a}} grabber={grabber} onChange={(newAlpha) => changeColor({h, s, v, a: newAlpha})} />
    </div>
  );
}

