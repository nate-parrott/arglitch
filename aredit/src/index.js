import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import UserHome from './UserHome';
const queryString = require('query-string');

let query = queryString.parse(window.location.search);

let identifier = query.id || 'default';

var config = {
   apiKey: "AIzaSyAViBcD9oDDPjWXSQ-z-Vc6Puvnkvzdbbs",
   authDomain: "ar-edit.firebaseapp.com",
   databaseURL: "https://ar-edit.firebaseio.com",
   storageBucket: "gs://ar-edit.appspot.com"
 };
firebase.initializeApp(config);
let db = firebase.database();
let storage = firebase.storage();
window.firebaseStorage = storage;

if (query.world) {
  ReactDOM.render(<App identifier={query.world} database={db} storage={storage} />, document.getElementById('root'));
} else {
  ReactDOM.render(<UserHome database={db} />, document.getElementById('root'));
}

registerServiceWorker();
