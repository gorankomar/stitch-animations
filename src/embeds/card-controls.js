import './card-controls.css';
import '../lib/effects/card-lift.css';
import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { ensureSectionReveal, releaseSectionReveal } from '../lib/effects/reveal-groups.js';
import { createCodeScrollEffect } from '../lib/effects/code-scroll.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { make, setPath, pathLength, paintPulse, roundedPath } from '../lib/effects/connector.js';

const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const points = [[0,'exit'],[.8,'exit'],[2.1,'travel'],[3.1,'travel'],[4.3,'food'],[5.4,'food'],[6.8,'exit'],[9.6,'exit']];
export function cardControlsState(time, reduced = false) {
  const t = Math.max(0, time) % 9.6;
  const index = points.findIndex((p, i) => i < points.length - 1 && t >= p[0] && t < points[i + 1][0]);
  const a = points[Math.max(0,index)], b = points[Math.max(0,index) + 1];
  const press = Math.max(...[2.5,4.7].map(at => Math.max(0, 1 - Math.abs(t-at)/.16)));
  return { from:a[1], to:b[1], mix:ease((t-a[0])/(b[0]-a[0])),
    travel:reduced || (t >= 2.5 && t < 8.4), food:reduced || (t >= 4.7 && t < 8.4),
    opacity:reduced?0:ease((t-.8)/.3)*(1-ease((t-6.5)/.3)), scale:1-.14*press };
}

export const init = stageInitializer('[data-card-controls]', root => {
  const card = root.querySelector('.card-controls_settings');
  const phone = root.querySelector('.card-controls_phone');
  const cursor = root.querySelector('.card-controls_cursor');
  const shape = cursor?.firstElementChild;
  const toggles = Object.fromEntries(['travel','food'].map(name => [name, root.querySelector(`[data-control="${name}"] [data-stitch-toggle]`)]));
  const host = root.querySelector('.card-controls_connector');
  const track = root.querySelector('.card-controls_code-track');
  if (!card || !phone || !cursor || !shape || !host || !track || !toggles.travel || !toggles.food) return;
  const reveal = ensureSectionReveal(root);
  const code = createCodeScrollEffect(track, {visibleLines:7});
  const svg = make('svg',host,{width:'100%',height:'100%','aria-hidden':'true'});
  const base = make('path',svg,{fill:'none',stroke:'#c4dff5','stroke-linecap':'round'});
  const pulse = make('path',svg,{fill:'none',stroke:'#55bbff','stroke-linecap':'round'});
  const arrow = make('path',svg,{fill:'none',stroke:'#c4dff5','stroke-linecap':'round','stroke-linejoin':'round'});
  root.classList.add('is-motion-ready');
  let revealDuration = 0;
  const disposeClock = animateStage(root, {nodes:[card,phone], start() {revealDuration = (reveal?.ensure() || 0)/1000;}, update({time,reduced}) {
    // Read the actual animated rectangles before writes, including hover translation.
    const r=root.getBoundingClientRect(), c=card.getBoundingClientRect(), p=phone.getBoundingClientRect();
    const scale=r.width/root.offsetWidth, unit=root.offsetWidth/540;
    const local = rect => ({x:(rect.left+rect.width/2-r.left)/scale, y:(rect.top+rect.height/2-r.top)/scale});
    const targets={travel:local(toggles.travel.getBoundingClientRect()),food:local(toggles.food.getBoundingClientRect()),exit:{x:root.offsetWidth*.39,y:root.offsetHeight*.82}};
    const state=cardControlsState(Math.max(0,time-revealDuration),reduced);
    const a=targets[state.from], b=targets[state.to];
    const x=(c.left+c.width/2-r.left)/scale, y=(c.bottom-r.top)/scale+8*unit;
    const end=(p.left-r.left)/scale-5*unit, bend=Math.max(y+35*unit,root.offsetHeight*.846);
    const d=roundedPath([{x,y},{x,y:bend},{x:end,y:bend}],10*unit);
    svg.setAttribute('viewBox',`0 0 ${root.offsetWidth} ${root.offsetHeight}`);
    [base,pulse].forEach(path=>{setPath(path,d);path.setAttribute('stroke-width',unit);});
    setPath(arrow,`M ${end-4*unit} ${bend-3*unit} L ${end} ${bend} L ${end-4*unit} ${bend+3*unit}`);
    arrow.setAttribute('stroke-width',unit);
    const length=pathLength(pulse), duration=(length/unit+30)/60;
    paintPulse(pulse,{head:(time%(duration+1.2))*60*unit,span:30*unit,length,active:!reduced});
    cursor.style.transform=`translate3d(${a.x+(b.x-a.x)*state.mix}px,${a.y+(b.y-a.y)*state.mix}px,0)`;
    cursor.style.opacity=state.opacity;
    shape.style.transform=`scale(${state.scale})`;
    for(const name of ['travel','food']) {
      const value=state[name]?'active':'inactive';
      if(toggles[name].dataset.state!==value)toggles[name].dataset.state=value;
    }
    if(reduced)code?.showAll();else code?.render(time*1000);
  }});
  const fine=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let visible=false, disposeFollow;
  const syncFollow=()=>{
    const active=visible&&!document.hidden&&fine.matches;
    if(active&&!disposeFollow)disposeFollow=createFollowGroup({root});
    if(!active&&disposeFollow){disposeFollow();disposeFollow=null;}
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncFollow();});
  observer.observe(root);fine.addEventListener('change',syncFollow);document.addEventListener('visibilitychange',syncFollow);
  return ()=>{disposeClock();disposeFollow?.();observer.disconnect();fine.removeEventListener('change',syncFollow);document.removeEventListener('visibilitychange',syncFollow);code?.dispose();releaseSectionReveal(root);svg.remove();root.classList.remove('is-motion-ready');cursor.style.transform='';cursor.style.opacity='';shape.style.transform='';};
});
if(typeof document!=='undefined') {
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
}
