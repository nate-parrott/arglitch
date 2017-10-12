import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
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

ReactDOM.render(<App identifier={identifier} database={db} storage={storage} />, document.getElementById('root'));
registerServiceWorker();
