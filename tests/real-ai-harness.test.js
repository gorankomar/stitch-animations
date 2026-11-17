import test from 'node:test';
import assert from 'node:assert/strict';
import { init } from '../src/embeds/real-ai-harness.js';

for (const localized of [false, true]) test(`harness localized=${localized}: reveals before sequential statuses, pauses offscreen, replays and restores on cleanup`, () => {
  const keys = ['document','window','matchMedia','IntersectionObserver','ResizeObserver','MutationObserver','requestAnimationFrame','cancelAnimationFrame'];
  const saved = keys.map(key => [key, globalThis[key]]);
  const observers = [], frames = new Map(), events = {};
  let id = 0, now = 100;
  const motion = { matches:false, addEventListener(){}, removeEventListener(){} };
  const node = () => ({ dataset:{}, style:{ transform:'', opacity:'', setProperty(k,v){this[k]=v;}, removeProperty(k){delete this[k];} }, getBoundingClientRect:()=>({left:0,right:100,top:0,bottom:100}) });
  const groups = Array.from({length:4},node), steps = Array.from({length:3},node);
  const pending = localized ? ['بناء','اختبار','نشر'] : ['Build','Test','Publish'];
  const completed = localized ? ['تم البناء','تم الاختبار','تم النشر'] : ['Built','Tested','Published'];
  steps.forEach((step,i)=>{
    step.childNodes=[{nodeType:3,textContent:completed[i]}];
    step.querySelector=()=>({textContent:pending[i]});
  });
  const pane = { classList:{contains:()=>true}, addEventListener:(k,v)=>events[k]=v, removeEventListener(){} };
  const stage = Object.assign(node(), {matches:()=>true,closest:()=>pane,querySelectorAll:s=>s==='[data-harness-reveal]'?groups:s==='.harness-steps > span'?steps:[]});
  globalThis.document={documentElement:{},hidden:false,addEventListener(){},removeEventListener(){}};
  globalThis.window={getComputedStyle:()=>({getPropertyValue:k=>k==='--motion-duration-default'?'100ms':k==='--motion-duration-fast'?'50ms':''})};
  globalThis.matchMedia=()=>motion;
  globalThis.IntersectionObserver=class {constructor(cb){this.cb=cb;observers.push(this);} observe(){} disconnect(){this.disconnected=true;} };
  globalThis.ResizeObserver=class {observe(){} disconnect(){} };
  globalThis.MutationObserver=class {observe(){} disconnect(){} };
  globalThis.requestAnimationFrame=cb=>{frames.set(++id,cb);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  const tick=()=>{const pending=[...frames.values()];frames.clear();now+=25;pending.forEach(cb=>cb(now));};
  const labels=()=>steps.map(s=>s.childNodes[0].textContent);
  try {
    const dispose=init(stage); init(stage);
    assert.equal(observers.length,1);
    assert.deepEqual(labels(),pending);
    groups.forEach(group => assert.match(group.style.transform, /translate3d\(50px,0px,0\)/));
    observers[0].cb([{isIntersecting:true,intersectionRatio:1}]);
    for(let i=0;i<6;i++)tick();
    assert.equal(steps[0].dataset.harnessState,'working');
    assert.ok(parseFloat(steps[0].style['--harness-angle'])<0);
    observers[0].cb([{isIntersecting:false,intersectionRatio:0}]);tick();
    const paused=labels();for(let i=0;i<20;i++)tick();assert.deepEqual(labels(),paused);
    observers[0].cb([{isIntersecting:true,intersectionRatio:1}]);
    for(let i=0;i<5;i++)tick();
    assert.deepEqual(labels(),[completed[0],pending[1],pending[2]]);
    for(let i=0;i<30;i++)tick();
    assert.deepEqual(labels(),completed);
    assert.ok(observers[0].disconnected);
    events['stitch:tab-enter']({detail:{direction:'left-to-right'}});
    assert.deepEqual(labels(),pending);
    dispose();assert.deepEqual(labels(),completed);assert.equal(frames.size,0);
    motion.matches=true;const reducedDispose=init(stage);assert.deepEqual(labels(),completed);reducedDispose();
  } finally {for(const [key,value] of saved)value===undefined?delete globalThis[key]:globalThis[key]=value;}
});
