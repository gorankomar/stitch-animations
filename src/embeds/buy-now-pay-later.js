import { stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealController } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { createSoftPathPulse } from '../lib/effects/soft-path-pulse.js';
import { getDefaultDurationMs } from '../lib/easing.js';

const key = Symbol.for('stitch.buy-now-pay-later.init');
let instance = 0;
function setup(root) {
  const follower = root.querySelector('.bnpl-card-follow');
  const svg = root.querySelector('.bnpl-line-svg');
  const rows = [...root.querySelectorAll('[data-bnpl-reveal]')];
  if (!follower || !svg || rows.length !== 6) return;
  const saved = rows.map(n => n.getAttribute('style'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const styles = getComputedStyle(root);
  const duration = getDefaultDurationMs();
  const stagger = parseFloat(styles.getPropertyValue('--reveal-stagger-default')) || 200;
  const opacityRatio = parseFloat(styles.getPropertyValue('--reveal-opacity-ratio')) || .34;
  const reveal = createRevealController({root,selector:'[data-bnpl-reveal]',groupSelector:'[data-bnpl-group]',timings:{duration,stagger,opacityRatio}});
  // Namespace every original gradient per mounted instance, including clones.
  const originals = [...svg.querySelectorAll('[id]')].map(n => [n,n.id]);
  const strokes = [...svg.querySelectorAll('[stroke]')].map(n => [n,n.getAttribute('stroke')]);
  const suffix = `-instance-${++instance}`;
  originals.forEach(([n,id]) => n.id = id + suffix);
  strokes.forEach(([n,stroke]) => n.setAttribute('stroke',stroke.replace(/url\(#([^)]*)\)/g,(_,id)=>`url(#${id}${suffix})`)));
  const pulses = [];
  let visible=false,started=false,disposed=false,follow,raf=0,last=0,time=0,observer,resize;
  const restore = () => {
    root.removeAttribute('data-bnpl-ready');root.removeAttribute('data-bnpl-pulses-ready');reveal.cancel();
    rows.forEach((n,i)=>saved[i]===null?n.removeAttribute('style'):n.setAttribute('style',saved[i]));
    follow?.();follow=null;
  };
  const dispose = () => {
    if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer?.disconnect();resize?.disconnect();
    motion.removeEventListener('change',sync);fine.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);
    restore();pulses.forEach(p=>{p.effect.dispose();p.node.remove();});
    originals.forEach(([n,id])=>n.id=id);strokes.forEach(([n,stroke])=>n.setAttribute('stroke',stroke));
  };
  const tick = now => {
    raf=0;if(!root.isConnected){dispose();return;}
    if(last)time+=Math.min((now-last)/1000,.05);last=now;
    pulses.forEach(p=>p.effect.update(time));raf=requestAnimationFrame(tick);
  };
  const sync = () => {
    if(disposed)return;
    cancelAnimationFrame(raf);raf=0;last=0;
    const active=visible&&!document.hidden&&!motion.matches;
    if(motion.matches){restore();started=true;}
    if(active&&!started){root.setAttribute('data-bnpl-ready','');void root.offsetWidth;reveal.ensure();started=true;}
    // Finish entrance when leaving view/tab so CSS timers cannot strand rows.
    if(!active&&started&&!motion.matches){root.removeAttribute('data-bnpl-ready');reveal.cancel();}
    if(active&&fine.matches&&!follow){follower.dataset.maxOffset=String(root.getBoundingClientRect().width*4/540);follow=createFollowGroup({root,selector:'.bnpl-card-follow'});}
    if((!active||!fine.matches)&&follow){follow();follow=null;}
    root.toggleAttribute('data-bnpl-pulses-ready',!motion.matches);
    pulses.forEach(p=>{p.node.style.display=motion.matches?'none':'';if(motion.matches)p.effect.update(time,true);});
    if(active)raf=requestAnimationFrame(tick);
  };
  try {
    // Animate cloned base paths; the full original Figma line/pulse appearance remains fallback.
    svg.querySelectorAll('[data-bnpl-line]').forEach((source,i)=>{
      if(![0,2,4,6,8].includes(Number(source.getAttribute('data-bnpl-line'))))return;
      const node=source.cloneNode(true);node.removeAttribute('id');node.removeAttribute('data-bnpl-line');node.setAttribute('data-bnpl-pulse','');
      source.parentNode.append(node);
      try {pulses.push({node,effect:createSoftPathPulse(node,{span:32,speed:48,color:'#55bbff',start:i*.31,reverse:i<6})});} catch(e){node.remove();throw e;}
    });
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(root);
    resize=new ResizeObserver(()=>{follow?.();follow=null;sync();});resize.observe(root);
    motion.addEventListener('change',sync);fine.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  } catch {dispose();}
  return dispose;
}
export const init = typeof window !== 'undefined' && window[key] || stageInitializer('[data-buy-now-pay-later]',setup);
if(typeof window!=='undefined') {
  window[key]=init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
}
