import './product-variety.css';
import { stageInitializer } from '../lib/effects/animation-stage.js';
import { ensureSectionReveal, releaseSectionReveal } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';

export const init = stageInitializer('[data-product-variety]', root => {
  const reveal = ensureSectionReveal(root);
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let visible = false, disposeFollow;
  root.classList.add('is-motion-ready');
  const sync = () => {
    const active = visible && !document.hidden && fine.matches;
    if (active && !disposeFollow) disposeFollow = createFollowGroup({root});
    if (!active && disposeFollow) { disposeFollow(); disposeFollow = null; }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) reveal?.ensure();
    sync();
  }, {threshold:0});
  observer.observe(root);
  fine.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  return () => {
    observer.disconnect(); disposeFollow?.(); releaseSectionReveal(root);
    fine.removeEventListener('change',sync);
    document.removeEventListener('visibilitychange',sync);
    root.classList.remove('is-motion-ready');
  };
});
if(typeof document!=='undefined') {
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>init(),{once:true});
  else init();
}
