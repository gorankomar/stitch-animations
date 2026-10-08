import fs from 'node:fs/promises';
const { optimize } = await import(process.env.SVGO_MODULE || 'svgo');
const dir='src/embeds/assets/issuer-routing';
const config={multipass:true,floatPrecision:2,plugins:['removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData','cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs','cleanupIds','removeUselessDefs','cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults','removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','cleanupEnableBackground','removeHiddenElems','removeEmptyText','convertShapeToPath','convertEllipseToCircle','moveElemsAttrsToGroup','moveGroupAttrsToElems','collapseGroups',{name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},{name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},'removeEmptyAttrs','removeEmptyContainers','mergePaths','removeUnusedNS','sortAttrs','sortDefsChildren','removeTitle','removeDesc']};
const manifest=[];
for(const file of await fs.readdir(`${dir}/originals`)){
 const raw=await fs.readFile(`${dir}/originals/${file}`,'utf8');
 let optimized=optimize(raw,config).data;
 if (file === "eu.svg" || file === "ksa.svg") { const id = file === "eu.svg" ? "european-union-flag-clip" : "issuer-routing-ksa-clip"; optimized=optimized.replaceAll('id="a"', `id="${id}"`).replaceAll("url(#a)", `url(#${id})`); }
 await fs.writeFile(`${dir}/${file}`,optimized+'\n');manifest.push({file,originalBytes:Buffer.byteLength(raw),optimizedBytes:Buffer.byteLength(optimized)});
}
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exceptions:['Preserve xmlns, viewBox and root dimensions','Pulse centerlines are separate overlays; exported filled connector outlines remain unchanged'],manifest},null,2)+'\n');
