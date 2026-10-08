import { createIssuerFocus } from './issuer-routing-focus.js';
import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { createSoftPathPulse } from '../lib/effects/soft-path-pulse.js';
import { createDotsField } from '../lib/effects/dots-field.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';

// Every split begins when the incoming head reaches its junction. The country
// paths continue beneath the opaque country cards, preserving travel continuity.
export function issuerPulseSchedule(lengths, speed = 48, span = 32, gap = .6) {
  const starts = { stem: 0 };
  for (const country of ['ksa', 'eu']) {
    starts[country] = lengths.stem / speed;
    starts[`${country}-stem`] = starts[country] + lengths[country] / speed;
    starts[`${country}-top`] = starts[`${country}-bottom`] = starts[`${country}-stem`] + lengths[`${country}-stem`] / speed;
  }
  const period = Math.max(...Object.entries(lengths).map(([name, length]) => starts[name] + (length + span) / speed)) + gap;
  return { starts, period };
}

let instanceSerial = 0;
function namespaceArtwork(root) {
  const saved = [], prefix = `issuer-routing-${++instanceSerial}-`;
  for (const svg of root.querySelectorAll('svg')) {
    const ids = new Map([...svg.querySelectorAll('[id]')].map(node => [node.id, prefix + node.id]));
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      for (const attribute of [...node.attributes]) {
        let value = attribute.value;
        if (attribute.name === 'id' && ids.has(value)) value = ids.get(value);
        else for (const [oldId, newId] of ids) {
          value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`);
          if ((attribute.name === 'href' || attribute.name === 'xlink:href') && value === `#${oldId}`) value = `#${newId}`;
        }
        if (value !== attribute.value) { saved.push([node, attribute.name, attribute.value]); node.setAttribute(attribute.name, value); }
      }
    }
  }
  return () => saved.forEach(([node, name, value]) => node.setAttribute(name, value));
}

export const init = stageInitializer('[data-issuer-routing]', root => {
  const frame = root.querySelector('.ir-frame');
  const nodes = [...root.querySelectorAll('[data-ir-reveal]')];
  const paths = [...root.querySelectorAll('[data-ir-pulse]')];
  if (!frame || nodes.length !== 11 || paths.length !== 9) return;
  const css = getComputedStyle(root);
  const duration = toMs(css.getPropertyValue('--motion-duration-default'), 0) / 1000;
  const curve = css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  const stagger = toMs(css.getPropertyValue('--reveal-stagger-default'), 0) / 1000;
  const opacityRatio = Number(css.getPropertyValue('--reveal-opacity-ratio'));
  const offsetToken = css.getPropertyValue('--reveal-offset-default').trim();
  const offset = offsetToken.endsWith('rem') ? parseFloat(offsetToken) * parseFloat(getComputedStyle(document.documentElement).fontSize) : offsetToken.endsWith('px') ? parseFloat(offsetToken) : NaN;
  if (!(duration > 0 && stagger >= 0 && opacityRatio > 0 && Number.isFinite(offset)) || curve?.length !== 4 || !curve.every(Number.isFinite)) return;
  const ease = cubicBezier(...curve);
  const starts = nodes.map(node => Number(node.dataset.irReveal) * stagger);
  const pulseStart = Math.max(...starts) + duration + stagger;
  const tracks = [], pulses = [];
  let stop, stopDots, stopFocus, restoreArtwork, disposed = false;
  const dots = root.querySelector('.ir-dots');
  const canvas = root.querySelector('[data-ir-dots]');
  const savedDots = dots?.style.backgroundImage;
  const savedCanvasOpacity = canvas?.style.opacity;
  const mountDots = () => {
    stopDots?.(); stopDots = null;
    if (canvas?.getContext('2d')) {
      stopDots = createDotsField({ canvas, sensor: dots, interactive: false, options: { gap: root.clientWidth * 16 / 540, baseSize: root.clientWidth * .6 / 540 } });
      dots.style.backgroundImage = 'none'; canvas.style.opacity = '1';
    }
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true; stop?.(); stopFocus?.();
    tracks.forEach(track => track.dispose()); pulses.forEach(pulse => pulse.dispose());
    root.removeAttribute('data-ir-ready');
    restoreArtwork?.(); stopDots?.(); if (dots) dots.style.backgroundImage = savedDots;
    if (canvas) canvas.style.opacity = savedCanvasOpacity;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };
  const measure = () => {
    tracks.splice(0).forEach(track => track.dispose());
    nodes.forEach(node => tracks.push(createRevealTrack(node, { frame, mode: 'soft', direction: 'right-to-left', offset: offset * root.getBoundingClientRect().width / 540 })));
  };
  try {
    restoreArtwork = namespaceArtwork(root);
    measure(); mountDots();
    const lengths = Object.fromEntries(paths.map(path => [path.dataset.irPulse, path.getTotalLength()]));
    const schedule = issuerPulseSchedule(lengths);
    paths.forEach(path => pulses.push(createSoftPathPulse(path, { start: pulseStart + schedule.starts[path.dataset.irPulse], period: schedule.period })));
    stopFocus = createIssuerFocus(root);
    stop = animateStage(root, { threshold: .25, update({ time, reduced, dirty }) {
      if (disposed) return;
      try {
        if (!root.isConnected) { cleanup(); return; }
        if (dirty) { measure(); mountDots(); }
        tracks.forEach((track, i) => {
          const elapsed = time - starts[i];
          track.render(reduced ? 1 : elapsed / duration, ease, reduced ? 1 : elapsed / (duration * opacityRatio));
        });
        pulses.forEach(pulse => pulse.update(time, reduced));
      } catch (error) { cleanup(); console.warn('Issuer routing motion unavailable', error); }
    }});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tracks.forEach(track => track.render(0, ease, 0));
    root.setAttribute('data-ir-ready', '');
  } catch (error) { cleanup(); console.warn('Issuer routing setup unavailable', error); }
  return cleanup;
});

if (typeof document !== 'undefined') {
  const mount = window[Symbol.for('stitch.issuer-routing.init')] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), { once: true });
  else mount();
}
