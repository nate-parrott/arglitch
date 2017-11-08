const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.serveBucket = functions.https.onRequest((request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // let prefix = '/bucket/';
  // console.log('PATH IS: ' + request.path);
  // let prefix = '/serveBucket/';
  // let path = request.path.substring(prefix.length);
  let path = request.path.substring(1);
  let newUrl = 'https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/' + encodeURIComponent(path) + '?alt=media';
  response.redirect(301, newUrl);
});
