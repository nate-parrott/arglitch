import React, { Component } from 'react';

let defaultMaterial = {color: '#e44'};

let NewObjects = [
  {
    text: 'cube',
    template: {material: defaultMaterial, primitive: 'box'}
  },
  {
    text: 'sphere',
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
    template: {material: defaultMaterial, primitive: 'torus'}
  },
  {
    text: 'text',
    template: {material: defaultMaterial, primitive: 'text', text: "Text"}
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
      return <li key={i} onClick={() => this.insert(obj)}>{obj.text}</li>
    })
  }
  insert(obj) {
    let {position, rotation} = this.props.getWorldPositionAndRotation();
    let value = {position, rotation, ...(obj.template)};
    this.props.worldRef.child('entities').push().set(value);
    this.props.onDone();
  }
}
