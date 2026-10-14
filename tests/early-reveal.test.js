import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { installEarlyReveal, earlyRevealHead } from '../src/lib/effects/early-reveal.js';
import { createRevealController } from '../src/lib/effects/reveal-groups.js';

function fixture(reduced = false) {
  let now = 0, next = 0, onChange;
  const timers = new Map(), htmlAttrs = new Map();
  const makeRoot = () => {
    const classes = new Set();
    const row = { nodeType:1, childNodes:[], dataset:{}, style:{setProperty(){}},
      matches:s=>s==='[data-reveal]', classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}, classes };
    return { dataset:{revealStart:'early'}, childNodes:[row], querySelectorAll:()=>[row], row };
  };
  const roots = [makeRoot(),makeRoot()];
  const media = { matches:reduced, addEventListener(_event, fn){onChange=fn;} };
  const win = { matchMedia:()=>media, performance:{now:()=>now},
    setTimeout(fn, delay){timers.set(++next,{fn,at:now+delay});return next;}, clearTimeout:id=>timers.delete(id) };
  const doc = {documentElement:{setAttribute:(k,v)=>htmlAttrs.set(k,v),removeAttribute:k=>htmlAttrs.delete(k)},
    head:{appendChild(){}},createElement:()=>({}),querySelectorAll:()=>roots};
  const tick = ms => {
    const end = now+ms;
    while(true){const due=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;now=due[1].at;timers.delete(due[0]);due[1].fn();}
    now=end;
  };
  return {win,doc,roots,timers,htmlAttrs,media,tick,reduce(){media.matches=true;onChange();}};
}

test('serialized HEAD bootstrap runs without imports and is idempotent',()=>{
  const f=fixture(); const code=earlyRevealHead().match(/<script>([\s\S]*)<\/script>/)[1];
  vm.runInNewContext(code,{window:f.win,document:f.doc});
  const api=f.win.__stitchEarlyReveal;
  assert.equal(installEarlyReveal(f.win,f.doc),api);
  assert.equal(f.htmlAttrs.get('data-stitch-reveal-early'),'pending');
});

test('two early sections claim independently; missing runtime expires and cannot animate late',()=>{
  const f=fixture(),api=installEarlyReveal(f.win,f.doc);
  assert.equal(api.claim(f.roots[0]),true);api.scheduled(f.roots[0],2300);
  f.tick(1800);
  assert.equal(f.roots[0].dataset.revealEarlyState,'running');
  assert.equal(f.roots[1].dataset.revealEarlyState,'expired');
  assert.equal(api.claim(f.roots[1]),false);
  f.tick(500);assert.equal(f.roots[0].dataset.revealEarlyState,'complete');
});

test('reduced motion never arms, and changing preference releases an active entrance',()=>{
  const off=fixture(true);installEarlyReveal(off.win,off.doc);
  assert.equal(off.htmlAttrs.size,0);assert.equal(off.win.__stitchEarlyReveal.claim(off.roots[0]),false);
  const f=fixture(),api=installEarlyReveal(f.win,f.doc);api.claim(f.roots[0]);f.reduce();
  assert.equal(f.roots[0].dataset.revealEarlyState,'expired');assert.equal(f.htmlAttrs.size,0);
});

test('a stalled claimed runtime has a bounded fallback',()=>{
  const f=fixture(),api=installEarlyReveal(f.win,f.doc);api.claim(f.roots[0]);
  f.roots[0].row.classList.add('is-reveal-ready');f.tick(8000);
  assert.equal(f.roots[0].dataset.revealEarlyState,'expired');
  assert.equal(f.roots[0].row.classes.has('is-reveal-ready'),false);
});

test('controller skips late/missing bootstrap; successful takeover preserves existing timings and cleanup',()=>{
  const saved=globalThis.window;
  try {
    for(const expired of [false,true]) {
      const f=fixture();globalThis.window=f.win;
      installEarlyReveal(f.win,f.doc);if(expired)f.tick(1800);
      const c=createRevealController({root:f.roots[0],timings:{duration:770,stagger:200,opacityRatio:.34}});
      assert.equal(c.ensure(),expired?0:770);
      if(!expired){assert.ok(f.roots[0].row.classes.has('is-reveal-ready'));f.tick(770);assert.ok(f.roots[0].row.classes.has('is-reveal'));}
      else assert.equal(f.roots[0].row.classes.size,0);
      c.cancel();assert.equal(f.roots[0].row.classes.size,0);
    }
    const f=fixture();globalThis.window=f.win;
    const c=createRevealController({root:f.roots[0],timings:{duration:770,stagger:200,opacityRatio:.34}});
    assert.equal(c.ensure(),0);assert.equal(f.roots[0].row.classes.size,0);
  } finally {if(saved===undefined)delete globalThis.window;else globalThis.window=saved;}
});
