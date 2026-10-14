import { qsa } from '../../lib/dom.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { createHeroStackController } from '../../lib/effects/hero-stack.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import './styles.css';

const mounted = new WeakMap();
export function init(root = document) {
  if (typeof window === 'undefined' || !root) return () => {};
  const disposers = qsa('[data-anim="hero"]', root).map(section => {
    if (mounted.has(section)) return () => {};
    let cleanup = () => {};
    const setup = () => {
      cleanup = createHeroStackController(section, ensureSectionReveal(section));
      return cleanup;
    };
    const stop = section.dataset.revealStart === 'early' ? (setup(), () => cleanup()) : whenVisible(section, setup);
    const dispose = () => { stop(); mounted.delete(section); };
    mounted.set(section, dispose);
    return dispose;
  });
  return () => disposers.forEach(dispose => dispose());
}
