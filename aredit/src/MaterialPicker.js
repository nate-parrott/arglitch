import './MaterialPicker.css';
import React, { Component } from 'react';
import { FirebaseObserver } from './util.js'
import { NavBar } from './Overlay.js';
import ColorPicker from './ColorPicker.js';

class MaterialPickerConcrete extends Component {
  constructor(props) {
    super(props);
    this.state = {selected: null};
  }
  render() {
    let newSolidColor = () => {
      this.editMaterial(this.props.materialsListRef.push({color: '#f00'}));
    };
    let newImage = () => {
      
    };
    let selectMaterial = (id) => {
      if (id === this.state.selected) {
        this.editMaterial(this.props.materialsListRef.child(id));
      } else {
        this.setState({ selected: id });
        this.props.onPicked(this.props.materials[id]);
      }
    };
    let renderCellForMaterialId = (id) => {
      let className = (id === this.state.selected) ? 'selected' : null;
      return <div className={className} key={id} onClick={() => selectMaterial(id)}><MaterialView material={this.props.materials[id]} /></div>;
    };
    let materialIds = Object.keys(this.props.materials || {});
    materialIds.reverse()
    return (
      <div className='MaterialPicker'>
        <NavBar title="Select material" />
        <ul className='HorizontalScroll'>
          <div className='text-button' onClick={newSolidColor} key='newSolidColor'><div>Solid color</div></div>
          <div className='text-button' onClick={newImage} key='newImage'><div>Image texture</div></div>
          { materialIds.map(renderCellForMaterialId) }
        </ul>
      </div>
    )
  }
  editMaterial(ref) {
    this.props.pushOverlay(() => {
      let render = (value) => {
        if (!value) return null;
        return (
          <div>
            <NavBar title="Edit color" />
            <ColorPicker color={value.color} onChange={(color) => ref.set({color})} />
          </div>
        );
      }
      return <FirebaseObserver firebaseRef={ref} render={render} />;
    });
  }
}

let MaterialView = ({ material }) => {
  if (material.smallSrc) return <img src={material.smallSrc} />;
  if (material.color) return <div className='solid-color' style={{backgroundColor: material.color}} />;
  return null;
}

export default function MaterialPicker(props) {
  return <FirebaseObserver firebaseRef={props.materialsListRef} render={(value) => <MaterialPickerConcrete {...props} materials={value} />} />;
}
