import { createExpandingRings } from '../lib/effects/expanding-rings.js';
import { stageInitializer } from '../lib/effects/animation-stage.js';

export function durationMilliseconds(value) {
 const n=Number.parseFloat(value);
 return Number.isFinite(n) ? n*(value.trim().endsWith('ms')?1:1000) : NaN;
}
export const init = stageInitializer('[data-3ds-enabled-security]', root => {
 const frame=root.querySelector('.tds-frame'), badge=root.querySelector('[data-tds-heartbeat]');
 const rings=[...root.querySelectorAll('[data-tds-ring]')];
 if(!frame || !badge || rings.length!==3) return ()=>{};
 const tokens=getComputedStyle(root), easing=tokens.getPropertyValue('--motion-ease-primary').trim();
 const duration=durationMilliseconds(tokens.getPropertyValue('--motion-duration-default'));
 if(!easing || !Number.isFinite(duration) || duration<=0 || !CSS.supports('animation-timing-function',easing)) return ()=>{};
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false, disposed=false, observer,resize;
 const animations=[];
 function cancelMotion(){
  animations.splice(0).forEach(a=>a.cancel());
  root.removeAttribute('data-tds-ready');
 }
 function setup(){
  try {
   createExpandingRings({rings,duration,diameters:[488,380,264],minimum:264,range:264*216/170,sizing:{designWidth:540},animations});
   const pulse=badge.animate([1,1.055,1,1.035,1,1].map((scale,i)=>({offset:[0,.1,.22,.32,.48,1][i],width:`${152/5.4*scale}cqi`,height:`${152/5.4*scale}cqi`,easing})),{duration:duration*2.4,iterations:Infinity});
   pulse.pause();animations.push(pulse);
   root.setAttribute('data-tds-ready','');
  }catch(error){cancelMotion();console.warn('3DS-enabled security retained its static fallback.',error);}
 }
 function synchronize(){
  if(disposed)return;
  if(media.matches){cancelMotion();return;}
  const active=visible&&!document.hidden;
  if(active&&!animations.length)setup();
  animations.forEach(a=>active?a.play():a.pause());

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
 const key=Symbol.for('stitch.3ds-enabled-security.init');
 const mount=window[key] ||= init;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
