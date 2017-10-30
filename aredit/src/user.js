
export let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export let getUserId = () => {
  let id = localStorage.userId;
  if (!id) {
    id = uuidv4();
    localStorage.userId = id;
  }
  return id;
}
