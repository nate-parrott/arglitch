import React, { Component } from 'react';
import './WorldMenu.css';
import FontAwesome from 'react-fontawesome';

export default class WorldMenu extends Component {
  render() {
    return (
      <div className='WorldMenu'>
        <input className='worldTitle' type='text' value={(this.props.world ? this.props.world.title : null) || ''} onChange={this.renameWorld.bind(this)} placeholder='Untitled World' />
        <SlidePicker world={this.props.world} worldRef={this.props.worldRef} currentSlide={this.props.currentSlide} onChangeSlide={this.props.onChangeSlide} />
        <div className='fullWidthButton exit' onClick={this.exit.bind(this)}>Exit this world</div>
      </div>
    )
  }
  renameWorld(e) {
    this.props.worldRef.child('title').set(e.target.value);
    this.props.onTitleChanged(e.target.value);
  }
  exit() {
    window.location = '/';
  }
}

let SlidePicker = ({world, worldRef, currentSlide, onChangeSlide}) => {
  let allSlides = Object.keys(world.slides || {});
  allSlides.sort();
  let mainIdx = allSlides.indexOf('main');
  if (mainIdx > -1) allSlides.splice(mainIdx, 1);
  allSlides.splice(0, 0, 'main');
  
  let slideItems = allSlides.map((slide, i) => {
    let className = (slide === currentSlide) ? 'selected' : null;
    return <div className={className} key={slide} onClick={() => onChangeSlide(slide)}>{i+1}</div>;
  });
  
  let createNewSlide = () => {
    let existingSlideData = (world.slides || {})[currentSlide] || {};
    onChangeSlide(worldRef.child('slides').push(existingSlideData).key);
  }
  let newSlide = <div key='new' className='new' onClick={createNewSlide}><FontAwesome name='plus' /></div>;
  
  return <div className='SlidePicker HorizontalScroll'>{slideItems}{newSlide}</div>;
}
