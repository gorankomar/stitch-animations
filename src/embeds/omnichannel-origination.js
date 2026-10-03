import { createSeamlessMarquee } from '../lib/effects/seamless-marquee.js';
import { createExpandingRings } from '../lib/effects/expanding-rings.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { stageInitializer } from '../lib/effects/animation-stage.js';

export function durationMilliseconds(value) {
 const n=Number.parseFloat(value);
 return Number.isFinite(n) ? n*(value.trim().endsWith('ms')?1:1000) : NaN;
}
export const init = stageInitializer('[data-omnichannel-origination]', root => {
 const frame=root.querySelector('.oo-frame'), reveal=root.querySelector('[data-oo-reveal]');
 const tracks=[...root.querySelectorAll('[data-oo-track]')];
 const rings=[...root.querySelectorAll('[data-oo-ring]')];
 if(!frame || !reveal || tracks.length!==3 || rings.length!==3) return ()=>{};
 const tokens=getComputedStyle(root), easing=tokens.getPropertyValue('--motion-ease-primary').trim();
 const duration=durationMilliseconds(tokens.getPropertyValue('--motion-duration-default'));
 if(!easing || !Number.isFinite(duration) || duration<=0 || !CSS.supports('animation-timing-function',easing)) return ()=>{};
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false, disposed=false, entered=false, follows=null, observer,resize;
 const animations=[], generated=[];
 function cancelMotion(){
  animations.splice(0).forEach(a=>a.cancel());
  generated.splice(0).forEach(n=>n.remove());
  follows?.();follows=null;
  root.removeAttribute('data-oo-ready');
 }
 function setup(){
  try {
   createSeamlessMarquee({tracks,frame,duration,sequenceSelector:'[data-oo-sequence]',generatedAttribute:'data-oo-generated',animations,generated});
   createExpandingRings({rings,duration,animations});
   if(!entered){
    const offset=frame.getBoundingClientRect().bottom-reveal.getBoundingClientRect().top+2;
    const entrance=reveal.animate([{transform:`translateY(${offset}px)`},{transform:'translateY(0)'}],{duration,easing,fill:'both'});
    entrance.pause();animations.push(entrance);
    entrance.onfinish=()=>{entered=true;entrance.cancel();const index=animations.indexOf(entrance);if(index>=0)animations.splice(index,1);};
   }
   root.setAttribute('data-oo-ready','');
  }catch(error){cancelMotion();console.warn('Omnichannel Origination retained its static fallback.',error);}
 }
 function synchronize(){
  if(disposed)return;
  if(media.matches){cancelMotion();return;}
  const active=visible&&!document.hidden;
  if(active&&!animations.length)setup();
  animations.forEach(a=>active?a.play():a.pause());
  if(active&&!follows&&root.hasAttribute('data-oo-ready'))follows=createFollowGroup({root});
  if(!active){follows?.();follows=null;}
 }
 try{
  observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.1;synchronize();},{threshold:[0,.1]});
  observer.observe(root);
  let previousWidth=frame.getBoundingClientRect().width;
  resize=new ResizeObserver(()=>{
   const width=frame.getBoundingClientRect().width;
   if(Math.abs(width-previousWidth)<.1)return;
   previousWidth=width;cancelMotion();synchronize();
  });resize.observe(frame);
  media.addEventListener('change',synchronize);document.addEventListener('visibilitychange',synchronize);
 }catch(error){cancelMotion();observer?.disconnect();resize?.disconnect();}
 return ()=>{disposed=true;cancelMotion();observer?.disconnect();resize?.disconnect();media.removeEventListener('change',synchronize);document.removeEventListener('visibilitychange',synchronize);};
});
if(typeof window!=='undefined'){
 const key=Symbol.for('stitch.omnichannel-origination.init');
 const mount=window[key] ||= init;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
