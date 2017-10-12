import React, { Component } from 'react';
import StretchControl from './StretchControl';

export default class EntityEditor extends Component {
  render() {
    return (
      <div>
        <h1>Edit object</h1>
        <ul className='grid'>
          <li onClick={this.stretch.bind(this)}>Stretch shape</li>
        </ul>
      </div>
    );
  }
  stretch() {
    this.props.pushOverlay(() => <StretchControl entityRef={this.props.entityRef} getEntityValue={this.props.getEntityValue} />);
  }
}
