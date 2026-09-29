import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';

const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x*x*(3-2*x); };
const span = (t,a,b) => ease((t-a)/(b-a));
const waypoints = [
  [0,210,84], [.7,210,84], [1.5,246,145], [2.9,33.5,118.5],
  [4.6,33.5,118.5], [5.9,30,191.5], [8.2,30,191.5],
  [9.5,33.5,118.5], [10.6,33.5,118.5], [12,246,146], [13,210,84], [14.6,210,84]
];
// Pure timeline keeps clicks, the switch, and the expanding panel on one clock.
export function secureState(time, reduced=false) {
  const t = time % 14.6;
  const pair = waypoints.findIndex((p,i) => i < waypoints.length-1 && t >= p[0] && t < waypoints[i+1][0]);
  const a=waypoints[Math.max(0,pair)], b=waypoints[Math.max(0,pair)+1];
  const k=span(t,a[0],b[0]);
  const press=Math.max(...[3.15,6.15,9.8].map(at => Math.max(0,1-Math.abs(t-at)/.16)));
  return {x:a[1]+(b[1]-a[1])*k,y:a[2]+(b[2]-a[2])*k,
    enabled:reduced || (t>=3.15 && t<9.8),
    open:reduced?1:span(t,3.15,3.92)*(1-span(t,9.8,10.57)),
    selected:reduced?1:span(t,6.15,6.38)*(1-span(t,9.8,10.1)),
    opacity:reduced?0:span(t,.7,1.1)*(1-span(t,12.75,13)),
    behind:t<1.5 || t>=12.15, scale:1-.14*press};
}
export const init = stageInitializer('[data-secure-auth]', root => {
  const cursor=root.querySelector('.secure_cursor'), shape=root.querySelector('.secure_cursor-shape');
  const toggle=root.querySelector('[data-stitch-toggle]');
  if(!cursor || !toggle)return;
  let width=root.getBoundingClientRect().width, previousEnabled;
  const disposeClock=animateStage(root,{update({time,reduced,dirty}){
    if(dirty)width=root.getBoundingClientRect().width;
    const state=secureState(time,reduced), scale=width/258;
    root.style.setProperty('--secure-open',state.open);
    root.style.setProperty('--secure-selected',state.selected);
    cursor.style.transform=`translate3d(${state.x*scale}px,${state.y*scale}px,0)`;
    cursor.style.opacity=state.opacity;
    cursor.style.zIndex=state.behind?'1':'3';
    shape.style.transform=`scale(${state.scale})`;
    if(previousEnabled!==state.enabled){toggle.dataset.state=state.enabled?'active':'inactive';previousEnabled=state.enabled;}
  }});
  const fine=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let visible=false, disposeFollow;
  const syncFollow=()=>{
    const active=visible && !document.hidden && fine.matches;
    if(active && !disposeFollow)disposeFollow=createFollowGroup({root});
    if(!active && disposeFollow){disposeFollow();disposeFollow=null;}
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncFollow();});
  observer.observe(root);fine.addEventListener('change',syncFollow);document.addEventListener('visibilitychange',syncFollow);
  return ()=>{disposeClock();disposeFollow?.();observer.disconnect();fine.removeEventListener('change',syncFollow);document.removeEventListener('visibilitychange',syncFollow);};
});
if(typeof document !== 'undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
}
