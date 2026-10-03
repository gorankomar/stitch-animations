import fs from 'node:fs/promises';
const config = { multipass:true, floatPrecision:2, plugins:[
 'removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData',
 'cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs',
 'cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults',
 'removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','removeUnusedNS',
 {name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},
 {name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},
 'convertShapeToPath','sortAttrs','sortDefsChildren','removeDimensions'
]};

import crypto from 'node:crypto';
const {optimize}=await import(process.env.SVGO_MODULE||'svgo');
const dir='src/embeds/assets/3ds-enabled-security';
const manifest=[];
for(const name of ['outer','middle','inner','badge']){
 const original=await fs.readFile(`${dir}/originals/${name}.svg`,'utf8');
 const width=original.match(/width="([^"]+)"/)[1];
 const optimized=optimize(original,{...config,plugins:config.plugins.filter(p=>p!=='removeDimensions')}).data;
 // Requested constant stroke: viewport sizing changes, rather than CSS scale.
 const output=optimized.replace(/<(path|circle) /g,'<$1 vector-effect="non-scaling-stroke" ');
 await fs.writeFile(`${dir}/${name}.svg`,output);
 manifest.push({name,width,originalBytes:Buffer.byteLength(original),optimizedBytes:Buffer.byteLength(output),hash:crypto.createHash('md5').update(output).digest('hex')});
}
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exception:'Retain root dimensions; add non-scaling-stroke as explicitly requested.',manifest},null,2));
