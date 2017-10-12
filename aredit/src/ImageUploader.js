import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import './ImageUploader.css';
import { imageFromFile, resizeImageToBlob } from './ImageUtils';
import { uploadAsset } from './Assets.js';

export default class ImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = { uploading: false };
    this.fileNode = null;
  }
  render() {
    let classNames = ['ImageUploader'];
    if (this.state.uploading) classNames.push('uploading');
    return (
      <div className={ classNames.join(' ') } onClick={this.onClick.bind(this)}>
        { this.state.uploading ? <FontAwesome name='spinner' /> : <FontAwesome name='cloud-upload' /> }
        <input type='file' onChange={this.onFileChange.bind(this)} style={{display: 'none'}} ref={(n) => this.fileNode = n} />
      </div>
    )
  }
  onClick() {
    this.fileNode.click();
  }
  onFileChange(e) {
    if (e.target.files.length > 0) {
      this.uploadFile(e.target.files[0]);
    }
  }
  uploadFile(file) {
    let storage = this.props.storage;
    this.setState({ uploading: true });
    imageFromFile(file, (img) => {
      resizeImageToBlob(img, 512, (fullSizeBlob) => {
        resizeImageToBlob(img, 128, (thumbnailBlob) => {
          uploadAsset(fullSizeBlob, storage).then((fullSizeURL) => {
            uploadAsset(thumbnailBlob, storage).then((thumbnailURL) => {
              console.log({thumbnailURL, fullSizeURL});
              this.setState({uploading: false});
            });
          });
        });
      });
    });
  }
}
