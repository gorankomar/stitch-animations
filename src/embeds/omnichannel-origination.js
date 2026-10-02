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
   tracks.forEach((track,i)=>{
    const sequence=track.querySelector('[data-oo-sequence]');
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    const lap=sequence.getBoundingClientRect().width+gap;
    if(!lap)throw new Error('Unmeasurable origination row');
    const count=Math.ceil(frame.getBoundingClientRect().width/lap)+2;
    for(let j=0;j<count;j++){
     const copy=sequence.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.setAttribute('data-oo-generated','');
     track.append(copy);generated.push(copy);
    }
    const left=i!==1;
    const a=track.animate([{transform:`translateX(${left?0:-lap}px)`},{transform:`translateX(${left?-lap:0}px)`}],{duration:duration*[36,44,40][i],iterations:Infinity,easing:'linear'});
    a.pause();animations.push(a);
   });
   // Shared monotonic radial mapping keeps phase-separated rings from overtaking.
   // The minimum diameter extends beyond the card, so births stay visible.
   const cycle=duration*24;
   rings.forEach((ring,i)=>{
    const base=[310,238,170][i];
    const radii=Array.from({length:25},(_,step)=>{
     const p=step/24;
     return {offset:p,transform:`scale(${(170+216*(.8*p+.2*p*p))/base})`};
    });
    const movement=ring.animate(radii,{duration:cycle,iterations:Infinity,easing:'linear'});
    const fade=ring.animate([{opacity:0,offset:0},{opacity:.8,offset:.025},{opacity:.8,offset:.92},{opacity:0,offset:1}],{duration:cycle,iterations:Infinity,easing:'linear'});
    movement.pause();fade.pause();
    const phase=(2-i)/3+.03;
    movement.currentTime=cycle*phase;fade.currentTime=cycle*phase;
    animations.push(movement,fade);
   });
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
