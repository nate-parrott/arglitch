import tinycolor from 'tinycolor2';

export let colorStringToHsva = (colorString) => {
  let {h, s, v, a} = tinycolor(colorString).toHsv();
  h /= 360;
  return {h,s,v,a};
}

export let hsvaToColorString = (hsva) => {
  return tinycolor.fromRatio(hsva).toRgbString();
}

export let mapColor = (colorString, fn) => {
  return hsvaToColorString(fn(colorStringToHsva(colorString)));
}
