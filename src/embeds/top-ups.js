import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, HARD_REVEAL_STAGGER_MS, resolveRevealTimings } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

export function topUpsSchedule(itemCount, duration, layerStagger = HARD_REVEAL_STAGGER_MS / 1000, itemStagger = .07) {
  return [0, layerStagger, layerStagger * 2, ...Array.from({length:itemCount}, (_, i) => layerStagger + duration + i * itemStagger)];
}
function setup(root) {
  const frame = root.querySelector('.tu-frame');
  const layers = [...root.querySelectorAll('[data-tu-layer]')];
  const items = [...root.querySelectorAll('[data-tu-item]')];
  const followers = [...root.querySelectorAll('[data-follow-mouse]')];
  if (!frame || layers.length !== 3 || items.length !== 9 || followers.length !== 3) return;
  const tokens = getComputedStyle(root);
  if (!tokens.getPropertyValue('--motion-ease-primary').trim() || !tokens.getPropertyValue('--motion-duration-default').trim()) return;
  const duration = getDefaultDurationMs() / 1000;
  const timings = resolveRevealTimings();
  const ease = readMotionEasingCurve();
  const starts = topUpsSchedule(items.length, duration, undefined, timings.stagger / 1000 * .35);
  const nodes = [...layers, ...items];
  const saved = followers.map(el => ({el, style:el.getAttribute('style'), offset:el.getAttribute('data-max-offset')}));
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let tracks = [], follow, observer, disposeStage, visible = false, finished = false, disposed = false;
  const stopFollow = () => {
    follow?.(); follow = null;
    saved.forEach(({el, style, offset}) => {
      style === null ? el.removeAttribute('style') : el.setAttribute('style', style);
      offset === null ? el.removeAttribute('data-max-offset') : el.setAttribute('data-max-offset', offset);
    });
  };
  const syncFollow = () => {
    if (!visible || !finished || document.hidden || motion.matches || !fine.matches) { if (follow) stopFollow(); return; }
    if (!follow) {
      const scale = root.getBoundingClientRect().width / 540;
      followers.forEach((el, i) => { el.dataset.maxOffset = String([5,10,14][i] * scale); });
      follow = createFollowGroup({root});
    }
  };
  const measure = () => {
    tracks.forEach(track => track.dispose()); tracks = [];
    const width = root.getBoundingClientRect().width;
    nodes.forEach((el, i) => tracks.push(createRevealTrack(el, {
      frame, mode:i < 3 ? el.dataset.tuLayer : 'soft', direction:'bottom-to-top',
      offset:width * (i < 3 ? .065 : .025), bleed:width * 20 / 540
    })));
  };
  const cleanup = () => {
    disposed = true; disposeStage?.(); observer?.disconnect();
    fine.removeEventListener('change', syncFollow); motion.removeEventListener('change', syncFollow);
    document.removeEventListener('visibilitychange', syncFollow);
    tracks.forEach(track => track.dispose()); stopFollow(); root.removeAttribute('data-tu-ready');
  };
  try {
    measure();
    observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; syncFollow();}, {threshold:0});
    observer.observe(root);
    fine.addEventListener('change', syncFollow); motion.addEventListener('change', syncFollow);
    document.addEventListener('visibilitychange', syncFollow);
    disposeStage = animateStage(root, {threshold:.5, update({time, reduced, dirty}) {
      if (disposed) return;
      try {
        if (dirty) {stopFollow(); measure();}
        tracks.forEach((track, i) => {
          const elapsed = time - starts[i];
          track.render(reduced ? 1 : elapsed / duration, ease, reduced ? 1 : elapsed / (duration * timings.opacityRatio));
        });
        finished = reduced || time >= starts[2] + duration;
        syncFollow();
      } catch (error) {cleanup(); console.error('Top-ups render failed', error);}
    }});
    if (!motion.matches) tracks.forEach(track => track.render(0, ease, 0));
    root.setAttribute('data-tu-ready', '');
  } catch (error) {cleanup(); console.error('Top-ups setup failed', error); return;}
  return cleanup;
}
const key = Symbol.for('stitch.top-ups.init.v1');
export const init = typeof window !== 'undefined' && window[key] || stageInitializer('[data-top-ups]', setup);
if (typeof window !== 'undefined') {
  window[key] = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), {once:true});
  else init();
}
