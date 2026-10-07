import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS } from '../lib/effects/reveal-groups.js';
import { createValueCounter } from '../lib/effects/value-counter.js';
import { sampleUpwardCarousel } from '../lib/effects/upward-carousel.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';
const clamp = t => Math.max(0, Math.min(1,t));
export function transferTiming(duration, stagger=HARD_REVEAL_STAGGER_MS) {
  return {softStart:duration, labelsStart:stagger*2, loopStart:stagger*4+duration};
}
export const init = stageInitializer('[data-peer-to-peer-transfers]', root => {
  const frame=root.querySelector('.p2p-frame'), phone=root.querySelector('.rp-screen');
  const hard=[...root.querySelectorAll('[data-p2p-hard]')];
  const soft=[...root.querySelectorAll('[data-p2p-soft]')];
  const labels=[...root.querySelectorAll('[data-p2p-label]')];
  const entrances=[...root.querySelectorAll('[data-p2p-label-reveal]')];
  const value=root.querySelector('[data-p2p-value]');
  if(!frame||!phone||!value||![3,4].includes(hard.length)||soft.length!==4||labels.length!==5||entrances.length!==5)return;
  const css=getComputedStyle(root), duration=toMs(css.getPropertyValue('--motion-duration-default'),0);
  const curve=css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  if(!(duration>0)||curve?.length!==4||!curve.every(Number.isFinite))return;
  const ease=cubicBezier(...curve), timing=transferTiming(duration);
  const softStagger=toMs(css.getPropertyValue('--reveal-stagger-default'),200);
  const ratio=parseFloat(css.getPropertyValue('--reveal-opacity-ratio'))||.34;
  const amount=Number(value.dataset.p2pValue); if(!Number.isFinite(amount))return;
  const savedText=value.textContent, savedLabels=labels.map(n=>n.style.cssText);
  const tracks=[], softTracks=[], labelTracks=[];
  let stage,counter,disposed=false,width=frame.clientWidth;
  const restore=()=>{[...tracks,...softTracks,...labelTracks].forEach(t=>t.dispose());labels.forEach((n,i)=>n.style.cssText=savedLabels[i]);value.textContent=savedText;delete root.dataset.p2pReady;};
  const dispose=()=>{if(disposed)return;disposed=true;stage?.();counter?.dispose();restore();};
  try {
    hard.forEach(n=>tracks.push(createRevealTrack(n,{frame,mode:'hard',direction:'bottom-to-top',bleed:width*.04})));
    entrances.forEach(n=>labelTracks.push(createRevealTrack(n,{frame,mode:'hard',direction:'bottom-to-top',bleed:width*.04})));
    const makeSoft=()=>soft.forEach(n=>softTracks.push(createRevealTrack(n,{frame:phone,mode:'soft',direction:'bottom-to-top',offset:frame.clientWidth*24/540})));
    makeSoft();
    counter=createValueCounter({element:value,driver:'external',initialValue:amount,formatter:n=>`$${Math.round(n).toLocaleString('en-US')}`});
    stage=animateStage(root,{update({time,reduced,dirty}){
      try {
        if(!root.isConnected){dispose();return;}
        if(reduced){restore();return;}
        root.dataset.p2pReady='';
        if(dirty){
          if(width!==frame.clientWidth){softTracks.forEach(t=>t.dispose());softTracks.length=0;width=frame.clientWidth;makeSoft();}
          [...tracks,...softTracks,...labelTracks].forEach(t=>t.measure());
        }
        const ms=time*1000;
        tracks.forEach((t,i)=>t.render(clamp((ms-i*HARD_REVEAL_STAGGER_MS)/duration),ease));
        softTracks.forEach((t,i)=>{const p=ms-timing.softStart-i*softStagger;t.render(clamp(p/duration),ease,clamp(p/(duration*ratio)));});
        counter.jumpTo(amount*ease(clamp((ms-timing.softStart)/duration)));
        labelTracks.forEach((t,i)=>{const order=i===1?0:i===0?1:i===4?2:-1;t.render(order<0?1:clamp((ms-timing.labelsStart-order*HARD_REVEAL_STAGGER_MS)/duration),ease);});
        labels.forEach((n,i)=>{const pose=sampleUpwardCarousel(Math.max(0,ms-timing.loopStart),i,duration,ease,{spacing:47,adjacentScale:.73,adjacentOpacity:1});n.style.transform=`translateY(${pose.y/5.4}cqi) scale(${pose.scale})`;n.style.opacity=String(pose.opacity);n.style.visibility=pose.opacity===0?'hidden':'visible';});
      }catch(error){dispose();console.error('Peer-to-peer transfers render failed',error);}
    }});
  }catch(error){dispose();console.error('Peer-to-peer transfers setup failed',error);}
  return dispose;
});
if(typeof document!=='undefined'){
  const mount=window[Symbol.for('stitch.peer-to-peer-transfers.init')] ||= init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
