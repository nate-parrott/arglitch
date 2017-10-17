import React, { Component } from 'react';
import './TextEditor.css';
import { NavBar, NavBarButton } from './Overlay';

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {text: this.props.initialText};
  }
  render() {
    return (
      <div className='TextEditor'>
        <NavBar title="Edit Text" rightButton={<NavBarButton title="Done" onClick={this.done.bind(this)}/>} />
        <textarea ref={(n) => this.textAreaNode = n} value={this.state.text} onChange={(e) => this.setState({text: e.target.value})} />
      </div>
    )
  }
  done() {
    this.props.onSetText(this.state.text);
    this.textAreaNode.blur();
  }
}
