
export let materialPropForMaterialJson = (materialJson, tiling) => {
  tiling = tiling || 1;
  let repeat = tiling + ' ' + tiling;
  return {color: materialJson.color, src: materialJson.src, repeat: repeat};
}
