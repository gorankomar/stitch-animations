import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { createValueCounter } from '../lib/effects/value-counter.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

export function fundingProgress(time, duration, index, reduced = false) {
  return reduced ? 1 : Math.max(0, Math.min(1, (time - index * HARD_REVEAL_STAGGER_MS / 1000) / duration));
}
export const init = stageInitializer('[data-dynamic-funding]', root => {
  const frame = root.querySelector('[data-df-frame]');
  const reveals = [...root.querySelectorAll('[data-df-reveal]')];
  const amounts = [...root.querySelectorAll('[data-df-value]')];
  const followers = [...root.querySelectorAll('[data-follow-mouse]')];
  const ease = readMotionEasingCurve('--motion-ease-primary', null);
  const duration = getDefaultDurationMs() / 1000;
  if (!frame || reveals.length !== 3 || amounts.length !== 2 || !ease || !(duration > 0)) return;
  const text = amounts.map(node => node.textContent);
  const offsets = followers.map(node => node.getAttribute('data-max-offset'));
  const tracks = [], counters = [];
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let disposeStage, observer, following = false, active = false, disposeFollow = () => {}, failed = false;
  function stopFollow() { disposeFollow(); disposeFollow = () => {}; following = false; }
  function restore() {
    stopFollow(); tracks.forEach(track => track.dispose()); counters.forEach(counter => counter.dispose());
    amounts.forEach((node, i) => { node.textContent = text[i]; });
    followers.forEach((node, i) => { if (offsets[i] === null) node.removeAttribute('data-max-offset'); else node.setAttribute('data-max-offset', offsets[i]); });
  }
  function gate() { if (document.hidden || !active || !fine.matches) stopFollow(); }
  function fail(error) {
    if (failed) return; failed = true; disposeStage?.(); observer?.disconnect();
    document.removeEventListener('visibilitychange', gate); fine.removeEventListener('change', gate);
    restore(); console.error('Dynamic funding motion failed', error);
  }
  try {
    reveals.forEach(node => tracks.push(createRevealTrack(node, {frame, mode:'hard', direction:'right-to-left', bleed:frame.getBoundingClientRect().width * .04})));
    amounts.forEach(element => counters.push(createValueCounter({element, driver:'external', decimals:2, prefix:'$', initialValue:0})));
    // Set the entrance only after every dependency has initialized successfully.
    tracks.forEach(track => track.render(0, ease));
    observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting && entry.intersectionRatio >= .4; gate(); }, {threshold:.4});
    observer.observe(root); document.addEventListener('visibilitychange', gate); fine.addEventListener('change', gate);
    disposeStage = animateStage(root, {threshold:.4, update({time, reduced, dirty}) {
      try {
        if (dirty) tracks.forEach(track => track.measure());
        const progress = reveals.map((_, i) => fundingProgress(time, duration, i, reduced));
        tracks.forEach((track, i) => track.render(progress[i], ease));
        counters.forEach((counter, i) => counter.jumpTo(Number(amounts[i].dataset.dfValue) * ease(progress[i + 1])));
        const shouldFollow = !reduced && active && !document.hidden && fine.matches && progress[2] === 1;
        if (following !== shouldFollow || dirty && following) {
          stopFollow();
          if (shouldFollow) {
            const scale = frame.getBoundingClientRect().width / 526;
            followers.forEach((node,i) => { node.dataset.maxOffset = String((i ? 12 : 8) * scale); });
            disposeFollow = createFollowGroup({root}); following = true;
          }
        }
      } catch(error) { fail(error); }
    }});
  } catch(error) { fail(error); return; }
  return () => { disposeStage?.(); observer?.disconnect(); document.removeEventListener('visibilitychange', gate); fine.removeEventListener('change', gate); restore(); };
});
if (typeof document !== 'undefined') {
  const key = Symbol.for('stitch.dynamic-funding.init');
  const mount = window[key] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), {once:true});
  else mount();
}
