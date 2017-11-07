import React, { Component } from 'react';
import { Option } from './Overlay';

let defaultMaterial = {color: '#e44'};

let NewObjects = [
  {
    text: 'cube',
    icon: 'cube',
    template: {material: defaultMaterial, primitive: 'box'}
  },
  {
    text: 'sphere',
    icon: 'circle',
    template: {material: defaultMaterial, primitive: 'sphere'}
  },
  {
    text: 'cylinder',
    template: {material: defaultMaterial, primitive: 'cylinder'}
  },
  {
    text: 'cone',
    template: {material: defaultMaterial, primitive: 'cone'}
  },
  {
    text: 'donut',
    icon: 'circle-o',
    template: {material: defaultMaterial, primitive: 'torus'}
  },
  {
    text: 'text',
    icon: 'font',
    template: {material: defaultMaterial, primitive: 'text', text: "Text"}
  },
  {
    text: '3d model',
    icon: 'cloud-download',
    template: {material: defaultMaterial, primitive: 'sphere', placeholder: true},
    placeholderFor3dModel: true
  }
]

export default class AddSheet extends Component {
  render() {
    return (
      <div className='AddSheet'>
        <h1>New Object</h1>
        <ul className='grid'>
          {this.renderItems()}
        </ul>
      </div>
    )
  }
  renderItems() {
    return NewObjects.map((obj, i) => {
      return <Option key={i} onClick={() => this.insert(obj)} title={obj.text} icon={obj.icon || 'cubes'} />
    })
  }
  insert(obj) {
    let {position, rotation} = this.props.getWorldPositionAndRotation();
    let value = {position, rotation, ...(obj.template)};
    let childRef = this.props.worldRef.child('entities').push();
    childRef.set(value);
    let id = childRef.key;
    this.props.onDone();
    if (obj.placeholderFor3dModel) {
      console.log({placeholderId: id})
      window.webkit.messageHandlers.downloadModels.postMessage({placeholderId: id});
    }
  }
}
