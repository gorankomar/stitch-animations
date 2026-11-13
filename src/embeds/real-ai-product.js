import { createHolderTilt } from '../lib/effects/holder-tilt.js';
import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { copilotTyping } from '../lib/effects/copilot-typing.js';
import { createRevealTrack, resolveRevealTimings } from '../lib/effects/reveal-groups.js';
import { renderProductWorking, clearProductWorking } from '../lib/effects/product-working.js';
import { getDefaultDurationMs, getFastDurationMs, getPrimaryEase } from '../lib/easing.js';

const placeholders = ['Enter product name', 'Select currency', 'Select category', 'Select type', 'Enter description', 'Select accrual type'];

export const init = stageInitializer('[data-real-ai-product], .lp-solution-screen:has([data-product-bar])', stage => {
  const bar = stage.querySelector('[data-product-bar]');
  const lock = stage.querySelector('[data-product-lock]');
  const updated = stage.querySelector('[data-product-updated]');
  const title = bar?.querySelector('.lp-product-change-title');
  const policy = bar?.querySelector('.lp-product-policy');
  const prompt = bar?.querySelector('.lp-product-ask > span');
  const submit = bar?.querySelector('.lp-product-stop');
  const icon = bar?.querySelector('.lp-product-sparkle');
  const fields = [...stage.querySelectorAll('[data-product-field]')].map((field, index) => {
    const value = field.querySelector('[data-product-value]');
    return {
      value, marker: field.querySelector('.lp-product-marker'), control: value?.parentElement,
      placeholder: value?.dataset.productPlaceholder || placeholders[index], text: value?.textContent, typing: value?.dataset.productValue === 'type'
    };
  });
  if (!bar?.animate || !lock || !updated || !fields.length ||
    fields.some(field => !field.value || !field.marker)) return;

  const { duration, opacityDuration } = resolveRevealTimings();
  const easing = getPrimaryEase();
  const motionDuration = getDefaultDurationMs();
  const fadeDuration = getFastDurationMs();
  const orbitDuration = 2800;
  const typingDuration = 1400;
  const request = copilotTyping('Create a personal loan for salaried customers with direct deposit.');
  // Begin during the final settling portion of the bar’s reveal.
  const typingAt = duration * .65;
  const submitAt = typingAt + typingDuration;
  const workingAt = submitAt + motionDuration;
  const original = [title, policy, prompt].map(node => node?.textContent);
  const finalLock = lock.textContent;
  const animations = [];
  const screenAnimations = [];
  let barVisible = false, barOrigin, barObserver;
  const fieldBeat = duration * .6;
  let lockAt;
  let endAt, finishSpinFrom;
  let hard, travel, spin, origin, done = false;
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
    barObserver?.disconnect();
    travel?.dispose();
    for (const field of fields) field.value.textContent = field.text;
    lock.textContent = finalLock;
    lock.style.removeProperty('color');
    bar.removeAttribute('data-product-state');
    clearProductWorking(bar);
    [title, policy, prompt].forEach((node, i) => { if (node) node.textContent = original[i]; });
    updated.style.removeProperty('visibility');
  }

  function prepare() {
    screenAnimations.push(paused(stage, [
      { transform: 'translateY(var(--reveal-offset-default, 7rem))' },
      { transform: 'translateY(0)' }
    ], { duration, easing }));
    screenAnimations.push(paused(stage, [{ opacity: 0 }, { opacity: 1 }], { duration: opacityDuration, easing: 'linear' }));
    travel = createRevealTrack(bar, { frame: bar.parentElement, mode: 'hard', bleed: 4 });
    hard = paused(bar, travel.keyframes(), { duration, easing });
    bar.dataset.productState = 'idle';
    if (title) title.textContent = 'Ask Stitch AI';
    if (policy) policy.textContent = '';
    if (prompt) prompt.textContent = 'Ask for another change…';
    if (submit) paused(submit, [{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }],
      { duration: motionDuration, delay: submitAt, easing });
    if (icon) spin = paused(icon, [{ transform: 'rotate(0turn)' }, { transform: 'rotate(1turn)' }],
      { duration: motionDuration, easing });
    lock.textContent = 'Enter months';
    lock.style.color = '#888';
    updated.style.visibility = 'hidden';
    let delay = workingAt + motionDuration * .5;
    fields.forEach(field => {
      field.delay = delay;
      field.value.textContent = field.placeholder;
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
    const completionPhase = ((lockAt - workingAt) % orbitDuration) / orbitDuration;
    // Continue the same eased turn to 360°, then hold upright before cleanup.
    finishSpinFrom = completionPhase > 1e-8 ? completionPhase * motionDuration : motionDuration;
    const remainingTurn = (1 - finishSpinFrom / motionDuration) * orbitDuration;
    endAt = Math.max(lockAt + Math.max(fieldBeat, fadeDuration), lockAt + remainingTurn + fieldBeat);
  }

  let stop, tilt;
  try {
    const layoutTop = stage.getBoundingClientRect().top;
    prepare();
    if (stage.querySelector('.lp-product-tilt-plane')) tilt = createHolderTilt({ root: stage, selector: '.lp-product-tilt-plane', maxTilt: 2, perspective: 1800, reach: 1 });
    // Observe the stationary clipping frame, never the translated bar itself.
    // No early root margin: a bottom-positioned frame must actually reach the viewport.
    barObserver = new IntersectionObserver(([entry]) => {
      barVisible = entry.isIntersecting;
    }, { threshold: 0 });
    barObserver.observe(bar.parentElement);
    // Start near the section heading, compensating for the soft reveal’s initial displacement.
    const offset = Math.max(0, stage.getBoundingClientRect().top - layoutTop);
    stop = animateStage(stage, {
      threshold: .025,
      rootMargin: `0px 0px ${offset}px 0px`,
      update({ time, reduced, dirty }) {
        if (done) return;
        if (reduced) { done = true; restore(); stop(); return; }
        origin ??= time;
        const screenNow = (time - origin) * 1000;
        if (barOrigin === undefined && screenNow >= duration && barVisible) {
          barOrigin = time;
          barObserver.disconnect();
        }
        const now = barOrigin === undefined ? 0 : (time - barOrigin) * 1000;
        if (now >= endAt) { done = true; restore(); stop(); return; }
        if (dirty) {
          // A paused WAAPI transform still affects layout measurements.
          hard.cancel();
          travel.measure();
          hard.effect.setKeyframes(travel.keyframes());
          hard.pause();
        }
        animations.forEach(animation => {
          animation.currentTime = screenAnimations.includes(animation) ? screenNow : now;
        });
        const working = now >= workingAt && now < lockAt;
        bar.dataset.productState = now >= lockAt ? 'complete' : working ? 'working' : now >= typingAt ? 'typing' : 'idle';
        if (title) title.textContent = now >= lockAt ? 'All required details have been completed.' : working ? 'Creating personal loan...' : 'Ask Stitch AI';
        if (policy) policy.textContent = now >= lockAt ? 'Click Create loan product to proceed.' : '';
        if (prompt) {
          const progress = Math.max(0, Math.min(1, (now - typingAt) / typingDuration)) * request.total;
          const count = request.keys.filter(key => key <= progress).length;
          prompt.textContent = now >= workingAt || now < typingAt ? 'Ask for another change…' : request.letters.slice(0, count).join('');
        }
        const workTime = Math.max(0, now - workingAt);
        const orbitPhase = (workTime % orbitDuration) / orbitDuration;
        if (spin) {
          spin.currentTime = now >= lockAt
            ? Math.min(motionDuration, finishSpinFrom + (now - lockAt) / orbitDuration * motionDuration)
            : working ? orbitPhase * motionDuration : 0;
        }
        if (now >= workingAt && now < lockAt + fadeDuration) {
          // Keep both layers moving through the completion fade, then remove them.
          const fadeIn = workTime / fadeDuration;
          const fadeOut = now < lockAt ? 1 : 1 - (now - lockAt) / fadeDuration;
          renderProductWorking(bar, workTime / 1000, Math.min(1, fadeIn, fadeOut));
        } else {
          clearProductWorking(bar);
        }
        if (now >= lockAt) {
          lock.textContent = finalLock;
          lock.style.removeProperty('color');
          updated.style.removeProperty('visibility');
        }
        if (working) lock.textContent = '6';
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
    tilt?.dispose();
    restore();
    throw error;
  }
  return () => { stop(); tilt?.dispose(); restore(); };
});
