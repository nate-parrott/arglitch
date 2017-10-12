
export let radToDeg = (rad) => {
  return rad / Math.PI * 180;
}

export let degToRad = (deg) => {
  return deg * Math.PI / 180;
}

export let scaleAllAxes = ({x,y,z}, scale) => {
  return {x: x*scale, y: y*scale, z: z*scale};
}

export let vecToAFramePosition = (vec) => {
  return {x: vec.x, y: vec.y, z: vec.z};
}

export let vecToAFrameRotation = (vec) => {
  return {x: radToDeg(vec.x), y: radToDeg(vec.y), z: radToDeg(vec.z)};
}

export let clampScale = (s) => Math.max(0.05, Math.min(500, s));
