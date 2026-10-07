import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS } from '../lib/effects/reveal-groups.js';
import { createValueCounter } from '../lib/effects/value-counter.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { sampleUpwardCarousel } from '../lib/effects/upward-carousel.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';

const clamp = t => Math.max(0, Math.min(1, t));
export function walletTiming(duration, stagger = 200) {
  const labelsStart = stagger * 3;
  return { labelsStart, loopStart: labelsStart + 2 * HARD_REVEAL_STAGGER_MS + duration };
}
export function sampleWalletLabel(time, index, duration, ease) {
  return sampleUpwardCarousel(time, (index + 4) % 5, duration, ease,
    { spacing:57, adjacentScale:.73, adjacentOpacity:1 });
}

export const init = stageInitializer('[data-digital-wallet]', root => {
  const frame = root.querySelector('.dw-frame');
  const rows = [...root.querySelectorAll('[data-dw-reveal]')];
  const labels = [...root.querySelectorAll('[data-dw-label]')];
  const labelEntrances = [...root.querySelectorAll('[data-dw-label-reveal]')];
  const value = root.querySelector('[data-dw-value]');
  const follower = root.querySelector('.dw-card-follow');
  if (!frame || rows.length !== 3 || labels.length !== 5 || labelEntrances.length !== 5 || !value || !follower) return;
  const css = getComputedStyle(root);
  const curve = css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  const duration = toMs(css.getPropertyValue('--motion-duration-default'), 0);
  if (curve?.length !== 4 || !curve.every(Number.isFinite) || !(duration > 0)) return;
  const ease = cubicBezier(...curve);
  const stagger = toMs(css.getPropertyValue('--reveal-stagger-default'),200);
  const opacityRatio = parseFloat(css.getPropertyValue('--reveal-opacity-ratio')) || .34;
  const timing = walletTiming(duration, stagger);
  const amount = Number(value.dataset.dwValue);
  if (!Number.isFinite(amount)) return;
  const savedText = value.textContent;
  const owned = [...rows,...labels,...labelEntrances,follower];
  const saved = owned.map(node => node.style.cssText);
  const savedOffset = follower.dataset.maxOffset;
  const tracks = [], hardTracks = [];
  let measuredWidth = frame.clientWidth;
  let counter, disposeStage, observer, disposeFollow = () => {}, following = false, disposed = false;
  function stopFollow() { disposeFollow(); disposeFollow = () => {}; following = false; }
  function restore() {
    tracks.forEach(track => track.dispose()); hardTracks.forEach(track => track.dispose());
    owned.forEach((node,i) => node.style.cssText = saved[i]);
    value.textContent = savedText; delete root.dataset.dwReady;
  }
  function dispose() {
    if (disposed) return; disposed = true;
    disposeStage?.(); stopFollow(); observer?.disconnect();
    document.removeEventListener('visibilitychange', hidden);
    counter?.dispose(); restore();
    if (savedOffset === undefined) delete follower.dataset.maxOffset; else follower.dataset.maxOffset = savedOffset;
  }
  function hidden() { if (document.hidden) stopFollow(); }
  try {
    rows.forEach(node => tracks.push(createRevealTrack(node,{frame, mode:'soft',offset:frame.clientWidth * 24 / 540})));
    labelEntrances.forEach(node => hardTracks.push(createRevealTrack(node,{frame,mode:'hard',direction:'bottom-to-top',bleed:frame.clientWidth * .04})));
    counter = createValueCounter({element:value,driver:'external',initialValue:amount,
      formatter:n => `$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`});
    observer = new IntersectionObserver(([entry]) => {if (!entry.isIntersecting) stopFollow();}); observer.observe(root);
    document.addEventListener('visibilitychange',hidden);
    disposeStage = animateStage(root,{update({time,reduced,dirty}) {
      try {
        if (!root.isConnected) {dispose();return;}
        if (reduced) {stopFollow();restore();return;}
        root.dataset.dwReady = '';
        const ms = time * 1000;
        if (dirty) {
          if (measuredWidth !== frame.clientWidth) {
            tracks.forEach(track=>track.dispose()); tracks.length=0;
            measuredWidth=frame.clientWidth;
            rows.forEach(node=>tracks.push(createRevealTrack(node,{frame,mode:'soft',offset:measuredWidth*24/540})));
          }
          tracks.forEach(track=>track.measure());hardTracks.forEach(track=>track.measure());
        }
        tracks.forEach((track,i) => track.render(clamp((ms-i*stagger)/duration),ease,clamp((ms-i*stagger)/(duration*opacityRatio))));
        counter.jumpTo(amount * ease(clamp((ms-stagger)/duration)));
        // Bottom row enters first. The two spare rows remain concealed until cycling.
        hardTracks.forEach((track,i) => track.render(i<3?clamp((ms-timing.labelsStart-(2-i)*HARD_REVEAL_STAGGER_MS)/duration):1,ease));
        const loopTime = Math.max(0,ms-timing.loopStart);
        labels.forEach((node,i) => {
          const pose = sampleWalletLabel(loopTime + (ms >= timing.loopStart ? duration*6 : 0),i,duration,ease);
          node.style.transform = `translateY(${pose.y/5.4}cqi) scale(${pose.scale})`;
          node.style.opacity = String(pose.opacity); node.style.visibility = pose.opacity === 0 ? 'hidden':'visible';
        });
        const canFollow = ms >= duration + 2*stagger && matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (canFollow !== following || (dirty && following)) {
          stopFollow();
          if (canFollow) {follower.dataset.maxOffset=String(6*frame.clientWidth/540);disposeFollow=createFollowGroup({root});following=true;}
        }
      } catch(error) {dispose();console.error('Digital Wallet render failed',error);}
    }});
  } catch(error) {dispose();console.error('Digital Wallet setup failed',error);}
  return dispose;
});
if (typeof document !== 'undefined') {
  const mount = window[Symbol.for('stitch.digital-wallet.init')] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>mount(),{once:true}); else mount();
}
