import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { createDemoCursor, sampleCursor, clampProgress } from '../lib/effects/demo-cursor.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { createValueCounter } from '../lib/effects/value-counter.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

export const SMALL_OFF = '6d33b6ed-2ff0-ac4e-61ec-7cd7a7cc1f46';
export const SMALL_ON = '68174060-c1d7-47b9-5e20-0e9fe0a59faa';

export function virtualCardState(time, duration, reduced = false) {
  const t = time / duration;
  // Entrances run once; an explicit extra second extends the concealed rest.
  const cycleTime = t < 4 ? t : 4 + (t - 4) % (8 + 1 / duration);
  const expansion = reduced ? 1 : cycleTime < 9
    ? clampProgress(cycleTime - 5.25) : 1 - clampProgress(cycleTime - 9);
  return {
    cycleTime,
    reveals: [0, 1, 2, 3].map(index => reduced ? 1 : clampProgress(t - index)),
    enabled: reduced || (cycleTime >= 5.25 && cycleTime < 9),
    expansion,
    count: reduced ? 1 : cycleTime >= 10 ? 0 : clampProgress(cycleTime - 5.25),
    // The cursor stays opaque and rests beneath the Dark Blue card.
    cursorOpacity: reduced ? 0 : 1,
    behind: cycleTime < 4.65 || (cycleTime >= 6.55 && cycleTime < 8.65) || cycleTime >= 10.15,
    pressed: (cycleTime >= 5.15 && cycleTime < 5.35) || (cycleTime >= 8.9 && cycleTime < 9.1)
  };
}

export const init = stageInitializer('[data-instant-virtual-cards]', root => {
  const frame = root.querySelector('.ivc-frame');
  const reveals = [...root.querySelectorAll('[data-ivc-reveal]')];
  const details = root.querySelector('.ivc-details');
  const amount = root.querySelector('.ivc-amount');
  const toggle = root.querySelector('[data-ivc-toggle="limit"] [data-stitch-toggle]');
  const cursorElement = root.querySelector('.ivc-cursor');
  if (!frame || reveals.length !== 4 || !details || !amount || !toggle || !cursorElement) return;
  const tokens = getComputedStyle(root);
  if (!tokens.getPropertyValue('--motion-ease-primary').trim() || !tokens.getPropertyValue('--motion-duration-default').trim()) return;
  const duration = getDefaultDurationMs() / 1000;
  const ease = readMotionEasingCurve();
  const tracks = [];
  const savedDetails = details.style.cssText, savedText = amount.textContent;
  const toggleNodes = [toggle, ...toggle.querySelectorAll('[class]')];
  const savedToggle = toggleNodes.map(node => ({ node, className: node.getAttribute('class'), style: node.style.cssText }));
  let cursor, counter, disposeStage, visibility, disposeFollow = () => {}, following = false, lastEnabled;
  const savedOffsets = [...root.querySelectorAll('[data-follow-mouse]')].map(node => node.dataset.maxOffset);
  const stopFollow = () => { disposeFollow(); disposeFollow = () => {}; following = false; };
  const hidden = () => { if (document.hidden) stopFollow(); };
  function setToggle(enabled) {
    if (enabled === lastEnabled) return;
    lastEnabled = enabled;
    toggleNodes.forEach(node => {
      node.classList.remove(`w-variant-${SMALL_OFF}`, `w-variant-${SMALL_ON}`);
      node.classList.add(`w-variant-${enabled ? SMALL_ON : SMALL_OFF}`);
    });
  }
  function restore() {
    tracks.forEach(track => track.dispose());
    details.style.cssText = savedDetails; amount.textContent = savedText;
    savedToggle.forEach(({ node, className, style }) => { node.setAttribute('class', className); node.style.cssText = style; });
    cursor?.dispose(); counter?.dispose(); delete root.dataset.ivcReady;
  }
  try {
    reveals.forEach(node => tracks.push(createRevealTrack(node, { frame, mode: 'hard', direction: 'right-to-left', bleed: frame.getBoundingClientRect().width * .04 })));
    cursor = createDemoCursor(cursorElement, { designWidth: 540, frame });
    counter = createValueCounter({ element: amount, driver: 'external', formatter: value => `$${Math.round(value).toLocaleString('en-US')}` });
    visibility = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting || entry.intersectionRatio < .25) stopFollow(); }, { threshold: .25 });
    visibility.observe(root);
    document.addEventListener('visibilitychange', hidden);
    root.dataset.ivcReady = '';
    disposeStage = animateStage(root, { threshold: .25, update({ time, reduced, dirty }) {
      try {
      const state = virtualCardState(time, duration, reduced);
      if (dirty) tracks.forEach(track => track.measure());
      tracks.forEach((track, i) => track.render(state.reveals[i], ease));
      setToggle(state.enabled);
      const expansion = ease(state.expansion);
      const thumb = toggle.firstElementChild;
      if (thumb) { thumb.style.left = `${100 * expansion}%`; thumb.style.transform = `translateX(${-100 * expansion}%)`; }
      // Measure the full details at the current parent width before collapsing.
      details.style.height = '';
      const fullHeight = details.getBoundingClientRect().height;
      details.style.height = state.expansion === 1 ? '' : `${fullHeight * expansion}px`;
      counter.jumpTo(3650 * ease(state.count));
      const bounds = frame.getBoundingClientRect(), box = toggle.getBoundingClientRect();
      const scale = bounds.width / 540;
      const target = { x: (box.left + box.width * .62 - bounds.left) / scale, y: (box.top + box.height * .52 - bounds.top) / scale };
      const path = [
        { time: 4, x: 350, y: 180 }, { time: 4.65, x: 415, y: 166 },
        { time: 5.05, ...target }, { time: 6.25, ...target },
        { time: 6.55, x: 415, y: 166 }, { time: 7.05, x: 350, y: 180 },
        { time: 8.15, x: 350, y: 180 }, { time: 8.65, x: 415, y: 166 },
        { time: 8.85, ...target }, { time: 9.75, ...target },
        { time: 10.15, x: 415, y: 166 }, { time: 10.75, x: 350, y: 180 }
      ];
      cursor.render({ ...sampleCursor(path, state.cycleTime, ease), opacity: state.cursorOpacity, pressed: state.pressed, behind: state.behind });
      const shouldFollow = !reduced && state.reveals[1] === 1 && !document.hidden && matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (following !== shouldFollow || (dirty && following)) {
        disposeFollow(); following = shouldFollow;
        if (following) {
          root.querySelectorAll('[data-follow-mouse]').forEach((node, i) => { node.dataset.maxOffset = String((i ? 9 : 4) * scale); });
          disposeFollow = createFollowGroup({ root });
        }
      }
      } catch (error) {
        disposeStage?.(); stopFollow(); visibility.disconnect(); document.removeEventListener('visibilitychange', hidden); restore();
        console.error('Instant Virtual Cards render failed', error);
      }
    }});
  } catch (error) { disposeStage?.(); stopFollow(); visibility?.disconnect(); document.removeEventListener('visibilitychange', hidden); restore(); console.error('Instant Virtual Cards setup failed', error); return; }
  return () => {
    disposeStage(); stopFollow(); visibility.disconnect(); document.removeEventListener('visibilitychange', hidden);
    root.querySelectorAll('[data-follow-mouse]').forEach((node, i) => { node.dataset.maxOffset = savedOffsets[i]; });
    restore();
  };
});

if (typeof document !== 'undefined') {
  const key = Symbol.for('stitch.instant-virtual-cards.init');
  const mount = window[key] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), { once: true });
  else mount();
}
