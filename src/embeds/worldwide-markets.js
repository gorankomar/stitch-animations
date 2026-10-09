import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';

export const SWEEP_SECONDS = 4.5;
export const CYCLE_SECONDS = 7;
// A continuous directional sweep follows the catalog's linear-loop rule.
export function sweepPosition(time) {
  const phase = ((time % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
  // The artwork wrapper is mirrored: decreasing local X travels left to right on screen.
  return 100 / .75 - Math.min(phase / SWEEP_SECONDS, 1) * (100 + 100 / .75);
}
export const init = stageInitializer('[data-worldwide-markets]', root => {
  const image = root.querySelector('.wm-map');
  const mask = root.querySelector('.wm-mask');
  const glow = root.querySelector('.wm-glow');
  if (!image || !mask || !glow) return;
  let disposed = false, stop;
  const saved = { mask:mask.style.maskImage, webkit:mask.style.webkitMaskImage, transform:glow.style.transform };
  const restore = () => {
    root.removeAttribute('data-wm-ready');
    mask.style.maskImage = saved.mask;
    mask.style.webkitMaskImage = saved.webkit;
    glow.style.transform = saved.transform;
  };
  async function mount() {
    try {
      await image.decode();
      if (disposed || !CSS.supports('mask-image', 'url("x.svg")')) return;
      const url = `url(${JSON.stringify(image.currentSrc || image.src)})`;
      mask.style.maskImage = url;
      mask.style.webkitMaskImage = url;
      stop = animateStage(root, { threshold:.1, update:({time,reduced}) => {
        if (reduced) { restore(); return; }
        mask.style.maskImage = url;
        mask.style.webkitMaskImage = url;
        glow.style.transform = `translateX(${sweepPosition(time)}%)`;
        root.setAttribute('data-wm-ready', '');
      } });
    } catch { stop?.(); restore(); }
  }
  mount();
  return () => { disposed=true; stop?.(); restore(); };
});
if (typeof window !== 'undefined') {
  const key = Symbol.for('stitch.worldwide-markets.init');
  const mount = window[key] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), { once:true });
  else mount();
}
