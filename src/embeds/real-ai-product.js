import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { copilotTyping } from '../lib/effects/copilot-typing.js';
import { createRevealTrack, resolveRevealTimings } from '../lib/effects/reveal-groups.js';
import { getPrimaryEase } from '../lib/easing.js';

export const init = stageInitializer('[data-real-ai-product], .lp-solution-screen:has([data-product-bar])', stage => {
  const bar = stage.querySelector('[data-product-bar]');
  const lock = stage.querySelector('[data-product-lock]');
  const updated = stage.querySelector('[data-product-updated]');
  const fields = [...stage.querySelectorAll('[data-product-field]')].map(field => {
    const value = field.querySelector('[data-product-value]');
    return {
      value, marker: field.querySelector('.lp-product-marker'), control: value?.parentElement,
      text: value?.textContent, typing: value?.dataset.productValue === 'type'
    };
  });
  if (!bar?.animate || !lock || !updated || !fields.length ||
    fields.some(field => !field.value || !field.marker)) return;

  const { duration, opacityDuration } = resolveRevealTimings();
  const easing = getPrimaryEase();
  const finalLock = lock.textContent;
  const animations = [];
  const barStart = duration;
  const fieldBeat = duration * .6;
  let lockAt;
  let endAt;
  let hard, travel, origin, done = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  function paused(element, frames, options) {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animations.push(animation);
    animation.pause();
    animation.currentTime = 0;
    return animation;
  }

  function restore() {
    animations.splice(0).forEach(animation => animation.cancel());
    travel?.dispose();
    for (const field of fields) field.value.textContent = field.text;
    lock.textContent = finalLock;
    updated.style.removeProperty('visibility');
  }

  function prepare() {
    paused(stage, [
      { transform: 'translateY(var(--reveal-offset-default, 7rem))' },
      { transform: 'translateY(0)' }
    ], { duration, easing });
    paused(stage, [{ opacity: 0 }, { opacity: 1 }], { duration: opacityDuration, easing: 'linear' });
    travel = createRevealTrack(bar, { frame: bar.parentElement, mode: 'hard', bleed: 4 });
    hard = paused(bar, travel.keyframes(), { duration, delay: barStart, easing });
    lock.textContent = '2';
    updated.style.visibility = 'hidden';
    let delay = barStart + duration;
    fields.forEach(field => {
      field.delay = delay;
      field.value.textContent = '';
      if (field.typing) {
        const { letters, keys } = copilotTyping(field.text);
        field.rhythm = { letters, keys: keys.map(key => (key - keys[0]) * .72) };
      }
      paused(field.control, [{ borderColor: '#d1d1d1' }, { borderColor: '#ffa38e' }],
        { duration: duration * .25, delay, easing });
      paused(field.marker, [{ transform: 'scale(0) rotate(-1turn)' }, { transform: 'scale(1) rotate(0turn)' }],
        { duration: fieldBeat, delay, easing });
      // Hold each selection for a beat; give typed fields time to finish every grapheme.
      delay += Math.max(fieldBeat, (field.rhythm?.keys.at(-1) ?? 0) + fieldBeat * .25);
    });
    lockAt = delay;
    endAt = lockAt + fieldBeat;
  }

  let stop;
  try {
    const layoutTop = stage.getBoundingClientRect().top;
    prepare();
    // Start near the section heading, compensating for the soft reveal’s initial displacement.
    const offset = Math.max(0, stage.getBoundingClientRect().top - layoutTop);
    stop = animateStage(stage, {
      threshold: .025,
      rootMargin: `0px 0px ${offset}px 0px`,
      update({ time, reduced, dirty }) {
        if (done) return;
        if (reduced) { done = true; restore(); stop(); return; }
        origin ??= time;
        const now = (time - origin) * 1000;
        if (now >= endAt) { done = true; restore(); stop(); return; }
        if (dirty) {
          // A paused WAAPI transform still affects layout measurements.
          hard.cancel();
          travel.measure();
          hard.effect.setKeyframes(travel.keyframes());
          hard.pause();
        }
        animations.forEach(animation => { animation.currentTime = now; });
        if (now >= lockAt) {
          lock.textContent = finalLock;
          updated.style.removeProperty('visibility');
        }
        for (const field of fields) {
          if (now < field.delay) continue;
          let value = field.text;
          if (field.rhythm) {
            const { keys, letters } = field.rhythm;
            const elapsed = now - field.delay;
            const firstFuture = keys.findIndex(key => key > elapsed);
            if (firstFuture >= 0) value = letters.slice(0, firstFuture).join('');
          }
          if (field.value.textContent !== value) field.value.textContent = value;
        }
      }
    });
  } catch (error) {
    restore();
    throw error;
  }
  return () => { stop(); restore(); };
});
