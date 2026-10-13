import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { createExpandingRings } from '../lib/effects/expanding-rings.js';
import { createSoftPathPulse } from '../lib/effects/soft-path-pulse.js';
import { createDotsField } from '../lib/effects/dots-field.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';
import { createValueCounter, parseCounterTextTemplate } from '../lib/effects/value-counter.js';

export function addedProgress(time, { start, period, distance, width, speed = 48 }) {
  if (time < start) return 0;
  const travel = ((time - start) % period) * speed;
  return Math.max(0, Math.min(1, (travel - distance) / width));
}

export function addedFillOpacity(time, { start, period, fadeStart, fadeDuration = 1 }) {
  if (time < start) return 1;
  const phase = (time - start) % period;
  return Math.max(0, Math.min(1, 1 - (phase - fadeStart) / fadeDuration));
}

export const init = stageInitializer('[data-deposits-wallet]', root => {
  const frame = root.querySelector('.dw-frame-1');
  const hard = [...root.querySelectorAll('[data-dw-hard]')];
  const soft = [...root.querySelectorAll('[data-dw-soft]')];
  const rings = [...root.querySelectorAll('[data-dw-ring]')];
  const path = root.querySelector('[data-dw-pulse]');
  const badge = root.querySelector('.dw-added');
  const balance = root.querySelector('.dw-balance-value');
  const savedBalance = balance?.textContent;
  const targetBalance = parseCounterTextTemplate(balance)?.value;
  if (!frame || hard.length !== 4 || rings.length !== 3 || !path || !badge) return;
  const css = getComputedStyle(root);
  const duration = toMs(css.getPropertyValue('--motion-duration-default'), 0) / 1000;
  const stagger = toMs(css.getPropertyValue('--reveal-stagger-default'), 0) / 1000;
  const ratio = Number(css.getPropertyValue('--reveal-opacity-ratio'));
  const curve = css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  if (!(duration > 0 && stagger >= 0 && ratio > 0) || curve?.length !== 4 || !curve.every(Number.isFinite)) return;
  const ease = cubicBezier(...curve);
  const tracks = [], ringAnimations = [], phases = [];
  const savedProgress = root.style.getPropertyValue('--dw-added-progress');
  const savedOpacity = root.style.getPropertyValue('--dw-added-opacity');
  const dots = root.querySelector('.dw-dots'), canvas = root.querySelector('[data-dw-dots]');
  const savedDots = dots.style.backgroundImage, savedCanvas = canvas.style.opacity;
  let stop, pulse, stopDots, counter, disposed = false, pulseOptions;
  const softStart = hard.length * stagger + duration;
  const balanceStart = softStart + Math.max(0, soft.indexOf(root.querySelector('.dw-balance'))) * stagger;
  const pulseStart = softStart + soft.length * stagger + duration;
  function clearRings() { ringAnimations.splice(0).forEach(a => a.cancel()); phases.length = 0; }
  function measure() {
    tracks.splice(0).forEach(t => t.dispose());
    hard.forEach((node, i) => tracks.push({ ...createRevealTrack(node, { frame, mode: 'hard', direction: 'bottom-to-top' }), start: i * stagger, soft: false }));
    soft.forEach((node, i) => tracks.push({ ...createRevealTrack(node, { frame, mode: 'soft', direction: 'bottom-to-top', offset: root.clientWidth * 24 / 593 }), start: softStart + i * stagger, soft: true }));
    clearRings();
    const f = frame.getBoundingClientRect(), card = hard[1].getBoundingClientRect();
    const center = { x: (card.left + card.width / 2 - f.left) / f.width * 593, y: (card.top + card.height / 2 - f.top) / f.width * 593 };
    createExpandingRings({ rings, duration: duration * 1000, diameters: [616, 488, 212], minimum: 212, range: 404, sizing: { designWidth: 593, center }, animations: ringAnimations });
    ringAnimations.forEach(a => phases.push(a.currentTime || 0));
    const p = path.getBoundingClientRect(), b = badge.getBoundingClientRect();
    const scale = root.clientWidth / 593;
    const fadeStart = (path.getTotalLength() + 32) / 48 + duration * 2;
    pulseOptions = { start: pulseStart, period: fadeStart + 1 + .5, fadeStart, fadeDuration: 1, distance: Math.max(0, (b.left - p.left) / scale), width: b.width / scale };
    pulse?.dispose(); pulse = createSoftPathPulse(path, pulseOptions);
    stopDots?.();
    if (canvas?.getContext('2d')) {
      stopDots = createDotsField({ canvas, sensor: dots, interactive: false, options: { gap: root.clientWidth * 16 / 593, baseSize: root.clientWidth * .6 / 593 } });
      dots.style.backgroundImage = 'none'; canvas.style.opacity = '1';
    }
  }
  function cleanup() {
    if (disposed) return;
    disposed = true; stop?.(); stopDots?.(); pulse?.dispose(); clearRings();
    tracks.forEach(t => t.dispose()); root.removeAttribute('data-dw-ready');
    counter?.dispose();
    if (balance) balance.textContent = savedBalance;
    if (savedProgress) root.style.setProperty('--dw-added-progress', savedProgress); else root.style.removeProperty('--dw-added-progress');
    if (savedOpacity) root.style.setProperty('--dw-added-opacity', savedOpacity); else root.style.removeProperty('--dw-added-opacity');
    dots.style.backgroundImage = savedDots; canvas.style.opacity = savedCanvas;
  }
  try {
    measure();
    if (balance && Number.isFinite(targetBalance)) counter = createValueCounter({ element: balance, initialValue: matchMedia('(prefers-reduced-motion: reduce)').matches ? targetBalance : 0, driver: 'external', prefix: '$', decimals: 2 });
    stop = animateStage(root, { threshold: .1, update({ time, reduced, dirty }) {
      try {
        if (!root.isConnected) { cleanup(); return; }
        if (dirty) measure();
        tracks.forEach(t => t.render(reduced ? 1 : (time - t.start) / duration, ease, reduced ? 1 : (time - t.start) / (duration * ratio)));
        counter?.jumpTo(targetBalance * (reduced ? 1 : ease(Math.max(0, Math.min(1, (time - balanceStart) / duration)))));
        if (reduced) clearRings();
        else { if (!ringAnimations.length) measure(); ringAnimations.forEach((a, i) => { a.currentTime = phases[i] + Math.max(0, time - softStart) * 1000; }); }
        pulse.update(time, reduced);
        root.style.setProperty('--dw-added-progress', String(reduced ? 1 : addedProgress(time, pulseOptions)));
        root.style.setProperty('--dw-added-opacity', String(reduced ? 1 : addedFillOpacity(time, pulseOptions)));
      } catch (error) { cleanup(); console.warn('Deposits wallet retained its static appearance', error); }
    }});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tracks.forEach(t => t.render(0, ease, 0));
    root.setAttribute('data-dw-ready', '');
  } catch (error) { cleanup(); console.warn('Deposits wallet setup unavailable', error); }
  return cleanup;
});

if (typeof document !== 'undefined') {
  const mount = window[Symbol.for('stitch.deposits-wallet.init')] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), { once: true });
  else mount();
}
