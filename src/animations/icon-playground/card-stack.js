const ns='http://www.w3.org/2000/svg';
export function cardStackOffsets(progress, spacing=2.2) {
  return [-spacing*progress,0,spacing*progress];
}
export function cardStackWidths(progress) {
 return [1-.16*progress,1-.08*progress,1];
}
// Reuse the complete live artwork, so every shared color effect also appears
// on the two cards behind it. One original face stays in front at the bottom.
export function createCardStack(art, id, options={}) {
 const {svg,basePaths,width}=art;
 // Preserve identical pen weight through the rear cards' horizontal compression.
 // Root CSS sizing remains shared by the entire stack. Lazy effect copies inherit this.
 svg.querySelectorAll('path').forEach(path=>{
  path.setAttribute('vector-effect','non-scaling-stroke');
  // SVG use copies cannot rely on the outer .icon-art path selector.
  // Put the live width on the source itself so every referenced face resolves it.
  path.setAttribute('stroke-width','var(--stroke, 1.4)');
 });
 const face=document.createElementNS(ns,'g');face.id=`${id}-card-face`;
 const outline=basePaths.find(path=>/z/i.test(path.getAttribute('d')));
 if(outline){const backing=outline.cloneNode();backing.removeAttribute('id');backing.removeAttribute('class');backing.removeAttribute('style');backing.setAttribute('fill','#efefef');backing.setAttribute('stroke','none');face.append(backing);}
 for(const child of [...svg.children])if(child.tagName.toLowerCase()!=='defs')face.append(child);
 if(options.direction==='sides'){
  // Plain rear sheets own their complete effect layers, including lazy pulse paths.
  const papers=['left','right'].map(side=>face.querySelector(`.rear-paper-${side}`));
  papers.forEach(group=>{
   const backing=group.querySelector('path').cloneNode();backing.removeAttribute('style');backing.removeAttribute('class');
   backing.setAttribute('fill','#efefef');backing.setAttribute('stroke','none');group.prepend(backing);
   svg.append(group);
  });
  svg.append(face);
  return progress=>papers.forEach((group,index)=>{
   group.setAttribute('transform',`translate(${(index===0?-1:1)*options.spacing*progress} 0)`);
   group.style.display=progress>0?'':'none';
  });
 }
 const copies=[0,1].map(()=>{const use=document.createElementNS(ns,'use');use.setAttribute('href',`#${face.id}`);use.style.display='none';svg.append(use);return use;});
 const foreground=document.createElementNS(ns,'g');foreground.classList.add('card-stack-front');foreground.append(face);svg.append(foreground);
 return (motionProgress)=>{
  const {rear,rearX=[0,0],front,widths}=stackLayout(motionProgress,options);
  copies.forEach((use,index)=>{use.setAttribute('transform',`translate(${width/2+rearX[index]} ${rear[index]}) scale(${widths[index]} 1) translate(${-width/2} 0)`);use.style.opacity='1';use.style.display=motionProgress>0?'':'none';});
  foreground.setAttribute('transform',`translate(0 ${front})`);
 };
}

export function stackLayout(progress,{direction='above',spacing=2.2}={}){
 if(direction==='sides')return {rear:[0,0],rearX:[-spacing*progress,spacing*progress],front:0,widths:[1,1,1]};
 const [top,middle,bottom]=cardStackOffsets(progress,spacing);
 return {rear:[direction==='below'?bottom:top,middle],front:direction==='below'?top:bottom,widths:cardStackWidths(progress)};
}
