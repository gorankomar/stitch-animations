import {createSendingConfirmation} from '../lib/effects/sending-confirmation.js';
import {createRevealController} from '../lib/effects/reveal-groups.js';
import {stageInitializer} from '../lib/effects/animation-stage.js';

function setup(stage) {
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const selectors=['.es-label','.es-card','.es-check','.es-success','.es-attachments','.es-attachments-title','.es-attachment'];
  const nodes=selectors.flatMap(selector=>[...stage.querySelectorAll(selector)]);
  const check=stage.querySelector('[data-es-check]');
  if(nodes.length!==8||!check)return()=>{};
  let controller,observer,timer,sending,visible=false,started=false,disposed=false;
  const restore=()=>{sending?.dispose();sending=null;clearTimeout(timer);controller?.cancel();stage.removeAttribute('data-es-ready');};
  const onVisibility=()=>{
    if(document.hidden||media.matches){restore();started=false;return;}
    if(!visible||document.hidden||media.matches){return;}
    if(started||disposed)return;
    started=true;
    try {
      const css=getComputedStyle(stage),ease=css.getPropertyValue('--motion-ease-primary').trim();
      const duration=parseFloat(css.getPropertyValue('--motion-duration-default'));
      const stagger=parseFloat(css.getPropertyValue('--reveal-stagger-default'));
      const ratio=parseFloat(css.getPropertyValue('--reveal-opacity-ratio'));
      if(!ease||!Number.isFinite(duration)||!Number.isFinite(stagger)||!Number.isFinite(ratio))return restore();
      nodes.forEach((node,index)=>{node.dataset.revealStagger='0ms';node.dataset.revealDelay=`${stagger*2+(index===0?0:index===1?duration:duration*2+(index-2)*stagger)}ms`;});
      controller=createRevealController({root:stage,selector:'[data-es-reveal]',timings:{duration,stagger,opacityRatio:ratio}});
      stage.setAttribute('data-es-ready','');
      // Commit the hidden enhancement state only after the whole controller is ready.
      void stage.offsetWidth;
      const finished=controller.ensure();
      const title=stage.querySelector('.es-success');
      if(title)sending=createSendingConfirmation({host:check,title,duration,stagger,ease,opacityRatio:ratio,delay:duration*2+stagger*2});
      timer=setTimeout(()=>{
        if(!visible||document.hidden||media.matches)return restore();
        stage.removeAttribute('data-es-ready');
        // The sending-to-check sequence supplies the confirmation motion.
      },finished);
    } catch {restore();}
  };
  const onPreference=()=>{restore();if(!media.matches){started=false;stage.setAttribute('data-es-ready','');onVisibility();}};
  try {
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.7;if(!entry.isIntersecting&&started){restore();started=false;if(!media.matches)stage.setAttribute('data-es-ready','');}onVisibility();},{threshold:[0,.7]});observer.observe(stage);if(!media.matches)stage.setAttribute('data-es-ready','');
    document.addEventListener('visibilitychange',onVisibility);media.addEventListener('change',onPreference);
  } catch {restore();observer?.disconnect();}
  return()=>{disposed=true;restore();observer?.disconnect();media.removeEventListener('change',onPreference);document.removeEventListener('visibilitychange',onVisibility);};
}
// Share the mounting cache across portable draft embeds and module instances.
const key=Symbol.for('stitch.email-statement.init');
export const init=globalThis[key] ||= stageInitializer('[data-email-statement]',setup);
if(typeof document!=='undefined') {if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();}
