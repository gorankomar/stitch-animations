import fs from 'node:fs/promises';
import {build} from 'esbuild';
const {optimize}=await import(process.env.SVGO_MODULE || 'svgo');
const dir='src/embeds/assets/consumer-verification';
const config={multipass:true,floatPrecision:2,plugins:['removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData','cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs','cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults','removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','removeUnusedNS',{name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},{name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},'convertShapeToPath','sortAttrs','sortDefsChildren']};
let layers='',manifest=[];
const groups=[['right-top',173.3,-5.5,false],['right-bottom',170.79,116.25,false],['left-bottom',21.8,116.25,true],['left-top',21.8,.5,true]];
for(const [name,x,y,flip] of groups){
 const original=await fs.readFile(`${dir}/original/${name}.svg`,'utf8');
 let svg=optimize(original,config).data;
 svg=svg.replace(/id="([^"]+)"/g,(_,id)=>`id="cv-${name}-${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#cv-${name}-${id})`);
 svg=svg.replace(/<path\b([^>]*opacity="\.?0?\.1"[^>]*)>/g,'<path data-cv-pale="" $1>');
 const w=Number(svg.match(/width="([\d.]+)"/)[1]),h=Number(svg.match(/height="([\d.]+)"/)[1]);
 svg=svg.replace('<svg ',`<svg class="cv-lines-${name}" data-cv-lines="${name}" aria-hidden="true" `);
 await fs.writeFile(`${dir}/${name}.svg`,svg);
 layers+=`<div class="cv-line-slot cv-slot-${name}">${svg}</div>`;
 manifest.push({name,w,h,x,y,flip,originalBytes:original.length,optimizedBytes:svg.length});
}
const icons={};
for(const name of ['user','file','bank-note','fingerprint','luggage']){
 const original=await fs.readFile(`${dir}/original/${name}.svg`,'utf8');
 let svg=optimize(original,config).data.replace(/ id="[^"]*"/g,'');
 if(name!=='user')svg=svg.replace(/ stroke-width="[^"]*"/g,'').replace('<svg ','<svg stroke-width="0.7" ');
 svg=svg.replace('<svg ','<svg class="cv-svg" aria-hidden="true" ');
 await fs.writeFile(`${dir}/${name}.svg`,svg);icons[name]=svg;
 manifest.push({name,originalBytes:original.length,optimizedBytes:svg.length});
}
const labels=[['documents','Documents','file',10,25],['income','Income','bank-note',174.1,25],['identity','Identity','fingerprint',17,183],['employment','Employment','luggage',166,183]];
let markup=`<div class="cv-graphic" data-consumer-verification="" role="img" aria-label="Documents, income, identity and employment connect to Consumer"><div class="cv-frame">${layers}<div class="cv-consumer"><div class="cv-avatar"><div class="cv-icon">${icons.user}</div></div><div class="cv-consumer-text">Consumer</div></div>`;
for(const [name,label,icon] of labels)markup+=`<div class="cv-label-position cv-position-${name}"><div class="cv-label"><div class="cv-icon">${icons[icon]}</div><div class="cv-label-text">${label}</div></div></div>`;
markup+='</div></div>';
const q=n=>`${n/258*100}cqi`;
let native=`.cv-graphic{width:100%;min-width:0}.cv-frame{position:relative;width:100%;aspect-ratio:258 / 232;overflow:hidden;border-radius:${q(8)};border:${q(1)} solid #f9f9f9;background-color:#fff;background-image:linear-gradient(228.037deg,rgba(233,249,255,.37),rgba(255,255,255,.37) 48.599%,rgba(233,249,255,.37))}.cv-line-slot{position:absolute;pointer-events:none}.cv-label-position{position:absolute;z-index:2}.cv-label{display:flex;align-items:center;gap:${q(6)};padding:${q(6)} ${q(8)};border-radius:${q(20)};background-color:#fff;box-shadow:0 0 ${q(5)} #0000001a;color:#000}.cv-icon{width:${q(12)};height:${q(12)};flex-shrink:0;display:flex;align-items:center;justify-content:center}.cv-label-text{font-size:${q(8)};line-height:1.25;font-weight:500;white-space:nowrap}.cv-consumer{position:absolute;left:${74/258*100}%;top:${96/232*100}%;z-index:3;display:flex;align-items:center;gap:${q(10)};padding:${q(9)};border:${q(1)} solid #efefef;border-radius:${q(40)};background-color:#3d3d3d;color:#fff}.cv-avatar{color:#3d3d3d;display:flex;padding:${q(2)};border-radius:${q(50)};background-color:white}.cv-consumer-text{width:${q(60)};font-size:${q(12)};line-height:1.25;font-weight:500;white-space:nowrap}`;
for(const [name,, ,x,y] of labels)native+=`.cv-position-${name}{left:${x/258*100}%;top:${y/232*100}%}`;
for(const g of manifest.filter(x=>x.w))native+=`.cv-slot-${g.name}{left:${g.x/258*100}%;top:${g.y/232*100}%;width:${q(g.w)};height:${q(g.h)}}`;
native += ['documents','income','identity','employment'].map((n,i)=>`.cv-position-${n} .cv-label-text{width:${q([44,29,30,48][i])}}`).join('');
const css=`.cv-graphic{container-type:inline-size;writing-mode:horizontal-tb}.cv-frame{box-sizing:border-box}.cv-icon svg{width:${q(12)};height:${q(12)}}.cv-slot-left-top,.cv-slot-left-bottom{transform:scaleX(-1)}.cv-line-slot>svg{width:100%;height:auto}.cv-label{transition:translate var(--motion-duration-fast) var(--motion-ease-primary),box-shadow var(--motion-duration-fast) var(--motion-ease-primary)}@media(hover:hover) and (pointer:fine){.cv-label:hover{translate:0 -1.2cqi;box-shadow:0 2cqi 5cqi rgba(51,66,255,.09)}}@media(prefers-reduced-motion:reduce){.cv-label{transition:none}.cv-label:hover{translate:none}.cv-graphic [data-cv-pulse]{opacity:0!important}}`;
await fs.writeFile('src/embeds/consumer-verification-markup.html',markup);
await fs.writeFile('src/embeds/consumer-verification-native.css',native);
await fs.writeFile('src/embeds/consumer-verification.css',css);
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exceptions:['removeXMLNS','cleanupIds','mergePaths','collapseGroups','removeHiddenElems','removeViewBox','removeDimensions','removeTitle','removeDesc'],manifest},null,2));
const result=await build({entryPoints:['src/embeds/consumer-verification.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/consumer-verification-motion.html',`<script>${result.outputFiles[0].text}</script>`);
await fs.writeFile('dist/embeds/consumer-verification-styles.html',`<style>${css}</style>`);
await fs.writeFile('consumer-verification.html',`<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Consumer Verification</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,sans-serif;background:#fafafa;--motion-ease-primary:cubic-bezier(.11,.61,.27,.99);--motion-duration-default:770ms;--motion-duration-fast:calc(var(--motion-duration-default)*.6)}main{width:min(516px,calc(100vw - 32px))}${native}${css}</style><main>${markup}</main><script type="module" src="/src/embeds/consumer-verification.js"></script></html>`);
console.log('Built Consumer Verification assets, preview and separate draft embeds');
