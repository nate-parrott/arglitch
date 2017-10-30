import React, { Component } from 'react';
import StretchControl from './StretchControl';
import TextEditor from './TextEditor';
import MaterialPicker from './MaterialPicker';
import FontAwesome from 'react-fontawesome';
import { Option, ToggleOption } from './Overlay';

export default class EntityEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {hasText: this.props.getEntityValue().primitive === 'text'};
  }
  render() {
    let entityValue = this.props.getEntityValue();
    let isText = entityValue.primitive === 'text';
    let editText = isText ? <Option key='edit-text' title="Edit text…" onClick={this.editText.bind(this)} /> : null;
    let pointUp = entityValue.constraints && entityValue.constraints.xRotation === 0 && entityValue.constraints.zRotation === 0;
    let setShouldPointUp = (on) => {
      this.props.entityRef.child('constraints').child('xRotation').set(on ? 0 : null);
      this.props.entityRef.child('constraints').child('zRotation').set(on ? 0 : null);
    }
    
    return (
      <div>
        <h1>Edit object</h1>
        <ul className='grid'>
          {editText}
          <Option onClick={this.stretch.bind(this)} title="Stretch Shape…" icon="arrows" />
          <Option onClick={this.material.bind(this)} title="Material…" icon="paint-brush" />
          <Option onClick={this.props.onDuplicate} title="Duplicate" icon="clone" />
          <Option onClick={this.delete.bind(this)} title="Delete" icon="trash" />
          <ToggleOption title="Points upward" icon="arrow-up" isOn={pointUp} on={() => setShouldPointUp(true)} off={() => setShouldPointUp(false)} />
        </ul>
      </div>
    );
  }
  stretch() {
    this.props.pushOverlay(() => <StretchControl entityRef={this.props.entityRef} getEntityProps={this.props.getEntityProps} updateEntityProps={this.props.updateEntityProps} />);
  }
  editText() {
    let text = this.props.getEntityValue().text;
    let onSetText = (text) => {
      this.props.entityRef.child('text').set(text || 'Text');
    }
    this.props.pushOverlay(() => <TextEditor onSetText={onSetText} initialText={text} />);
  }
  material() {
    this.props.pushOverlay(() => <MaterialPicker materialsListRef={this.props.materialsListRef} onPicked={(material) => this.props.entityRef.child('material').set(material)} pushOverlay={this.props.pushOverlay} />);
  }
  delete() {
    this.props.entityRef.remove();
    this.props.dismiss();
  }
}
