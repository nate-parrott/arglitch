import React, { Component } from 'react';

let NewObjects = [
  {
    text: 'cube',
    template: {color: 'red', type: 'cube'}
  },
  {
    text: 'sphere',
    template: {color: 'red', primitive: 'sphere'}
  },
  {
    text: 'cylinder',
    template: {color: 'red', type: 'cylinder'}
  },
  {
    text: 'cone',
    template: {color: 'red', type: 'cone'}
  },
  {
    text: 'donut',
    template: {color: 'red', type: 'torus'}
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
