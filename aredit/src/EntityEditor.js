import React, { Component } from 'react';
import StretchControl from './StretchControl';
import TextEditor from './TextEditor';

export default class EntityEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {hasText: this.props.getEntityValue().primitive === 'text'};
  }
  render() {
    let editText = this.state.hasText ? <li key='editText' onClick={this.editText.bind(this)}>Edit text</li> : null;
    return (
      <div>
        <h1>Edit object</h1>
        <ul className='grid'>
          <li onClick={this.stretch.bind(this)}>Stretch shape</li>
          {editText}  
        </ul>
      </div>
    );
  }
  stretch() {
    this.props.pushOverlay(() => <StretchControl entityRef={this.props.entityRef} getEntityValue={this.props.getEntityValue} />);
  }
  editText() {
    let text = this.props.getEntityValue().text;
    let onSetText = (text) => {
      this.props.entityRef.child('text').set(text || 'Text');
    }
    this.props.pushOverlay(() => <TextEditor onSetText={onSetText} initialText={text} />);
  }
}
