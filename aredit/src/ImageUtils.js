
export let imageFromFile = (file, callback) => {
  let img = new Image();
  let reader = new FileReader();  
  reader.onload = function(e) {
    img.onload = () => {
      callback(img);
    };
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

export let resizeImageToBlob = (image, maxDimension, callback) => {
  let w = image.width;
  let h = image.height;
  let scale = Math.min(1, Math.min(maxDimension / w, maxDimension / h));
  w *= scale;
  h *= scale;
  let cvs = document.createElement('canvas');
  cvs.width = parseInt(w, 10);
  cvs.height = parseInt(h, 10);
  let ctx = cvs.getContext('2d');
  ctx.drawImage(image, 0, 0, w, h);
  cvs.toBlob((blob) => {
    callback(blob);
  });
}
