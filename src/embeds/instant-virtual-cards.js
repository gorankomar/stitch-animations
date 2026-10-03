import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { createDemoCursor, sampleCursor, clampProgress } from '../lib/effects/demo-cursor.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { createValueCounter } from '../lib/effects/value-counter.js';
import { readMotionEasingCurve } from '../lib/motion.js';
import { getDefaultDurationMs } from '../lib/easing.js';

export const SMALL_OFF = '6d33b6ed-2ff0-ac4e-61ec-7cd7a7cc1f46';
export const SMALL_ON = '68174060-c1d7-47b9-5e20-0e9fe0a59faa';

export function virtualCardTimeline(duration) {
  const holdStart = 5.95;
  const holdEnd = holdStart + 1.5 / duration;
  const off = holdEnd + .65;
  const exitStart = off + .2;
  const exitEnd = exitStart + 1;
  return { holdStart, holdEnd, off, exitStart, exitEnd, period: exitEnd - 4 + 3 / duration };
}

export function virtualCardState(time, duration, reduced = false) {
  const t = time / duration;
  const timing = virtualCardTimeline(duration);
  // One continuous cursor visit, followed by three seconds concealed rest.
  const cycleTime = t < 4 ? t : 4 + (t - 4) % timing.period;
  const expansion = reduced ? 1 : cycleTime < timing.off
    ? clampProgress(cycleTime - 5.25) : 1 - clampProgress(cycleTime - timing.off);
  return {
    cycleTime,
    reveals: [0, 1, 2, 3].map(index => reduced ? 1 : clampProgress(t - index)),
    enabled: reduced || (cycleTime >= 5.25 && cycleTime < timing.off),
    expansion,
    count: reduced ? 1 : cycleTime >= timing.off + 1 ? 0 : clampProgress(cycleTime - 5.25),
    cursorOpacity: reduced || cycleTime < 4 ? 0 : 1,
    behind: cycleTime < 4.65 || cycleTime >= timing.exitEnd,
    exiting: cycleTime >= timing.exitStart,
    pressed: (cycleTime >= 5.15 && cycleTime < 5.35) || (cycleTime >= timing.off - .1 && cycleTime < timing.off + .1)
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
      const timing = virtualCardTimeline(duration);
      const rest = { x: 350, y: 180 };
      const hover = { x: target.x + 32, y: target.y + 38 };
      const path = [
        { time: 4, ...rest }, { time: 4.65, x: 415, y: 166 },
        { time: 5.05, ...target }, { time: 5.45, ...target },
        { time: timing.holdStart, ...hover }, { time: timing.holdEnd, ...hover },
        { time: timing.off - .15, ...target }, { time: timing.exitStart, ...target },
        { time: timing.exitEnd, ...rest }
      ];
      const position = sampleCursor(path, state.cycleTime, ease);
      // Drop below the card just before crossing its right edge, keeping the
      // diagonal return continuous and clear of the now-collapsing box.
      const front = root.querySelector('.ivc-front').getBoundingClientRect();
      const frontEdge = (front.right - bounds.left) / scale;
      cursor.render({ ...position, opacity: state.cursorOpacity, pressed: state.pressed,
        behind: state.behind || (state.exiting && position.x <= frontEdge + 6) });
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
