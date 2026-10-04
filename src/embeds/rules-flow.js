import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack, resolveRevealTimings } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { readMotionEasingCurve, remToPx } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

const key = Symbol.for('stitch.rules-flow.init.v2');
export function rulesFlowSchedule(backgroundCount, duration, stagger) {
  const background = Array.from({ length: backgroundCount }, (_, i) => i ? duration + (i - 1) * stagger : 0);
  const foreground = background.at(-1) + duration;
  return [...background, foreground, ...[0, 1, 2, 3].map(i => foreground + duration + i * stagger)];
}

function setup(root) {
  const frame = root.querySelector('.rf-frame');
  const back = [...root.querySelectorAll('.rf-background [data-reveal]')];
  const background = root.querySelector('.rf-background');
  const entrance = root.querySelector('.rf-front-entrance');
  const content = [...root.querySelectorAll('.rf-front [data-reveal]')];
  const follower = root.querySelector('[data-follow-mouse]');
  if (!frame || !background || !entrance || !follower || content.length !== 4) return;
  const tokens = getComputedStyle(root);
  if (!tokens.getPropertyValue('--motion-ease-primary').trim() || !tokens.getPropertyValue('--motion-duration-default').trim()) return;
  const duration = getDefaultDurationMs() / 1000;
  const timings = resolveRevealTimings();
  const ease = readMotionEasingCurve();
  const nodes = [background, ...back, entrance, ...content];
  const starts = rulesFlowSchedule(back.length + 1, duration, timings.stagger / 1000);
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const savedFollow = { style: follower.getAttribute('style'), offset: follower.getAttribute('data-max-offset') };
  let tracks = [], disposeStage, observer, follow, visible = false, finished = false, disposed = false;
  const stopFollow = () => {
    follow?.(); follow = null;
    savedFollow.style === null ? follower.removeAttribute('style') : follower.setAttribute('style', savedFollow.style);
    savedFollow.offset === null ? follower.removeAttribute('data-max-offset') : follower.setAttribute('data-max-offset', savedFollow.offset);
  };
  const syncFollow = () => {
    const active = visible && finished && !document.hidden && !motion.matches && fine.matches;
    if (!active) stopFollow();
    else if (!follow) {
      follower.dataset.maxOffset = String(17.6 * root.getBoundingClientRect().width / 540);
      follow = createFollowGroup({ root });
    }
  };
  const restore = () => { tracks.forEach(track => track.dispose()); stopFollow(); root.removeAttribute('data-rf-ready'); };
  const cleanup = () => {
    disposed = true; disposeStage?.(); observer?.disconnect();
    fine.removeEventListener('change', syncFollow); motion.removeEventListener('change', syncFollow);
    document.removeEventListener('visibilitychange', syncFollow); restore();
  };
  const measure = () => {
    tracks.forEach(track => track.dispose()); tracks = [];
    const width = root.getBoundingClientRect().width;
    const value = tokens.getPropertyValue('--reveal-offset-default').trim();
    const offset = (value.endsWith('rem') ? remToPx(parseFloat(value)) : parseFloat(value)) * width / 540;
    if (!Number.isFinite(offset)) throw new Error('Reveal offset token is unavailable');
    nodes.forEach(node => tracks.push(createRevealTrack(node, { frame, mode: node === entrance ? 'hard' : 'soft', direction: node === entrance ? 'right-to-left' : 'bottom-to-top', offset, bleed: width * 20 / 540 })));
  };
  try {
    measure();
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncFollow(); }, { threshold: 0 });
    observer.observe(root);
    fine.addEventListener('change', syncFollow); motion.addEventListener('change', syncFollow);
    document.addEventListener('visibilitychange', syncFollow);
    disposeStage = animateStage(root, { threshold: 0.5, update({ time, reduced, dirty }) {
      if (disposed) return;
      try {
        if (dirty) {
          stopFollow(); measure();
        }
        tracks.forEach((track, i) => {
          const elapsed = time - starts[i];
          track.render(reduced ? 1 : elapsed / duration, ease, reduced ? 1 : elapsed / (duration * timings.opacityRatio));
        });
        finished = reduced || time >= starts[back.length + 1] + duration;
        syncFollow();
      } catch (error) { cleanup(); console.error('Rules Flow render failed', error); }
    }});
    if (!motion.matches) tracks.forEach(track => track.render(0, ease, 0));
    root.setAttribute('data-rf-ready', '');
  } catch (error) { cleanup(); console.error('Rules Flow setup failed', error); return; }
  return cleanup;
}

export const init = typeof window !== 'undefined' && window[key] || stageInitializer('[data-rules-flow]', setup);
if (typeof window !== 'undefined') {
  window[key] = init;
  requestAnimationFrame(() => init());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  else init();
}
