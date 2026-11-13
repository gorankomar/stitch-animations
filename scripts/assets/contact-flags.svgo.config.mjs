// SVGO 4.0.0; explicit static-artwork profile. Retain xmlns, viewBox and atlas
// dimensions. Do not discard arbitrary attributes, raster artwork or off-canvas
// paths (nested viewport coordinates must remain meaningful).
const names = [
 'removeDoctype','removeXMLProcInst','removeComments','removeDeprecatedAttrs',
 'removeMetadata','removeEditorsNSData','cleanupAttrs','mergeStyles','inlineStyles',
 'minifyStyles','convertStyleToAttrs','cleanupIds','removeUselessDefs',
 'cleanupNumericValues','cleanupListOfValues','convertColors',
 'removeUnknownsAndDefaults','removeNonInheritableGroupAttrs',
 'removeUselessStrokeAndFill','cleanupEnableBackground','removeHiddenElems',
 'removeEmptyText','convertShapeToPath','convertEllipseToCircle',
 'moveElemsAttrsToGroup','moveGroupAttrsToElems','collapseGroups',
 'convertPathData','convertTransform','removeEmptyAttrs','removeEmptyContainers',
 'mergePaths','removeUnusedNS','sortAttrs','sortDefsChildren','removeTitle',
 'removeDesc','removeScripts','removeXlink','convertOneStopGradients','reusePaths'
];
export default {
 multipass: true,
 floatPrecision: 2,
 plugins: names.map(name => ({name, params: {
   floatPrecision:2,
   ...(['convertTransform','convertPathData'].includes(name) ? {transformPrecision:8} : {})
 }}))
};
