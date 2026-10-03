import fs from 'node:fs/promises';
import path from 'node:path';
const { optimize } = await import(process.env.SVGO_MODULE || 'svgo');
const dir = 'src/embeds/assets/income-verification';
export const config = { multipass:true, floatPrecision:2, plugins:[
 'removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData',
 'cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs',
 'cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults',
 'removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','removeUnusedNS',
 {name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},
 {name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},
 'convertShapeToPath','sortAttrs','sortDefsChildren','removeDimensions'
]};
const manifest=[];
for(const file of await fs.readdir(path.join(dir,'originals'))){
 const original=await fs.readFile(path.join(dir,'originals',file),'utf8');
 const result=optimize(original,config).data;
 await fs.writeFile(path.join(dir,file),result+'\n');
 manifest.push({file,originalBytes:Buffer.byteLength(original),optimizedBytes:Buffer.byteLength(result)});
}
await fs.writeFile(path.join(dir,'optimization.json'),JSON.stringify({version:'4.1.0',config,exceptions:['removeXMLNS','cleanupIds','removeHiddenElems','removeViewBox','removeTitle','removeDesc','mergePaths','collapseGroups','removeEmptyContainers','removeDimensions: root dimensions restored during integration'],manifest},null,2));
