import {PAPER_ORIGINAL} from './paper-alt-motion.js';
const ns='http://www.w3.org/2000/svg';
const clamp=x=>Math.max(0,Math.min(1,x));
export function foldSurfacePath(points){
 const [[x,top],[,bottom],[right]]=points;
 // Preserve the original folded corner's authored cubic rounding as it grows.
 return `M${x} ${top}V${bottom-1.06667}C${x} ${bottom-.6933} ${x} ${bottom-.50661} ${x+.07267} ${bottom-.36401}C${x+.13658} ${bottom-.23856} ${x+.23857} ${bottom-.13658} ${x+.36401} ${bottom-.07266}C${x+.50662} ${bottom} ${x+.69331} ${bottom} ${x+1.06667} ${bottom}H${right}Z`;
}
export function paperFlipState(p,ease=x=>x){
 const turn=ease(clamp(p/.78));
 // One deformation parameter drives the crease and the sheet being pulled.
 const lead=turn,exit=turn;
 return {
  lead,turn,exit,
  x:-10.8*turn,y:2.8*turn,rotation:12*turn,scale:1-.18*turn,
  // The upper crease point stays fixed; the lower tip stretches down and left.
  folded:[[9.33333-1.4*turn,1.33333],[9.33333-1.4*turn,Math.min(14.6667,5.33333+10.5*turn)],[13.3333,Math.min(14.6667,5.33333+10.5*turn)]],
  content:clamp((turn-.72)/.28)
 };
}
export function flipOutline(state){
 if(state.turn===0)return PAPER_ORIGINAL[0];
 const right=13.3333,bottom=14.6667,edgeY=state.folded[2][1];
 const radius=Math.min(3.2,Math.max(0,bottom-edgeY));
 const rounded=`H${right-radius}C${right-radius*.6498} ${bottom} ${right-radius*.4745} ${bottom} ${right-radius*.3408} ${bottom-radius*.0681}C${right-radius*.2232} ${bottom-radius*.128} ${right-radius*.128} ${bottom-radius*.2232} ${right-radius*.0681} ${bottom-radius*.3408}C${right} ${bottom-radius*.4745} ${right} ${bottom-radius*.6498} ${right} ${bottom-radius}V${edgeY}L${state.folded[0][0]} ${state.folded[0][1]}Z`;
 // Keep the closing crease above the shrinking lower-right arc: no reversed edge.
 return PAPER_ORIGINAL[0].replace(/^M9\.33333/,`M${state.folded[0][0]}`).replace(/H10\.1333C.*Z$/,rounded);
}
export function preparePaperFlip(svg){
 svg.replaceChildren();
 for(const sheet of [1,0]){
  const group=document.createElementNS(ns,'g');group.classList.add(`flip-sheet-${sheet}`);
  if(sheet===0){const backing=document.createElementNS(ns,'polygon');backing.setAttribute('points','2.66667,1.33333 9.33333,1.33333 13.3333,5.33333 13.3333,14.6667 2.66667,14.6667');backing.setAttribute('fill','#efefef');group.append(backing);}
  for(let i=0;i<5;i++){
   const path=document.createElementNS(ns,'path');path.classList.add(`motion-piece-${sheet*5+i}`,`flip-paper-part-${sheet}`);path.setAttribute('d',PAPER_ORIGINAL[i]);path.setAttribute('fill','none');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');group.append(path);
  }
  svg.append(group);
 }
 const panel=document.createElementNS(ns,'g');panel.classList.add('flip-panel');
 const backing=document.createElementNS(ns,'path');backing.setAttribute('data-effect-backing','');backing.setAttribute('fill','#efefef');backing.setAttribute('stroke','none');backing.setAttribute('d',foldSurfacePath(paperFlipState(0).folded));panel.append(backing);
 const edge=document.createElementNS(ns,'path');edge.classList.add('motion-piece-10','flip-panel-edge');edge.setAttribute('fill','none');edge.setAttribute('stroke-linejoin','round');edge.setAttribute('d','M9.33333 1.33333V5.33333H13.3333Z');panel.append(edge);
 const frame=document.createElementNS(ns,'g');frame.classList.add('flip-frame');frame.append(svg.querySelector('.flip-sheet-0'),panel);svg.append(frame);
}
function ensureClips(svg){
 if(svg.dataset.flipClip)return;
 const defs=svg.querySelector('defs'),id=svg.querySelector('linearGradient').id;
 for(const [name,d]of [['page',PAPER_ORIGINAL[0]],['front',PAPER_ORIGINAL[0]]]){
  const clip=document.createElementNS(ns,'clipPath');clip.id=`${id}-flip-${name}`;
  const path=document.createElementNS(ns,'path');path.setAttribute('d',d);clip.append(path);defs.append(clip);
 }
 svg.querySelector('.flip-frame').setAttribute('clip-path',`url(#${id}-flip-page)`);
 const mask=document.createElementNS(ns,'mask');mask.id=`${id}-flip-interior`;
 for(const [key,value]of Object.entries({maskUnits:'userSpaceOnUse',x:-4,y:-4,width:24,height:24,'mask-type':'luminance'}))mask.setAttribute(key,value);
 const interior=document.createElementNS(ns,'path');interior.setAttribute('d',PAPER_ORIGINAL[0]);interior.setAttribute('fill','white');interior.setAttribute('stroke','black');interior.setAttribute('stroke-width','var(--stroke, 1.4)');mask.append(interior);defs.append(mask);
 svg.dataset.flipClip=id;
}
export function renderPaperFlip(svg,p,ease){
 ensureClips(svg);const s=paperFlipState(p,ease),id=svg.dataset.flipClip;
 const frame=svg.querySelector('.flip-frame');if(p===0){frame.removeAttribute('clip-path');frame.removeAttribute('mask');}else{frame.setAttribute('clip-path',`url(#${id}-flip-page)`);frame.setAttribute('mask',`url(#${id}-flip-interior)`);}
 svg.querySelector(`#${id}-flip-front path`).setAttribute('d',flipOutline(s));
 const old=svg.querySelector('.flip-sheet-0');old.style.display=p<.9?'':'none';old.removeAttribute('clip-path');
 const transform=`translate(${s.x} ${s.y}) rotate(${s.rotation} 8 8) translate(8 8) scale(${s.scale}) translate(-8 -8)`;
 old.setAttribute('transform',transform);
 old.querySelector('polygon').setAttribute('points',`2.66667,1.33333 ${s.folded[0][0]},1.33333 13.3333,${s.folded[2][1]} 13.3333,14.6667 2.66667,14.6667`);
 svg.querySelector('.flip-sheet-1').style.display=p>0?'':'none';
 const panel=svg.querySelector('.flip-panel');panel.setAttribute('transform',transform);
 panel.style.display=p>0&&p<.9?'':'none';panel.querySelector('[data-effect-backing]').setAttribute('d',foldSurfacePath(s.folded));
 for(const path of svg.querySelectorAll('path')){
  const cls=[...path.classList].find(c=>c.startsWith('motion-piece-'));if(!cls)continue;
  const index=Number(cls.slice(13)),part=index%5;
  if(index===10){path.setAttribute('d',foldSurfacePath(s.folded));continue;}
  path.style.visibility=index===1&&p>0?'hidden':index>=7&&s.content===0?'hidden':'visible';
  if(index>=2&&index<=4)path.setAttribute('clip-path',`url(#${id}-flip-front)`);
  let d=index===0?flipOutline(s):PAPER_ORIGINAL[part];
  if(index>=7&&s.content<1){const draw=clamp((s.content-(part-2)*.16)/.68);path.style.visibility=draw===0?'hidden':'visible';const y=[6,8.66667,11.3333][part-2],length=(part===2?1.33334:5.33337)*draw;d=`M${5.33333+Math.max(.001,length)} ${y}H5.33333`;}
  path.setAttribute('d',d);
 }
}
