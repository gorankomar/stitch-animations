import test from 'node:test';
import assert from 'node:assert/strict';
import {init} from '../src/embeds/credit-check.js';

function fixture({reduced=false,failObserver=false,tokens=true}={}) {
  const globals=['window','document','matchMedia','getComputedStyle','CSS','IntersectionObserver'];
  const saved=globals.map(k=>[k,globalThis[k]]);
  const timers=new Map(); let next=0;
  const node=()=>({nodeType:1,childNodes:[],dataset:{},attrs:new Map(),classes:new Set(),
    matches(s){return s==='[data-cc-reveal]';},
    getAttribute(k){return this.attrs.get(k)??null;},setAttribute(k,v){this.attrs.set(k,v);},removeAttribute(k){this.attrs.delete(k);},
    style:{setProperty(){}},classList:{add(){},remove(){}}});
  const children=[node(),node()];
  const root=node();root.childNodes=children;root.matches=s=>s==='[data-credit-check]';
  root.querySelectorAll=s=>s==='[data-credit-check]'?[]:children;
  const events=new Map();const media={matches:reduced,addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};
  const documentEvents=new Map();
  globalThis.document={documentElement:{},hidden:false,addEventListener(k,fn){documentEvents.set(k,fn);},removeEventListener(k){documentEvents.delete(k);}};
  const values={'--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--motion-duration-default':'770ms','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
  globalThis.getComputedStyle=()=>({getPropertyValue:k=>tokens?values[k]||'':''});
  globalThis.window={getComputedStyle:globalThis.getComputedStyle,setTimeout(fn){timers.set(++next,fn);return next;},clearTimeout(id){timers.delete(id);}};
  globalThis.matchMedia=()=>media;globalThis.CSS={supports:()=>true};
  const observers=[];
  globalThis.IntersectionObserver=class {constructor(fn){if(failObserver)throw Error('unavailable');this.fn=fn;this.disconnected=false;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
  return {root,children,timers,media,events,documentEvents,observers,
    visible(){observers[0].fn([{isIntersecting:true}]);},
    restore(){for(const [k,v] of saved)if(v===undefined)delete globalThis[k];else globalThis[k]=v;}};
}

test('duplicate mounting has one observer and disposal restores the static graphic',()=>{
  const f=fixture();try {
    const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,1);
    f.visible();assert.ok(f.root.attrs.has('data-cc-ready'));assert.equal(f.timers.size,2);
    dispose();assert.ok(!f.root.attrs.has('data-cc-ready'));assert.equal(f.timers.size,0);
    assert.ok(f.observers[0].disconnected);assert.equal(f.documentEvents.size,0);
    const again=init(f.root);assert.equal(f.observers.length,2);again();
  }finally{f.restore();}
});
test('reduced motion restores visible fallback and cancels pending reveals',()=>{
  const f=fixture();try{const dispose=init(f.root);f.visible();f.media.matches=true;f.events.get('change')();assert.equal(f.timers.size,0);assert.ok(!f.root.attrs.has('data-cc-ready'));dispose();}finally{f.restore();}
});
test('hidden tabs cancel pending reveals without leaving entrance hiding active',()=>{
  const f=fixture();try{const dispose=init(f.root);f.visible();document.hidden=true;f.documentEvents.get('visibilitychange')();assert.equal(f.timers.size,0);assert.ok(!f.root.attrs.has('data-cc-ready'));dispose();}finally{f.restore();}
});
test('failed observer setup preserves the original static state',()=>{
  const f=fixture({failObserver:true});try{const dispose=init(f.root);assert.ok(!f.root.attrs.has('data-cc-ready'));assert.equal(f.timers.size,0);dispose();}finally{f.restore();}
});
test('missing motion tokens keep the graphic visible without initializing hiding',()=>{
  const f=fixture({tokens:false});try{const dispose=init(f.root);assert.ok(!f.root.attrs.has('data-cc-ready'));assert.equal(f.observers.length,0);dispose();}finally{f.restore();}
});
