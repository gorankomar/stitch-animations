import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createPathPulse, pulseDefaults } from '../lib/effects/path-pulse.js';
export const init = stageInitializer('[data-consumer-verification]', stage => {
  const generated = [], controllers = [];
  let stop;
  const cleanup = () => { stop?.(); controllers.forEach(p => p.dispose()); generated.forEach(p => p.remove()); stage.removeAttribute('data-cv-ready'); };
  try {
    stage.querySelectorAll('[data-cv-lines]').forEach(svg => {
      // Only the six explicitly marked pale source paths get overlays.
      svg.querySelectorAll('[data-cv-pale]').forEach(source => {
        const pulse = source.cloneNode(false);
        pulse.removeAttribute('id'); pulse.removeAttribute('data-cv-pale');
        pulse.setAttribute('data-cv-pulse', ''); pulse.setAttribute('opacity', '0');
        pulse.setAttribute('stroke-width', '1'); pulse.setAttribute('stroke-linecap', 'round');
        source.parentNode.append(pulse); generated.push(pulse);
        const top = svg.dataset.cvLines.endsWith('top');
        const edge = top ? (svg.dataset.cvLines.startsWith('right') ? 54.5 : 48.5) : 66.75;
        let lo = 0, hi = pulse.getTotalLength();
        for (let i = 0; i < 24; i++) {
          const mid = (lo + hi) / 2, y = pulse.getPointAtLength(mid).y;
          if (top ? y > edge : y < edge) lo = mid; else hi = mid;
        }
        controllers.push(createPathPulse(pulse, { end: (lo + hi) / 2, span: Number(stage.dataset.pulseSpan) || pulseDefaults.span * .195, speed: Number(stage.dataset.pulseSpeed) || pulseDefaults.speed * .85, color: stage.dataset.pulseColor || pulseDefaults.color, reverse: true, start: Math.random() * 3.2 }));
      });
    });
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
