import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE || 'sharp');
const {optimize}=await import(process.env.SVGO_MODULE || 'svgo');
const root='src/embeds/assets/company-logos';
const jobs=JSON.parse(await readFile(`${root}/figma-export-manifest.json`,'utf8'));
const names=['removeDoctype','removeXMLProcInst','removeComments','removeDeprecatedAttrs','removeMetadata','removeEditorsNSData','cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs','cleanupIds','removeUselessDefs','cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults','removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','cleanupEnableBackground','removeHiddenElems','removeEmptyText','convertShapeToPath','convertEllipseToCircle','moveElemsAttrsToGroup','moveGroupAttrsToElems','collapseGroups','convertPathData','convertTransform','removeEmptyAttrs','removeEmptyContainers','mergePaths','removeUnusedNS','sortAttrs','sortDefsChildren','removeTitle','removeDesc','removeScripts','removeXlink','convertOneStopGradients','reusePaths'];
await mkdir(`${root}/tight`,{recursive:true});await mkdir('deliverables/company-logos',{recursive:true});
const manifest=[],composites=[];
for(const [index,job]of jobs.entries()){
 const original=await readFile(`${root}/original/${job.slug}.svg`,'utf8');
 if(/<image\b|data:image/i.test(original))throw Error(`Raster artwork: ${job.slug}`);
 const vb=original.match(/viewBox="([^"]+)"/)[1].split(/[ ,]+/).map(Number);
 const {data,info}=await sharp(Buffer.from(original),{density:1152}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>0){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<0)throw Error(`Empty artwork: ${job.slug}`);
 const sx=vb[2]/info.width,sy=vb[3]/info.height,pad=.015;
 const x=Math.max(vb[0],vb[0]+left*sx-pad),y=Math.max(vb[1],vb[1]+top*sy-pad);
 const w=Math.min(vb[0]+vb[2],vb[0]+(right+1)*sx+pad)-x,h=Math.min(vb[1]+vb[3],vb[1]+(bottom+1)*sy+pad)-y;
 const tight=original.replace(/<svg\b[^>]*>/,tag=>tag.replace(/width="[^"]*"/i,`width="${w.toFixed(4)}"`).replace(/height="[^"]*"/i,`height="${h.toFixed(4)}"`).replace(/viewBox="[^"]*"/i,`viewBox="${[x,y,w,h].map(v=>v.toFixed(4)).join(' ')}"`));
 await writeFile(`${root}/tight/${job.slug}.svg`,tight);
 const precision=job.slug==='des-financing-corporation'?4:2;
 const config={multipass:true,floatPrecision:precision,plugins:names.map(name=>({name,params:{floatPrecision:precision,...(['convertPathData','convertTransform'].includes(name)?{transformPrecision:8}:{})}}))};
 const optimized=optimize(tight,config).data;
 if(!optimized.includes('xmlns=')||!optimized.includes('viewBox=')||/<image\b/i.test(optimized))throw Error(`Invalid SVG: ${job.slug}`);
 await writeFile(`${root}/${job.slug}.svg`,optimized+'\n');
 const before=await sharp(Buffer.from(tight),{density:576}).resize(300,96,{fit:'contain',background:'#fff'}).flatten({background:'#fff'}).raw().toBuffer();
 const after=await sharp(Buffer.from(optimized),{density:576}).resize(300,96,{fit:'contain',background:'#fff'}).flatten({background:'#fff'}).raw().toBuffer();
 let error=0;for(let i=0;i<before.length;i++)error+=Math.abs(before[i]-after[i]);
 const comparisonError=error/before.length/255;
 manifest.push({...job,viewBox:[x,y,w,h],ratio:w/h,originalBytes:Buffer.byteLength(original),optimizedBytes:Buffer.byteLength(optimized)+1,precision,comparisonError});
 const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="340" height="104"><rect width="100%" height="100%" fill="white"/><text x="12" y="54" font-family="Arial" font-size="19">${job.name}</text></svg>`);
 composites.push({input:await sharp(label).png().toBuffer(),left:0,top:index*104},{input:await sharp(before,{raw:{width:300,height:96,channels:3}}).png().toBuffer(),left:340,top:index*104+4},{input:await sharp(after,{raw:{width:300,height:96,channels:3}}).png().toBuffer(),left:660,top:index*104+4});
}
await writeFile(`${root}/manifest.json`,JSON.stringify({svgo:'4.1.0',transformPrecision:8,plugins:names,logos:manifest},null,2)+'\n');
await sharp({create:{width:980,height:jobs.length*104,channels:3,background:'#fff'}}).composite(composites).png().toFile('deliverables/company-logos/optimization-review.png');
console.log(JSON.stringify(manifest.map(({slug,originalBytes,optimizedBytes,ratio,precision,comparisonError})=>({slug,originalBytes,optimizedBytes,ratio,precision,comparisonError})),null,2));
