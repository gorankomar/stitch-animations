import fs from 'node:fs/promises';
const { optimize } = await import(process.env.SVGO_MODULE || 'svgo');
const dir='src/embeds/assets/dynamic-funding';
const config={multipass:true,floatPrecision:2,plugins:[
'removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData',
'cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs',
'cleanupIds','removeUselessDefs','cleanupNumericValues','cleanupListOfValues','convertColors',
'removeUnknownsAndDefaults','removeNonInheritableGroupAttrs','removeUselessStrokeAndFill',
'removeViewBox','cleanupEnableBackground','removeHiddenElems','removeEmptyText','convertShapeToPath',
'convertEllipseToCircle','moveElemsAttrsToGroup','moveGroupAttrsToElems','collapseGroups',
{name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},
{name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},
'removeEmptyAttrs','removeEmptyContainers','mergePaths','removeUnusedNS','sortAttrs','sortDefsChildren','removeTitle','removeDesc']};
// Keep viewBox for responsive external images; keep xmlns and root dimensions.
config.plugins=config.plugins.filter(p=>p!=='removeViewBox');
const manifest=[];
for(const file of ['netflix.svg','uber.svg']){
const original=await fs.readFile(`${dir}/originals/${file}`,'utf8');
const optimized=optimize(original,config).data;
await fs.writeFile(`${dir}/${file}`,optimized+'\n');
manifest.push({file,originalBytes:Buffer.byteLength(original),optimizedBytes:Buffer.byteLength(optimized)});
}
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exceptions:['removeXMLNS disabled for external SVG','removeViewBox disabled for responsive geometry'],manifest},null,2)+'\n');
