import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createPathPulse, pulseDefaults } from '../lib/effects/path-pulse.js';
// The five native slots also work outside Webflow. Icons are supplied as nodes,
// keeping their own markup and supported properties intact.
export function setConsumerVerificationSlots(stage, slots) {
  for (const [name, value] of Object.entries(slots)) {
    const slot = stage.querySelector(`[data-cv-slot="${name}"]`);
    if (!slot) throw new Error(`Unknown Consumer Verification slot: ${name}`);
    if (value.component) slot.querySelector('[data-cv-label-slot]')?.replaceChildren(value.component.cloneNode(true));
    const label = slot.querySelector('[data-cv-label-text]');
    const icon = slot.querySelector('.cv-icon');
    if (value.label !== undefined && label) label.textContent = value.label;
    if (value.icon && icon) icon.replaceChildren(value.icon.cloneNode(true));
  }
  const center = stage.querySelector('[data-cv-slot="center"] [data-cv-label-text]')?.textContent;
  const outer = [...stage.querySelectorAll('.cv-label-position [data-cv-label-text]')].map(node => node.textContent);
  stage.setAttribute('aria-label', `${outer.join(', ')} connect to ${center}`);
}
export const init = stageInitializer('[data-consumer-verification], [data-consumer-verification-fluid]', stage => {
  const generated = [], controllers = [];
  const lineSlots = [...stage.querySelectorAll('.cv-line-slot')];
  const savedSlots = lineSlots.map(node => node.getAttribute('style'));
  const sources = [...stage.querySelectorAll('[data-cv-lines] path:not([data-cv-pale])')];
  const savedPaths = sources.map(node => node.getAttribute('d'));
  const gradients = [...stage.querySelectorAll('[data-cv-lines] linearGradient')];
  const savedGradients = gradients.map(node => [node.getAttribute('y1'), node.getAttribute('y2')]);
  let stop, resize;
  const cleanup = () => {
    stop?.(); resize?.disconnect(); controllers.forEach(p => p.dispose()); generated.forEach(p => p.remove());
    lineSlots.forEach((node, i) => savedSlots[i] === null ? node.removeAttribute('style') : node.setAttribute('style', savedSlots[i]));
    sources.forEach((node, i) => node.setAttribute('d', savedPaths[i]));
    gradients.forEach((node, i) => ['y1', 'y2'].forEach((attr, j) => savedGradients[i][j] === null ? node.removeAttribute(attr) : node.setAttribute(attr, savedGradients[i][j])));
    stage.removeAttribute('data-cv-ready');
  };
  try {
    const rebuild = () => {
      controllers.splice(0).forEach(p => p.dispose());
      generated.splice(0).forEach(p => p.remove());
      const frame = stage.querySelector('.cv-frame');
      const frameRect = frame.getBoundingClientRect();
      const hub = (stage.querySelector('[data-cv-slot="center"]') || stage.querySelector('.cv-consumer')).getBoundingClientRect();
      const unit = Math.min(frame.clientWidth / 258, frame.clientHeight / 232);
      const scale = Math.min(frame.clientWidth / 540, frame.clientHeight / 232);
      stage.querySelectorAll('[data-cv-lines]').forEach(svg => {
        const top = svg.dataset.cvLines.endsWith('top');
        const right = svg.dataset.cvLines.startsWith('right');
        const name = top ? (right ? 'income' : 'documents') : (right ? 'employment' : 'identity');
        const label = stage.querySelector(`.cv-position-${name}`).getBoundingClientRect();
        const dark = svg.querySelector('path:not([data-cv-pale])');
        const inner = dark.hasAttribute('data-cv-anchor-x')
          ? {x: Number(dark.dataset.cvAnchorX), y: Number(dark.dataset.cvAnchorY)}
          : dark.getPointAtLength(0);
        const outer = dark.getPointAtLength(dark.getTotalLength());
        const { width, height } = svg.viewBox.baseVal;
        const sourceX = x => right ? x : width - x;
        const originX = frameRect.left + frame.clientLeft, originY = frameRect.top + frame.clientTop;
        const labelX = (label.left + label.right) / 2 - originX;
        const centerX = (hub.left + hub.right) / 2 - originX;
        const centerY = (hub.top + hub.bottom) / 2 - originY;
        const left = labelX - sourceX(outer.x) * scale;
        const y = centerY + (top ? -4 : 4) * unit - inner.y * scale;
        const slot = svg.parentNode;
        slot.style.left = `${left}px`;
        slot.style.top = `${y}px`;
        slot.style.width = `${width * scale}px`;
        slot.style.height = `${height * scale}px`;
        const clipX = right ? centerX - left : width * scale - (centerX - left);
        slot.style.clipPath = `inset(-1000cqi -1000cqi -1000cqi ${clipX}px)`;
        if (dark.dataset.cvTail) {
          const startX = right ? (centerX - left) / scale : width - (centerX - left) / scale;
          const startY = (centerY - y) / scale;
          // The extension ends at the hub center and meets the exported line tangentially.
          const tangent = Number(dark.dataset.cvTangent);
          dark.setAttribute('d', `M${startX} ${startY} C${(startX + inner.x) / 2} ${startY} ${inner.x - 20} ${inner.y - tangent * 20} ${inner.x} ${inner.y} ${dark.dataset.cvTail}`);
        }
        svg.querySelectorAll('linearGradient:not([data-pulse-gradient])').forEach(gradient => {
          gradient.setAttribute('y1', ((top ? 0 : frame.clientHeight) - y) / scale);
          gradient.setAttribute('y2', inner.y);
        });
        // Only the six explicitly marked pale source paths get overlays.
        svg.querySelectorAll('[data-cv-pale]').forEach(source => {
          const pulse = source.cloneNode(false);
          pulse.removeAttribute('id'); pulse.removeAttribute('data-cv-pale');
          pulse.setAttribute('data-cv-pulse', ''); pulse.setAttribute('opacity', '0');
          pulse.setAttribute('stroke-width', '1'); pulse.setAttribute('stroke-linecap', 'round');
          source.parentNode.append(pulse); generated.push(pulse);
          const bounds = svg.getBoundingClientRect();
          const edge = ((top ? label.bottom : label.top) - bounds.top) / bounds.height * svg.viewBox.baseVal.height;
          let lo = 0, hi = pulse.getTotalLength();
          for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2, y = pulse.getPointAtLength(mid).y;
            if (top ? y > edge : y < edge) lo = mid; else hi = mid;
          }
          controllers.push(createPathPulse(pulse, { end: (lo + hi) / 2, span: Number(stage.dataset.pulseSpan) || pulseDefaults.span * .195, speed: Number(stage.dataset.pulseSpeed) || pulseDefaults.speed * .85, color: stage.dataset.pulseColor || pulseDefaults.color, reverse: true, start: Math.random() * 3.2 }));
        });
      });
    };
    rebuild();
    resize = new ResizeObserver(() => {
      try { rebuild(); } catch (error) { cleanup(); console.warn('Consumer Verification resize unavailable', error); }
    });
    resize.observe(stage);
    stage.querySelectorAll('.cv-label-position, .cv-center-position').forEach(node => resize.observe(node));
    stop = animateStage(stage, { threshold: .25, update({time, reduced}) { controllers.forEach(p => p.update(time, reduced)); } });
    stage.setAttribute('data-cv-ready', '');
  } catch (error) { cleanup(); console.warn('Consumer Verification motion unavailable', error); }
  return cleanup;
});
if (typeof window !== 'undefined') {
  const mount = window[Symbol.for('stitch.consumer-verification.init')] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), {once:true});
  else mount();
}
