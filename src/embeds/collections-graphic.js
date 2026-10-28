import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { readMotionEasingCurve } from '../lib/motion.js';

const clamp = value => Math.max(0, Math.min(1, value));
const lerp = (a, b, t) => a + (b - a) * t;
// Existing Collections choreography: seconds and Figma design-space coordinates.
// The explicit timings are preserved at the user's request; movement uses Global Styles.
export function sampleCollections(time, index, height, ease) {
  const slot = index => ({ x: index ? -49 : 0, y: index ? -48 : 0, opacity: 1, z: 2 - index });
  if (time < 1) {
    const p = clamp((time - (1 - index) * .1) / .9), state = slot(index);
    return { ...state, y: state.y + height * 1.25 * (1 - ease(p)), opacity: p, phase: 'revealing' };
  }
  if (time < 2.6) return { ...slot(index), phase: 'holding' };
  const turn = Math.floor((time - 2.6) / 4.9), t = (time - 2.6) % 4.9;
  const outgoing = index === turn % 2;
  if (t < .85) {
    const p = ease(clamp(t / .85));
    return outgoing
      ? {x: lerp(0, 374.1, p), y: lerp(0, 374.1, p), opacity: 1, z: 2, phase: 'swapping'}
      : {...slot(1), x: lerp(-49, 0, p), y: lerp(-48, 0, p), phase: 'swapping'};
  }
  if (outgoing && t < 1.4) {
    const p = clamp((t - .85) / .55);
    return {...slot(1), y: -48 + height * .18 * (1 - ease(p)), opacity: p, phase: 'returning'};
  }
  return {...slot(outgoing ? 1 : 0), phase: t < 1.4 ? 'returning' : 'holding'};
}

const mount = stageInitializer('[data-collections-graphic]', stage => {
  const cards = [...stage.querySelectorAll('[data-collections-window]')];
  const ease = readMotionEasingCurve('--motion-ease-primary', null);
  if (cards.length !== 2 || !ease) return;
  const originals = cards.map(card => card.getAttribute('style'));
  const oldState = stage.getAttribute('data-collections-state');
  const restore = () => {
    cards.forEach((card, i) => originals[i] === null ? card.removeAttribute('style') : card.setAttribute('style', originals[i]));
    if (oldState === null) stage.removeAttribute('data-collections-state');
    else stage.setAttribute('data-collections-state', oldState);
  };
  let stop, failed = false, reduced = false, origin = 0;
  try {
    stop = animateStage(stage, {threshold: .25, update({time, reduced: reduce}) {
      if (failed) return;
      try {
        if (reduce) { restore(); reduced = true; return; }
        if (reduced) { origin = time; reduced = false; }
        const scale = stage.getBoundingClientRect().width / 258;
        const direction = getComputedStyle(stage).direction === 'rtl' ? -1 : 1;
        if (!(scale > 0)) return;
        cards.forEach((card, index) => {
          const state = sampleCollections(time - origin, index, card.getBoundingClientRect().height / scale, ease);
          card.style.transform = `translate(${state.x * scale * direction}px, ${state.y * scale}px)`;
          card.style.opacity = String(state.opacity);
          card.style.zIndex = String(state.z);
          stage.dataset.collectionsState = state.phase;
        });
      } catch (error) { failed = true; stop?.(); restore(); console.error('Collections motion failed', error); }
    }});
  } catch (error) { restore(); console.error('Collections setup failed', error); }
  return () => { stop?.(); restore(); };
});
// Shared and temporary Playground bundles use one mount registry, preventing duplicate clocks.
export function init(root = document) {
  const key = Symbol.for('stitch.collections-graphic.init');
  const sharedMount = window[key] ||= mount;
  return sharedMount(root);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), {once:true});
  else init();
}
