
export let radToDeg = (rad) => {
  return rad / Math.PI * 180;
}

export let degToRad = (deg) => {
  return deg * Math.PI / 180;
}

export let scaleAllAxes = ({x,y,z}, scale) => {
  return {x: x*scale, y: y*scale, z: z*scale};
}
