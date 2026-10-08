import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createDemoCursor, sampleCursor, clampProgress } from '../lib/effects/demo-cursor.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { getPrimaryEase, getDefaultDurationMs } from '../lib/easing.js';
import { toMs } from '../lib/time.js';
import { cubicBezier } from '../lib/motion.js';

// Two seconds behind the Saudi panel in each half-cycle; clicks change state
// only after arrival. Coordinates are measured separately by each consumer.
export const SCHEMES_PERIOD = 14;
export function schemesState(time, locations, ease = p => p) {
  const remainder = time % SCHEMES_PERIOD;
  const t = remainder < 0 ? remainder + SCHEMES_PERIOD : remainder;
  const keys = ['entry','entry','outside','afrigo','afrigo','mada','mada','exit','hidden','hidden','entry','outside','afrigo','afrigo','mada','mada','exit','hidden','hidden'];
  const times = [0,.2,.85,1.8,2.25,3.25,3.7,4.5,5,7,7.2,7.85,8.8,9.25,10.25,10.7,11.5,12,14];
  const position = sampleCursor(times.map((time,i)=>({time,...locations[keys[i]]})),t,ease);
  const fadeIn = clampProgress((t-(t<7? .2:7.2))/.3);
  const fadeOut = 1-clampProgress((t-(t<7?4.8:11.8))/.2);
  return {...position,opacity:t<.2||(t>=5&&t<7.2)||t>=12?0:fadeIn*fadeOut,behind:t<.5||(t>=4.5&&t<7.5)||t>=11.5,pressed:[2,3.45,9,10.45].some(at=>t>=at&&t<at+.16),afrigo:t>=2.08&&t<9.08,mada:t>=3.53&&t<10.53};
}
let instanceSerial = 0;
function namespaceArtwork(root) {
  const saved = [], prefix = `new-schemes-${++instanceSerial}-`;
  for (const svg of root.querySelectorAll('svg')) {
    const ids = new Map([...svg.querySelectorAll('[id]')].map(node => [node.id, prefix + node.id]));
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      for (const attribute of [...node.attributes]) {
        let value = attribute.value;
        if (attribute.name === 'id' && ids.has(value)) value = ids.get(value);
        else for (const [oldId, newId] of ids) {
          value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`);
          if ((attribute.name === 'href' || attribute.name === 'xlink:href') && value === `#${oldId}`) value = `#${newId}`;
        }
        if (value !== attribute.value) { saved.push([node, attribute.name, attribute.value]); node.setAttribute(attribute.name, value); }
      }
    }
  }
  return () => saved.forEach(([node, name, value]) => node.setAttribute(name, value));
}

export const init=stageInitializer('[data-new-schemes]',root=>{
  const frame=root.querySelector('.ns-frame'),pointer=root.querySelector('.ns-cursor');
  const panels=[...root.querySelectorAll('[data-ns-panel]')];
  const options=['afrigo','mada'].map(name=>root.querySelector(`[data-ns-option="${name}"] .ns-check`));
  if(!frame||!pointer||panels.length!==2||options.some(n=>!n))return;
  const raw=getPrimaryEase().match(/cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
  if(!raw||raw.length!==4||raw.some(v=>!Number.isFinite(v)))return;
  const ease=cubicBezier(...raw),duration=getDefaultDurationMs()/1000;
  const targets=[...root.querySelectorAll('[data-ns-reveal]')];
  let tracks=targets.map(node=>createRevealTrack(node,{frame,offset:12*frame.getBoundingClientRect().width/540}));
  const cursor=createDemoCursor(pointer,{designWidth:540,frame});
  const restoreArtwork=namespaceArtwork(root);
  const saved=options.map(node=>node.classList.contains('ns-checked'));
  const stagger=toMs(getComputedStyle(root).getPropertyValue('--reveal-stagger-default'),200)/1000;
  const opacityRatio=parseFloat(getComputedStyle(root).getPropertyValue('--reveal-opacity-ratio'))||.34;
  let revealWidth=frame.getBoundingClientRect().width;
  const entranceEnd=Math.max(...targets.map(n=>Number(n.dataset.nsReveal)/.2*stagger))+duration;
  root.dataset.nsReady='';
  let dispose;
  const restore=()=>{restoreArtwork();cursor.dispose();tracks.forEach(track=>track.dispose());options.forEach((node,i)=>node.classList.toggle('ns-checked',saved[i]));panels.forEach(n=>n.removeAttribute('data-ns-demo-hover'));delete root.dataset.nsReady;};
  try { dispose=animateStage(root,{nodes:panels,update({time,reduced,dirty}){
    if(dirty){
      const width=frame.getBoundingClientRect().width;
      if(width!==revealWidth){tracks.forEach(track=>track.dispose());tracks=targets.map(node=>createRevealTrack(node,{frame,offset:12*width/540}));revealWidth=width;}
      tracks.forEach(track=>track.measure());
    }
    tracks.forEach((track,i)=>{const progress=reduced?1:clampProgress((time-Number(targets[i].dataset.nsReveal)/.2*stagger)/duration);track.render(progress,ease,clampProgress(progress/opacityRatio));});
    if(reduced||time<entranceEnd){cursor.hide();panels.forEach(n=>n.removeAttribute('data-ns-demo-hover'));options.forEach((node,i)=>node.classList.toggle('ns-checked',reduced?saved[i]:false));return;}
    // Measure every frame: CSS hover translate can continue after the pointer
    // has moved. The demo tip must track the actual moving checkboxes.
    const bounds=frame.getBoundingClientRect(),scale=bounds.width/540;
    const point=(x,y)=>({x:(x-bounds.left)/scale,y:(y-bounds.top)/scale});
    const box=panels[1].getBoundingClientRect(),saudi=panels[0].getBoundingClientRect();
    const target=node=>{const b=node.getBoundingClientRect();return point(b.left+b.width/2,b.top+b.height/2);};
    const locations={entry:point(box.right-25*scale,box.bottom-15*scale),outside:point(box.right+12*scale,box.bottom+12*scale),afrigo:target(options[0]),mada:target(options[1]),exit:point(saudi.left-12*scale,saudi.bottom+8*scale),hidden:point(saudi.left+24*scale,saudi.bottom-25*scale)};
    const state=schemesState(time-entranceEnd,locations,ease);
    options[0].classList.toggle('ns-checked',state.afrigo);options[1].classList.toggle('ns-checked',state.mada);
    cursor.render(state);
    panels.forEach(panel=>{const b=panel.getBoundingClientRect();const x=bounds.left+state.x*scale,y=bounds.top+state.y*scale;panel.toggleAttribute('data-ns-demo-hover',!state.behind&&state.opacity>.5&&x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom);});
  }}); } catch(error) {restore();console.warn('New schemes motion unavailable; showing static illustration.',error);return;}
  return()=>{dispose();restore();};
});
if(typeof document!=='undefined'){
  const key=Symbol.for('stitch.new-schemes.init');
  const mount=window[key] ||= init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
