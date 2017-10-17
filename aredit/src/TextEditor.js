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
        <p>OTHER FUN CONTENT</p>
        <p>GOES HERE!</p>
      </div>
    )
  }
  done() {
    // TODO
  }
}
