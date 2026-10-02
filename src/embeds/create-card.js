import { createSoftPathPulse } from '../lib/effects/soft-path-pulse.js';
import { createCodeScrollEffect } from '../lib/effects/code-scroll.js';
const initialized = window.__stitchCreateCard ||= new WeakSet();
const NS = 'http://www.w3.org/2000/svg';
// Uneven starts and periods prevent the five routes from marching in lockstep.
export const pulseTimings = [
  {delay:0,period:4900}, {delay:1370,period:5710},
  {delay:620,period:6370}, {delay:2410,period:7330},
  {delay:3280,period:8110}
];
export function init(root = document) {
  root.querySelectorAll('[data-create-card]').forEach(setup);
}
function setup(root) {
  if(initialized.has(root))return;
  const track=root.querySelector('[data-create-card-track]');
  if(!track)return;
  initialized.add(root);
  const effect=createCodeScrollEffect(track,{typingSelector:'[data-code-text]',visibleLines:7});
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 258 232');svg.setAttribute('class','create-card_pulses');svg.setAttribute('aria-hidden','true');
  const routes=[...root.querySelectorAll('[data-card-line]')].map((asset,index)=>{
    const group=document.createElementNS(NS,'g');
    group.setAttribute('transform',`translate(${asset.dataset.cardOrigin.replace(',', ' ')})`);
    svg.append(group);
    const path=document.createElementNS(NS,'path');
    path.setAttribute('d',asset.dataset.cardPath);path.setAttribute('fill','none');
    path.setAttribute('stroke-width','.55');group.append(path);
    const {delay,period}=pulseTimings[index];
    return {group,effect:createSoftPathPulse(path,{start:delay/1000,period:period/1000})};
  });
  root.querySelector('.create-card_lines').append(svg);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=0,last=null,raf=0,visible=false,disposed=false;
  function render(){
    effect?.render(elapsed);
    routes.forEach(route=>route.effect.update(elapsed/1000));
  }
  function frame(now){
    raf=0;if(!root.isConnected){dispose();return;}
    if(last!==null)elapsed+=Math.min(now-last,64);last=now;
    render();raf=requestAnimationFrame(frame);
  }
  function sync(){
    cancelAnimationFrame(raf);raf=0;last=null;
    root.dataset.cardMotion=motion.matches?'static':'running';
    svg.style.display=motion.matches?'none':'';
    if(motion.matches)effect?.showAll();
    else {render();if(visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(frame);}
  }
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:0});
  observer.observe(root);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
  function dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);effect?.dispose();routes.forEach(route=>route.effect.dispose());svg.remove();delete root.dataset.cardMotion;initialized.delete(root);}
}
function boot(){init();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
