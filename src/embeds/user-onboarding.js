import { stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealController } from '../lib/effects/reveal-groups.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { getDefaultDurationMs, getPrimaryEase } from '../lib/easing.js';

// Stable registry lets portable drafts and the shared entry coexist without double mounting.
const key = Symbol.for('stitch.user-onboarding.init');
function setup(root) {
  const back = root.querySelector('[data-uo-box="background"]');
  const front = root.querySelector('[data-uo-box="foreground"]');
  const follower = root.querySelector('[data-follow-mouse]');
  if (!back || !front || !follower) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const duration = getDefaultDurationMs();
  const ease = getPrimaryEase();
  const styles = getComputedStyle(root);
  const stagger = parseFloat(styles.getPropertyValue('--reveal-stagger-default')) || 200;
  const ratio = parseFloat(styles.getPropertyValue('--reveal-opacity-ratio')) || .34;
  const reveal = createRevealController({root, selector:'[data-uo-row]', groupSelector:'[data-uo-group]', timings:{duration,stagger,opacityRatio:ratio}});
  const nodes = [...root.querySelectorAll('[data-uo-row]')];
  const saved = nodes.map(n => n.getAttribute('style'));
  let visible = false, started = false, follow, animations = [], disposed = false;
  const reset = () => {
    root.removeAttribute('data-uo-ready');
    animations.forEach(a => a.cancel()); animations = [];
    reveal.cancel();
    nodes.forEach((n,i) => saved[i] === null ? n.removeAttribute('style') : n.setAttribute('style',saved[i]));
    follow?.(); follow = null;
  };
  const enter = () => {
    if (started || motion.matches) return;
    const width = root.getBoundingClientRect().width;
    const frontOffset = root.querySelector('.uo-frame').getBoundingClientRect().bottom - root.querySelector('.uo-card-position').getBoundingClientRect().top + width/540;
    try {
      animations = [
        back.animate([{transform:`translateY(${width * 12/540}px)`},{transform:'translateY(0)'}],{duration,easing:ease,fill:'both'}),
        back.animate([{opacity:0},{opacity:1}],{duration:duration*ratio,easing:'linear',fill:'both'}),
        front.animate([{transform:`translateY(${frontOffset}px)`},{transform:'translateY(0)'}],{duration,easing:ease,fill:'both'})
      ];
      root.setAttribute('data-uo-ready','');
      // Foreground never receives an opacity animation.
      reveal.ensure(); started = true;
    } catch { reset(); started = true; }
  };
  const sync = () => {
    if (disposed) return;
    const active = visible && !document.hidden && !motion.matches;
    if (motion.matches) { reset(); started = true; syncLoading(); return; }
    if (active) enter();
    animations.forEach(a => active ? a.play() : a.pause());
    if (active && fine.matches && !follow) {
      follower.dataset.maxOffset = String(root.getBoundingClientRect().width * 4/540);
      follow = createFollowGroup({root});
    }
    if ((!active || !fine.matches) && follow) { follow(); follow=null; }
    syncLoading();
  };
  let observer,resize;
  try {
    observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;sync();},{threshold:0});
    observer.observe(root);
    resize = new ResizeObserver(() => {if(follow){follow();follow=null;}sync();});resize.observe(root);
    motion.addEventListener('change',sync);fine.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  } catch { observer?.disconnect();resize?.disconnect();reset();return; }
  // A perpetual sweep changes only the skeleton's gradient position, never its content.
  const lines = [...root.querySelectorAll('.uo-line')];
  let loading = [];
  const syncLoading = () => {
    const active = visible && !document.hidden && !motion.matches;
    if (active && !loading.length) {
      loading = lines.map((n,i) => n.animate([
        {backgroundPosition:'140% 0'},{backgroundPosition:'-140% 0'}
      ],{duration:duration*3,delay:i*stagger/3,iterations:Infinity,easing:'linear'}));
    }
    loading.forEach(a => active ? a.play() : a.pause());
    if(motion.matches){loading.forEach(a=>a.cancel());loading=[];}
  };
  motion.addEventListener('change',syncLoading);document.addEventListener('visibilitychange',syncLoading);
  return () => {
    disposed=true;observer.disconnect();resize.disconnect();
    motion.removeEventListener('change',sync);fine.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);
    motion.removeEventListener('change',syncLoading);document.removeEventListener('visibilitychange',syncLoading);
    loading.forEach(a=>a.cancel());reset();
  };
}
export const init = typeof window !== 'undefined' && window[key] || stageInitializer('[data-user-onboarding]',setup);
if(typeof window!=='undefined') {
  window[key]=init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
}
