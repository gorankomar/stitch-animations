import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';

// One shared clock keeps pulse arrival, card response and ring propagation in sync.
export const cycle = 4.8;
export function response(time, start, duration) {
  const progress = (time - start) / duration;
  return progress > 0 && progress < 1 ? Math.sin(Math.PI * progress) ** 2 : 0;
}
export function endpoint(name, push) {
  const scale = 1 + push * .012, move = push * 1.2;
  return { top: [129, 44 - move + 15.5 * scale], right: [206 + move - 20.5 * scale, 118], bottom: [129, 190 + move - 15.5 * scale], left: [51 - move + 20.5 * scale, 118] }[name];
}
export function wave(time, start, amplitude) {
  const progress = (time - start) / 1.8;
  return progress > 0 && progress < 1 ? { scale: 1 + progress * amplitude, opacity: Math.sin(Math.PI * progress) ** 2 * .55 } : { scale: 1, opacity: 0 };
}
export const init = stageInitializer('[data-embedded-connectivity]', stage => {
  const cards = [...stage.querySelectorAll('[data-ec-card]')];
  const rings = [...stage.querySelectorAll('[data-ec-ring]')];
  const pulses = [...stage.querySelectorAll('[data-ec-pulse]')];
  const direction = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
  const ringMotion = { inner: [1.35, .09], middle: [1.75, .045], outer: [2.15, .02] };
  const starts = { top: [129, 86], right: [161, 118], bottom: [129, 151], left: [96, 118] };
  const lines = [...stage.querySelectorAll('[data-ec-line]')];
  const dots = [...stage.querySelectorAll('[data-ec-dot]')];
  const gradients = [...stage.querySelectorAll('[data-ec-gradient]')];
  const stop = animateStage(stage, {
    threshold: .25,
    update({ time, reduced }) {
      const t = time % cycle;
      // Pulse head reaches the provider at 1.35s; the tail then clears.
      const travel = (t - .25) / 1.1;
      pulses.forEach(path => {
        path.style.strokeDashoffset = .55 - travel;
        path.style.opacity = !reduced && travel > 0 && travel < 1.55 ? '1' : '0';
      });
      const push = reduced ? 0 : response(t, 1.35, 1.3);
      cards.forEach(card => {
        const [x, y] = direction[card.dataset.ecCard];
        card.style.transform = `translate(${x * push * 1.2 / 258 * 100}cqi, ${y * push * 1.2 / 258 * 100}cqi) scale(${1 + push * .012})`;
      });
      lines.concat(pulses).forEach(path => {
        const name = path.dataset.ecLine || path.dataset.ecPulse;
        path.setAttribute('d', `M${starts[name].join(' ')}L${endpoint(name, push).join(' ')}`);
      });
      dots.forEach(dot => {
        const [x, y] = endpoint(dot.dataset.ecDot, push);
        dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      });
      gradients.forEach(gradient => {
        const [x, y] = endpoint(gradient.dataset.ecGradient, push);
        gradient.setAttribute('x2', x); gradient.setAttribute('y2', y);
      });
      rings.forEach(ring => {
        const [start, amplitude] = ringMotion[ring.dataset.ecRing];
        const state = wave(reduced ? 0 : t, start, amplitude);
        ring.style.setProperty('--ec-wave-scale', state.scale);
        ring.style.setProperty('--ec-wave-opacity', state.opacity);
      });
    }
  });
  return () => {
    stop();
    cards.forEach(node => node.style.removeProperty('transform'));
    rings.forEach(node => { node.style.removeProperty('--ec-wave-scale'); node.style.removeProperty('--ec-wave-opacity'); });
    pulses.forEach(node => { node.style.removeProperty('opacity'); node.style.removeProperty('stroke-dashoffset'); });
  };
});
// Embeds can occur more than once on a page; reuse one mount registry.
const registryKey = Symbol.for('stitch.embedded-connectivity.init');
const mount = window[registryKey] ||= init;
function boot() { mount(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
