import {stageInitializer} from '../lib/effects/animation-stage.js';
import {getDefaultDurationMs} from '../lib/easing.js';
import {createRevealController} from '../lib/effects/reveal-groups.js';
import {createCreditCheckHover} from './credit-check-hover.js';
const key=Symbol.for('stitch.credit-check.init');
function setup(root){
 const nodes=[...root.querySelectorAll('[data-cc-reveal]')];
 if(!nodes.length)return;
 const saved=nodes.map(n=>n.getAttribute('style'));
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let reveal,observer,hover,visible=false,started=false,disposed=false;
 const restore=()=>{root.removeAttribute('data-cc-ready');reveal?.cancel();nodes.forEach((n,i)=>saved[i]===null?n.removeAttribute('style'):n.setAttribute('style',saved[i]));};
 const sync=()=>{
  if(disposed)return;
  hover?.setEnabled(visible&&!document.hidden&&!motion.matches);
  if(motion.matches){restore();started=true;return;}
  if(!visible||document.hidden){if(!started)return;restore();return;}
  if(started)return;
  try{root.setAttribute('data-cc-ready','');reveal.ensure();started=true;}catch{restore();started=true;}
 };
 try{
  const s=getComputedStyle(root),ease=s.getPropertyValue('--motion-ease-primary').trim(),duration=s.getPropertyValue('--motion-duration-default').trim();
  if(!ease||!duration||!CSS.supports('transition-timing-function',ease))return;
  hover=createCreditCheckHover(root,{duration:getDefaultDurationMs(),ease});
  // The canonical helper resolves durations from root aliases unreliably; let CSS resolve the actual token.
  nodes.forEach(n=>n.style.setProperty('--reveal-duration','var(--motion-duration-default)'));
  reveal=createRevealController({root,selector:'[data-cc-reveal]',groupSelector:'[data-cc-group]',timings:{duration:getDefaultDurationMs(),stagger:parseFloat(s.getPropertyValue('--reveal-stagger-default'))||200,opacityRatio:parseFloat(s.getPropertyValue('--reveal-opacity-ratio'))||.34}});
  observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(root);
  motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 }catch{observer?.disconnect();hover?.dispose();restore();return;}
 return()=>{disposed=true;observer.disconnect();hover?.dispose();motion.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);restore();};
}
export const init=typeof window!=='undefined'&&window[key]||stageInitializer('[data-credit-check]',setup);
if(typeof window!=='undefined'){window[key]=init;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();}
