let gradientId = 0;
import { paintPulse } from './connector.js';
export const pulseDefaults = Object.freeze({ span: 40, speed: 72, color: 'var(--_primitives---colors--primary-blue, #3342ff)', minDelay: .6, maxDelay: 3.2, fadeWithSource: true });
// Existing SVG geometry remains untouched. The caller owns visibility and time.
export function createPathPulse(path, { span = pulseDefaults.span, speed = pulseDefaults.speed, color = pulseDefaults.color, reverse = false, start = 0, random = Math.random, minDelay = pulseDefaults.minDelay, maxDelay = pulseDefaults.maxDelay, end, period, fadeWithSource = pulseDefaults.fadeWithSource } = {}) {
  if (period !== undefined && !(period > 0)) throw new Error('Invalid pulse period');
  if (!(span > 0 && speed > 0 && minDelay >= 0 && maxDelay >= minDelay)) throw new Error('Invalid pulse options');
  const length = path.getTotalLength();
  const saved = path.getAttribute('style');
  const rangeEnd = Math.min(length, end ?? length);
  let next = start, travel = (rangeEnd + span) / speed;
  // Retain the source gradient's spatial alpha envelope; only replace its color.
  // This fades the whole short band along curves, rather than just its midpoint.
  let gradient;
  const reference = path.getAttribute('stroke')?.match(/^url\(["']?#([^"')]+)["']?\)$/)?.[1];
  const source = reference && [...(path.ownerSVGElement?.querySelectorAll('linearGradient,radialGradient') || [])].find(node => node.id === reference);
  if (fadeWithSource && source) {
    gradient = source.cloneNode(true);
    gradient.id = `stitch-pulse-${++gradientId}-${Math.random().toString(36).slice(2)}`;
    gradient.querySelectorAll('stop').forEach(stop => {
      stop.setAttribute('stop-color', color);
      stop.style.stopColor = color;
    });
    source.parentNode.append(gradient);
  }
  path.style.stroke = gradient ? `url(#${gradient.id})` : color;
  path.style.opacity = '0';
  return {
    update(time, reduced = false) {
      if (reduced) { path.style.opacity = '0'; return; }
      if (!period && time >= next + travel) next = time + minDelay + random() * (maxDelay - minDelay);
      const phase = period ? ((time - start) % period + period) % period : time - next;
      const head = phase * speed;
      paintPulse(path, { head: reverse ? rangeEnd + span - head : head, span, length, active: time >= start && head >= 0 && head <= rangeEnd + span });
    },
    dispose() { gradient?.remove(); if (saved === null) path.removeAttribute('style'); else path.setAttribute('style', saved); }
  };
}
