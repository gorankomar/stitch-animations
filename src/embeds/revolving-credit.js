import { stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealController } from '../lib/effects/reveal-groups.js';
import { cubicBezier } from '../lib/motion.js';
import { createSoftPathPulse } from '../lib/effects/soft-path-pulse.js';
import { toMs } from '../lib/time.js';

import { sampleUpwardCarousel as sampleCreditLabel } from '../lib/effects/upward-carousel.js';
export { sampleCreditLabel };

const key = Symbol.for('stitch.revolving-credit.init');
let sequence = 0;
function setup(root) {
  const svg = root.querySelector('.rc-route-svg');
  const source = svg?.querySelector('[data-rc-route="0"]');
  const labels = [...root.querySelectorAll('[data-rc-label]')];
  const rows = [...root.querySelectorAll('[data-rc-reveal]')];
  const css = getComputedStyle(root);
  const ease = css.getPropertyValue('--motion-ease-primary').trim();
  const duration = toMs(css.getPropertyValue('--motion-duration-default'), 0);
  const curve = ease.match(/^cubic-bezier\(([^)]+)\)$/)?.[1].split(',').map(Number);
  const easing = curve?.length === 4 && cubicBezier(...curve);
  if (!source || labels.length !== 5 || rows.length !== 1 || !easing || !(duration > 0)) return;
  const labelStyles = labels.map(node => node.getAttribute('style'));
  function restoreLabels() {labels.forEach((node,i) => labelStyles[i] === null ? node.removeAttribute('style') : node.setAttribute('style',labelStyles[i]));}
  const saved = rows.map(node => node.getAttribute('style'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const reveal = createRevealController({root, selector:'[data-rc-reveal]', groupSelector:'[data-rc-group]', timings:{duration, stagger:toMs(css.getPropertyValue('--reveal-stagger-default'),200), opacityRatio:parseFloat(css.getPropertyValue('--reveal-opacity-ratio')) || .34}});
  const ownedSvgs = [svg, ...root.querySelectorAll('.rc-coins svg')];
  const originals = [], references = [];
  ownedSvgs.forEach((art, index) => {
    const suffix = `-rc-instance-${sequence + 1}-svg-${index}`;
    [...art.querySelectorAll('[id]')].forEach(node => originals.push([node,node.id,suffix]));
    [...art.querySelectorAll('[stroke], [clip-path]')].forEach(node => {
      ['stroke','clip-path'].filter(name => node.hasAttribute(name)).forEach(name => references.push([node,name,node.getAttribute(name),suffix]));
    });
  });
  sequence++;
  const pulses = [];
  let visible = false, started = false, disposed = false, observer, raf = 0, last = 0, time = 0;
  function restoreEntrance() {
    root.removeAttribute('data-rc-ready');
    reveal.cancel();
    rows.forEach((node,i) => saved[i] === null ? node.removeAttribute('style') : node.setAttribute('style', saved[i]));
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf); observer?.disconnect(); restoreLabels();
    motion.removeEventListener('change',sync); document.removeEventListener('visibilitychange',sync);
    restoreEntrance(); root.removeAttribute('data-rc-active'); root.removeAttribute('data-rc-pulses-ready');
    pulses.forEach(({node,effect}) => {effect.dispose(); node.remove();});
    originals.forEach(([node,id]) => node.id = id); references.forEach(([node,name,value]) => node.setAttribute(name,value));
  }
  function tick(now) {
    raf = 0;
    if (!root.isConnected) {dispose(); return;}
    if (last) time += Math.min((now-last)/1000,.05);
    last = now;
    pulses.forEach(({effect}) => effect.update(time));
    labels.forEach((node,i) => {
      const pose = sampleCreditLabel(time * 1000, i, duration, easing);
      node.style.transform = `translateY(${pose.y / 5.4}cqi) scale(${pose.scale})`;
      // Fade the whole shell only beyond the adjacent slots, clear of the pulse line.
      node.style.opacity = String(Math.abs(pose.y) > 50 ? Math.min(1, pose.opacity / .4) : 1);
      node.style.visibility = pose.opacity === 0 ? "hidden" : "visible";
      node.style.setProperty("--rc-label-ink-opacity", String(pose.opacity));
    });
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (disposed) return;
    cancelAnimationFrame(raf); raf = 0; last = 0;
    const active = visible && !document.hidden && !motion.matches;
    root.toggleAttribute('data-rc-active',active);
    if (motion.matches || (!active && started)) restoreEntrance();
    if (active && !started) {root.setAttribute('data-rc-ready',''); void root.offsetWidth; reveal.ensure(); started = true;}
    if (motion.matches) restoreLabels();
    root.toggleAttribute('data-rc-pulses-ready',!motion.matches);
    pulses.forEach(({effect}) => {if (motion.matches) effect.update(time,true);});
    if (active) raf = requestAnimationFrame(tick);
  }
  try {
    originals.forEach(([node,id,suffix]) => node.id = id + suffix);
    references.forEach(([node,name,value,suffix]) => node.setAttribute(name,value.replace(/url\(#([^)]*)\)/g,(_,id) => `url(#${id}${suffix})`)));
    const period = (source.getTotalLength() + 32) / 48 + duration * 2 / 1000;
    for (let i = 0; i < 2; i++) {
      const node = source.cloneNode(true);
      node.removeAttribute('id'); node.removeAttribute('data-rc-route'); node.setAttribute('data-rc-pulse','');
      source.parentNode.append(node);
      try {pulses.push({node,effect:createSoftPathPulse(node,{span:32,speed:48,color:'#55bbff',period,start:i*period/2})});}
      catch(error) {node.remove(); throw error;}
    }
    observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();},{threshold:0});
    observer.observe(root);
    motion.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
    sync();
  } catch {dispose();}
  return dispose;
}
export const init = typeof window !== 'undefined' && window[key] || stageInitializer('[data-revolving-credit]',setup);
if (typeof window !== 'undefined') {
  window[key] = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>init(),{once:true}); else init();
}
