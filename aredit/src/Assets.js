const uuidv4 = require('uuid/v4');

export let uploadAsset = (blob, storage) => {
  // returns a future
  let id = uuidv4();
  let ref = storage.ref().child('assets').child(id);
  return ref.put(blob).then((snapshot) => snapshot.downloadURL);
};
