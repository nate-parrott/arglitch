import React, { Component } from 'react';
import './Overlay.css';
import FontAwesome from 'react-fontawesome';
import { COLORS } from './constants';

export default class Overlay extends Component {
  render() {
    return (
      <div className='Overlay' onClick={this.clickedOverlay.bind(this)}>
        <div className='_OverlayWindow'>
          {this.renderBackButton()}
          {this.props.children}
        </div>
      </div>
    )
  }
  renderBackButton() {
    if (this.props.onBack) {
      let backArrow = <FontAwesome name='arrow-left' />;
      return <div className='BackButtonContainer'><NavBarButton onClick={this.props.onBack} title={backArrow} /></div>;
    }
    return null;
  }
  clickedOverlay(e) {
    if (e.target === e.currentTarget) this.props.onDismiss();
  }
}

export function NavBarButton({title, onClick}) {
  return <div className='NavBarButton' onClick={onClick}>{title}</div>;
}

export function NavBar({title, rightButton, leftButton}) {
  // rightButton: {title, onClick}
  return (
    <div className='NavBar'>
      { leftButton || <NavBarButton /> }
      <h2>{title}</h2>
      { rightButton || <NavBarButton /> }
    </div>
  )
}

export let Tabs = ({tabs, labels, value, onChange}) => {
  let renderTab = (tab) => {
    let label = (labels || {})[tab] || tab;
    return <div key={tab} className={tab === value ? 'selected' : null} onClick={() => onChange(tab)}>{label}</div>;
  }
  return <div className='Tabs'>{tabs.map(renderTab)}</div>;
}

export let Option = ({onClick, icon, title, selected}) => {
  let fontAwesome = icon ? <FontAwesome name={icon} /> : null;
  let style = {
    backgroundColor: selected ? COLORS.red : undefined,
    color: selected ? 'white' : undefined
  };
  return <li style={style} onClick={onClick}>{fontAwesome} {title}</li>;
}

export let ToggleOption = ({title, icon, isOn, on, off}) => {
  let toggle = isOn ? off : on;
  return <Option onClick={toggle} title={title} icon={icon} selected={isOn} />;
}
