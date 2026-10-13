import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { createDotsField } from '../lib/effects/dots-field.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';
import { createFaceRecognition, FACE_CYCLE } from './cards-your-way-face-motion.js';

const clamp = value => Math.max(0, Math.min(1, value));
export function cardsYourWayState(time, duration, reduced = false) {
  const end = duration + 3 * HARD_REVEAL_STAGGER_MS / 1000;
  const loop = Math.max(0, time - end) / duration % FACE_CYCLE;
  return { reveals: [0,1,2,3].map(i => reduced ? 1 : clamp((time - i * HARD_REVEAL_STAGGER_MS / 1000) / duration)), loop, active: !reduced && time >= end };
}
export const init = stageInitializer('[data-cards-your-way]', root => {
  const frame = root.querySelector('.cyw-frame');
  const reveals = [...root.querySelectorAll('[data-cyw-reveal]')];
  const face = root.querySelector('[data-cyw-face-path]');
  const check = root.querySelector('[data-cyw-check]');
  const scan = root.querySelector('[data-cyw-scan]');
  const canvas = root.querySelector('.cyw-canvas'), sensor = root.querySelector('.cyw-sensor');
  if (!frame || reveals.length !== 4 || !face || !check || !scan || !canvas || !sensor) return;
  const tokens = getComputedStyle(root);
  if (!tokens.getPropertyValue('--motion-ease-primary').trim() || !tokens.getPropertyValue('--motion-duration-default').trim()) return;
  const duration = getDefaultDurationMs()/1000, ease = readMotionEasingCurve();
  const tracks = [], followers = [...root.querySelectorAll('[data-follow-mouse]')];
  let recognition;
  const offsets = followers.map(node=>node.getAttribute('data-max-offset'));
  let disposeStage, observer, disposeFollow, disposeDots, visible = false, allowed = false;
  function stop() { disposeFollow?.(); disposeDots?.(); disposeFollow=disposeDots=null; delete root.dataset.cywDotsReady; }
  function interactive(dirty=false) {
    if (dirty) stop();
    if (!visible || document.hidden || !allowed || !matchMedia('(hover:hover) and (pointer:fine)').matches) {stop();return;}
    if (!disposeFollow) {
      const scale = frame.clientWidth/520;
      followers.forEach(node=>{node.dataset.maxOffset=String((Number(node.dataset.followDepth)===30?24:12)*scale);});
      disposeFollow=createFollowGroup({root});
      disposeDots=createDotsField({canvas,sensor,pointerTarget:root,options:{gap:16*scale,baseSize:.6*scale,radius:120*scale}});
      root.dataset.cywDotsReady='';
    }
  }
  function restore() {stop();tracks.forEach(track=>track.dispose());recognition?.dispose();followers.forEach((node,i)=>{if(offsets[i]===null)node.removeAttribute('data-max-offset');else node.setAttribute('data-max-offset',offsets[i]);});delete root.dataset.cywReady;}
  function hidden(){interactive();}
  function cleanup(){disposeStage?.();observer?.disconnect();document.removeEventListener('visibilitychange',hidden);restore();}
  try {
    recognition=createFaceRecognition(face.ownerSVGElement);
    reveals.forEach(node=>tracks.push(createRevealTrack(node,{frame,mode:'hard',direction:'bottom-to-top',bleed:frame.clientWidth*.04})));
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.25;interactive();},{threshold:.25});observer.observe(root);
    document.addEventListener('visibilitychange',hidden);
    disposeStage=animateStage(root,{threshold:.25,update({time,reduced,dirty}) {
      try {
        const state=cardsYourWayState(time,duration,reduced);
        if(dirty)tracks.forEach(track=>track.measure());
        tracks.forEach((track,i)=>track.render(state.reveals[i],ease));
        recognition.render(state.loop,state.active,ease);
        allowed=!reduced&&state.reveals[2]===1;interactive(dirty);
        root.dataset.cywReady='';
      } catch(error){cleanup();console.error('Cards your way render failed',error);}
    }});
  } catch(error){cleanup();console.error('Cards your way setup failed',error);return;}
  return cleanup;
});
if(typeof document!=='undefined') {
  const key=Symbol.for('stitch.cards-your-way.init');const mount=window[key] ||= init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
}
