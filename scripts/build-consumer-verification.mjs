import fs from 'node:fs/promises';
import {build} from 'esbuild';
const {optimize}=await import(process.env.SVGO_MODULE || 'svgo');
const dir='src/embeds/assets/consumer-verification';
const config={multipass:true,floatPrecision:2,plugins:['removeDoctype','removeXMLProcInst','removeComments','removeMetadata','removeEditorsNSData','cleanupAttrs','mergeStyles','inlineStyles','minifyStyles','convertStyleToAttrs','cleanupNumericValues','cleanupListOfValues','convertColors','removeUnknownsAndDefaults','removeNonInheritableGroupAttrs','removeUselessStrokeAndFill','removeUnusedNS',{name:'convertPathData',params:{floatPrecision:2,transformPrecision:8}},{name:'convertTransform',params:{floatPrecision:2,transformPrecision:8}},'convertShapeToPath','sortAttrs','sortDefsChildren']};
let layers='',manifest=[];
const groups=[['right-top',326,-3.84,false],['right-bottom',323,135.11,false],['left-bottom',78,135.11,true],['left-top',80,-3.84,true]];
for(const [name,x,y,flip] of groups){
 const original=await fs.readFile(`${dir}/responsive-original/right-${name.endsWith('top') ? 'top' : 'bottom'}.svg`,'utf8');
 let svg=optimize(original,config).data;
 svg=svg.replace(/id="([^"]+)"/g,(_,id)=>`id="cv-${name}-${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#cv-${name}-${id})`);
 svg=svg.replace(/<path\b([^>]*opacity="\.?0?\.1"[^>]*)>/g,'<path data-cv-pale="" $1>');
 const w=Number(svg.match(/width="([\d.]+)"/)[1]),h=Number(svg.match(/height="([\d.]+)"/)[1]);
 const top=name.endsWith('top');
 // Extend only straight stems; preserve the exported bends without stretching.
 svg=svg.replace(/(<path\b[^>]*\bd=")([^"]+)(")/g,(_,before,d,after)=>{
   d=d.replace(/[vV][-\d.]+$/,`V${top ? -2048 : 2048}`);
   if(!before.includes('data-cv-pale')) {
     const [,x,y,tail]=d.match(/^m([-\d.]+) ([-\d.]+) ?(.*)$/);
     const tangent=top ? -8.04/40.48 : 9.1/43.69;
     before+=`M -2048 ${y} C -1024 ${y} ${Number(x)-20} ${Number(y)-tangent*20} ${x} ${y} l${tail}`;
     return `${before}${after} data-cv-anchor-x="${x}" data-cv-anchor-y="${y}" data-cv-tangent="${tangent}" data-cv-tail="l${tail}"`;
   }
   return before+d+after;
 });
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
const iconMarkup=name=>`<div class="cv-icon"><div data-cv-icon-content="">${icons[name]}</div></div>`;
const labelMarkup=(name,label,icon,center=false)=>`<div data-cv-label-component="${center?'center':'outer'}" class="cv-label-component"><div class="${center?'cv-consumer':'cv-label'}">${center?`<div class="cv-avatar">${iconMarkup(icon)}</div>`:iconMarkup(icon)}<div class="${center?'cv-consumer-text':'cv-label-text'}" data-cv-label-text="">${label}</div></div></div>`;
let markup=`<div class="cv-graphic" data-consumer-verification-fluid="" role="group" aria-label="Verification connections"><div class="cv-frame">${layers}<div class="cv-center-position" data-cv-slot="center"><div data-cv-label-slot="">${labelMarkup('center','Consumer','user',true)}</div></div>`;
for(const [name,label,icon] of labels)markup+=`<div class="cv-label-position cv-position-${name}" data-cv-slot="${name}"><div data-cv-label-slot="">${labelMarkup(name,label,icon)}</div></div>`;
markup+='</div></div>';
const q=n=>`min(${n/258*100}cqi,${n/232*100}cqb)`;
let native=`.cv-shell{width:100%;aspect-ratio:258 / 232}.cv-shell-wide{aspect-ratio:540 / 324}.cv-graphic{width:100%;height:100%;min-width:0}.cv-frame{position:relative;width:100%;height:100%;overflow:hidden;border-radius:${q(8)};border:${q(1)} solid #f9f9f9;background-color:#fff;background-image:linear-gradient(228.037deg,rgba(233,249,255,.37),rgba(255,255,255,.37) 48.599%,rgba(233,249,255,.37))}.cv-line-slot{position:absolute;pointer-events:none}.cv-label-position{position:absolute;z-index:2}.cv-label{display:flex;align-items:center;gap:${q(6)};padding:${q(6)} ${q(8)};border-radius:${q(20)};background-color:#fff;box-shadow:0 0 ${q(5)} #0000001a;color:#000}.cv-icon{width:${q(12)};height:${q(12)};flex-shrink:0;display:flex;align-items:center;justify-content:center}.cv-label-text{font-size:${q(8)};line-height:1.25;font-weight:500;white-space:nowrap}.cv-center-position{position:absolute;left:50%;top:50%;z-index:3}.cv-consumer{display:flex;align-items:center;gap:${q(10)};padding:${q(9)};border:${q(1)} solid #efefef;border-radius:${q(40)};background-color:#3d3d3d;color:#fff}.cv-avatar{color:#3d3d3d;display:flex;padding:${q(2)};border-radius:${q(50)};background-color:white}.cv-consumer-text{width:auto;font-size:${q(12)};line-height:1.25;font-weight:500;white-space:nowrap}`;
// Centers follow the dark vertical stems in the supplied 540 x 278 reference.
for(const [name,x,y] of [['documents',139.25,47],['income',399.15,47],['identity',136.25,236.5],['employment',401.25,236.5]])native+=`.cv-position-${name}{left:${x/540*100}%;top:${y/278*100}%}`;
const u=n=>`min(${n/540*100}cqi,${n/232*100}cqb)`;
for(const g of manifest.filter(x=>x.w)){
 const top=g.name.endsWith('top'),right=g.name.startsWith('right');
 const stem=top?73.15:78.16,anchorY=top?135:9.25;
 const labelX=top?(right?399.15:139.25):(right?401.25:136.25);
 native+=`.cv-slot-${g.name}{left:calc(${labelX/540*100}% - ${u(right?stem:g.w-stem)});top:calc(50% - ${u(anchorY)} ${top?'-':'+'} ${q(4)});width:${u(g.w)};height:${u(g.h)}}`;
}
const clipCss=manifest.filter(x=>x.w).map(g=>{
 const top=g.name.endsWith('top'),right=g.name.startsWith('right');
 const labelX=top?(right?399.15:139.25):(right?401.25:136.25);
 return `.cv-slot-${g.name}{clip-path:inset(-1000cqi -1000cqi -1000cqi calc(${right?50-labelX/540*100:labelX/540*100-50}cqi + ${u(top?73.15:78.16)}))}`;
}).join('');
const css=`${clipCss}.cv-graphic{container-type:size;writing-mode:horizontal-tb}.cv-frame{box-sizing:border-box}.cv-center-position,.cv-label-position{transform:translate(-50%,-50%)}.cv-icon>div{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.cv-icon>div:empty{display:none}.cv-icon svg{width:100%;height:100%;display:block}.cv-slot-left-top,.cv-slot-left-bottom{transform:scaleX(-1)}.cv-line-slot>svg{width:100%;height:100%}.cv-label{transition:translate var(--motion-duration-fast) var(--motion-ease-primary),box-shadow var(--motion-duration-fast) var(--motion-ease-primary)}@media(hover:hover) and (pointer:fine){.cv-label:hover{translate:0 calc(-1 * min(1.2cqi,1.3344827586cqb));box-shadow:0 ${q(5.16)} ${q(12.9)} rgba(51,66,255,.09)}}@media(prefers-reduced-motion:reduce){.cv-label{transition:none}.cv-label:hover{translate:none}.cv-graphic [data-cv-pulse]{opacity:0!important}}`;
await fs.writeFile('src/embeds/consumer-verification-markup.html',markup);
await fs.writeFile('src/embeds/consumer-verification-native.css',native);
await fs.writeFile('src/embeds/consumer-verification.css',css);
await fs.writeFile(`${dir}/optimization.json`,JSON.stringify({version:'4.1.0',config,exceptions:['removeXMLNS','cleanupIds','mergePaths','collapseGroups','removeHiddenElems','removeViewBox','removeDimensions','removeTitle','removeDesc'],manifest},null,2));
const result=await build({entryPoints:['src/embeds/consumer-verification.js'],bundle:true,write:false,minify:true,format:'iife',target:'es2020'});
await fs.mkdir('dist/embeds',{recursive:true});
await fs.writeFile('dist/embeds/consumer-verification-motion.html',`<script>${result.outputFiles[0].text}</script>`);
await fs.writeFile('dist/embeds/consumer-verification-styles.html',`<style>${css}</style>`);
await fs.writeFile('consumer-verification.html',`<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Consumer Verification</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,sans-serif;background:#fafafa;--motion-ease-primary:cubic-bezier(.11,.61,.27,.99);--motion-duration-default:770ms;--motion-duration-fast:calc(var(--motion-duration-default)*.6)}main{width:min(1100px,calc(100vw - 32px));display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:32px 0}h2{font-size:14px;font-weight:500}section{min-width:0}@media(max-width:700px){main{grid-template-columns:1fr}}${native}${css}</style><main><section><h2>Consumer Verification · 258 × 232</h2><div class="cv-shell">${markup}</div></section><section><h2>Wide · 540 × 324</h2><div class="cv-shell cv-shell-wide">${markup.replaceAll('id="cv-','id="wide-cv-').replaceAll('url(#cv-','url(#wide-cv-')}</div></section></main><script type="module" src="/src/embeds/consumer-verification.js"></script></html>`);
console.log('Built Consumer Verification assets, preview and separate draft embeds');
