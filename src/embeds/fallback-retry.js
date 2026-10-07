import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { sampleUpwardCarousel } from '../lib/effects/upward-carousel.js';
import { createDotsField } from '../lib/effects/dots-field.js';
import { cubicBezier } from '../lib/motion.js';
import { toMs } from '../lib/time.js';
export function carouselOptions(root) {
  const visibleSlots = Number(root.dataset.carouselVisibleSlots ?? 3);
  const hiddenScale = Number(root.dataset.carouselHiddenScale ?? .72);
  if (!Number.isInteger(visibleSlots) || visibleSlots < 1 || !Number.isFinite(hiddenScale) || hiddenScale <= 0) return null;
  return { visibleSlots, hiddenScale, scaleMode: root.dataset.carouselScaleMode === 'edges' ? 'edges' : 'adjacent', spacing:54 };
}
export const init = stageInitializer('[data-fallback-retry]', root => {
  const rows = [...root.querySelectorAll('[data-fr-row]')], options = carouselOptions(root);
  if (!options || rows.length !== options.visibleSlots + 2) return;
  const css = getComputedStyle(root), duration = toMs(css.getPropertyValue('--motion-duration-default'),0);
  const curve = css.getPropertyValue('--motion-ease-primary').trim().match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  if (!(duration > 0) || curve?.length !== 4 || !curve.every(Number.isFinite)) return;
  const ease = cubicBezier(...curve), saved = rows.map(n => n.style.cssText);
  let stage, dots, dotObserver, dotsResize, disposed = false, visible = false;
  const canvas = root.querySelector('[data-fr-dots]'), sensor = root.querySelector('[data-fr-sensor]');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const syncDots = () => {
    dots?.(); dots = null; delete root.dataset.frDotsReady;
    canvas?.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);
    if (!disposed && visible && !document.hidden && !media.matches && canvas && sensor) {
      dots = createDotsField({canvas,sensor,options:{gap:Math.max(1,root.clientWidth*16/540),baseSize:root.clientWidth*.6/540}});
      root.dataset.frDotsReady = '';
    }
  };
  const restore = () => rows.forEach((n,i) => n.style.cssText = saved[i]);
  const dispose = () => { if (disposed) return; disposed = true; stage?.(); dots?.(); dotObserver?.disconnect(); dotsResize?.disconnect(); media.removeEventListener('change',syncDots); document.removeEventListener('visibilitychange',syncDots); delete root.dataset.frDotsReady; restore(); };
  try {
    stage = animateStage(root,{update({time,reduced}) {
      try {
        if (!root.isConnected) { dispose(); return; }
        if (reduced) { restore(); dots?.(); dots = null; return; }
        rows.forEach((n,i) => {
          const p = sampleUpwardCarousel(time*1000,i,duration,ease,options);
          n.style.transform = `translateY(${p.y/5.4}cqi) scale(${p.scale})`;
          n.style.opacity = String(p.opacity); n.style.visibility = p.opacity === 0 ? 'hidden' : 'visible';
        });
      } catch (error) { dispose(); console.error('Fallback retry render failed',error); }
    }});
    dotObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncDots(); });
    dotObserver.observe(root);
    let measuredWidth = root.clientWidth;
    dotsResize = new ResizeObserver(() => { if (measuredWidth !== root.clientWidth) { measuredWidth = root.clientWidth; syncDots(); } });
    dotsResize.observe(root); media.addEventListener('change',syncDots); document.addEventListener('visibilitychange',syncDots);
  } catch (error) { dispose(); console.error('Fallback retry setup failed',error); }
  return dispose;
});
if (typeof document !== 'undefined') {
  const mount = window[Symbol.for('stitch.fallback-retry.init')] ||= init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>mount(),{once:true}); else mount();
}
