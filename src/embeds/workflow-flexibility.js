import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS } from '../lib/effects/reveal-groups.js';
import { sampleWorkflowStack, renderWorkflowWindow } from '../lib/effects/workflow-window-stack.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

export const init=stageInitializer('[data-workflow-flexibility]',root=>{
  const frame=root.querySelector('[data-wfx-frame]');
  const windows=[...root.querySelectorAll('[data-wfx-window]')];
  const labels=windows.map(n=>n.querySelector('[data-wfx-label]'));
  const ease=readMotionEasingCurve('--motion-ease-primary',null);
  const raw=getComputedStyle(root).getPropertyValue('--motion-duration-default').trim();
  const duration=getDefaultDurationMs()/1000;
  if(!frame||windows.length!==5||labels.some(n=>!n)||!ease||!raw||!(duration>0))return;
  const nodes=[...windows,...labels,...labels.map(n=>n.querySelector('[data-wfx-icon]'))].filter(Boolean);
  const saved=nodes.map(n=>n.getAttribute('style'));
  const tracks=[];
  let disposeStage,failed=false;
  const restore=()=>{tracks.forEach(t=>t.dispose());nodes.forEach((n,i)=>saved[i]===null?n.removeAttribute('style'):n.setAttribute('style',saved[i]));};
  const fail=error=>{if(failed)return;failed=true;disposeStage?.();restore();console.error('Workflow Flexibility motion failed',error);};
  const entrance=duration+4*HARD_REVEAL_STAGGER_MS/1000;
  try{
    windows.forEach(n=>{n.style.transform='translateX(-50%)';tracks.push(createRevealTrack(n,{frame,mode:'hard',direction:'bottom-to-top',bleed:frame.getBoundingClientRect().width*.05}));});
    disposeStage=animateStage(root,{threshold:.25,start(){if(!matchMedia('(prefers-reduced-motion: reduce)').matches)tracks.forEach(t=>t.render(0,ease));},update({time,reduced,dirty}){
      try{
        if(reduced){restore();return;}
        if(time<entrance){
          if(dirty)tracks.forEach(t=>t.measure());
          tracks.forEach((t,i)=>t.render((time-(4-i)*HARD_REVEAL_STAGGER_MS/1000)/duration,ease));
        }else{
          tracks.forEach(t=>t.render(1,ease));
          windows.forEach((n,i)=>renderWorkflowWindow(n,labels[i],sampleWorkflowStack(time-entrance,i,duration,ease)));
        }
      }catch(error){fail(error);}
    }});
  }catch(error){fail(error);return;}
  return()=>{disposeStage?.();restore();};
});
if(typeof document!=='undefined'){
  const key=Symbol.for('stitch.workflow-flexibility.init');
  const mount=window[key]||=init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
