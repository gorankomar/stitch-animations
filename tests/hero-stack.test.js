import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeroStackController } from '../src/lib/effects/hero-stack.js';

function fixture(reduce = false) {
  const timers = new Map(); let next=0;
  const motion = {matches:reduce,addEventListener(_event,fn){this.fn=fn;},removeEventListener(){this.fn=null;}};
  const width = {matches:false,addEventListener(_event,fn){this.fn=fn;},removeEventListener(){this.fn=null;}};
  const win = {matchMedia:q=>q.includes('reduced')?motion:width,setTimeout(fn,ms){timers.set(++next,{fn,ms});return next;},clearTimeout:id=>timers.delete(id)};
  const node=()=>({dataset:{},styles:new Map(),classes:new Set(),style:{setProperty(k,v){this.owner.styles.set(k,v);},removeProperty(k){this.owner.styles.delete(k);}},classList:{add(...c){c.forEach(v=>this.owner.classes.add(v));},remove(...c){c.forEach(v=>this.owner.classes.delete(v));}}});
  const bind=n=>{n.style.owner=n;n.classList.owner=n;return n;};
  const positions=Array.from({length:3},()=>bind(node()));
  const cards=Array.from({length:3},()=>bind(node()));
  const wrap=bind(node());wrap.querySelectorAll=s=>s.includes('_position')?positions:cards;
  const section={dataset:{},querySelectorAll:()=>[wrap]};
  let ensures=0,cancels=0;
  const reveal={ensure(){ensures++;return 1170;},cancel(){cancels++;}};
  return {win,motion,width,timers,positions,cards,wrap,section,reveal,get ensures(){return ensures;},get cancels(){return cancels;}};
}

function withWindow(f,fn){const old=globalThis.window;globalThis.window=f.win;try{fn();}finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;}}

test('hero enhancement waits for Reveal completion; cleanup leaves CSS fallback and clears timers/listeners',()=>{
  const f=fixture();withWindow(f,()=>{
    const dispose=createHeroStackController(f.section,f.reveal);
    assert.equal(f.ensures,1);assert.deepEqual([...f.timers.values()].map(t=>t.ms),[1220]);
    assert.ok(f.wrap.classes.has('is-inview'));assert.ok(!f.wrap.classes.has('is-ready'));
    assert.deepEqual(f.positions.map(p=>p.styles.get('--stack-position')),['relative','absolute','absolute']);
    f.width.matches=true;f.width.fn();assert.equal(f.positions[0].styles.get('--stack-y'),'38%');
    for(const t of f.timers.values())t.fn();assert.ok(f.wrap.classes.has('is-ready'));
    dispose();assert.equal(f.timers.size,0);assert.equal(f.wrap.classes.size,0);assert.equal(f.width.fn,null);assert.equal(f.motion.fn,null);
    assert.ok(f.positions.every(p=>p.styles.size===0));
  });
});

test('reduced motion and expired early startup keep static content with no hover readiness or replay',()=>{
  for(const mode of ['reduced','expired']){
    const f=fixture(mode==='reduced');if(mode==='expired')f.section.dataset.revealEarlyState='expired';
    withWindow(f,()=>{const dispose=createHeroStackController(f.section,f.reveal);assert.equal(f.ensures,0);assert.equal(f.timers.size,0);assert.equal(f.wrap.classes.size,0);dispose();});
  }
});

test('changing to reduced motion cancels pending hover activation and entrance',()=>{
  const f=fixture();withWindow(f,()=>{const dispose=createHeroStackController(f.section,f.reveal);f.motion.matches=true;f.motion.fn();assert.equal(f.timers.size,0);assert.equal(f.wrap.classes.size,0);assert.equal(f.cancels,1);dispose();});
});

test('two hero instances own independent readiness and cleanup',()=>{
  const a=fixture(),b=fixture();withWindow(a,()=>{
    const da=createHeroStackController(a.section,a.reveal);
    // Share browser timers/media but keep separate component DOM.
    const db=createHeroStackController(b.section,b.reveal);
    da();assert.ok(b.wrap.classes.has('is-inview'));assert.equal(a.wrap.classes.size,0);db();
  });
});
