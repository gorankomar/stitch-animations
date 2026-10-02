import test from 'node:test';
import assert from 'node:assert/strict';
import {init} from '../src/embeds/buy-now-pay-later.js';

function fixture({reduced=false,failObserver=false,failPulse=false}={}) {
 const keys=['window','document','matchMedia','getComputedStyle','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
 const saved=keys.map(k=>[k,globalThis[k]]);
 const timers=new Map(),frames=new Map(),events=new Map();let next=0;
 const node=()=>({nodeType:1,childNodes:[],dataset:{},attrs:new Map(),style:{setProperty(){}},classList:{add(){},remove(){}},
  getAttribute(k){return this.attrs.get(k)??null;},setAttribute(k,v){this.attrs.set(k,v);},removeAttribute(k){this.attrs.delete(k);},
  toggleAttribute(k,v){v?this.setAttribute(k,''):this.removeAttribute(k);},matches(s){return s==='[data-bnpl-reveal]';}});
 const rows=Array.from({length:6},node);rows[0].setAttribute('style','color: red');
 const root=node(),svg=node(),follower=node();root.childNodes=rows;root.isConnected=true;root.offsetWidth=540;
 root.matches=s=>s==='[data-buy-now-pay-later]';root.querySelector=s=>s==='.bnpl-line-svg'?svg:follower;
 root.querySelectorAll=s=>s==='[data-bnpl-reveal]'?rows:[];
 const generated=[];
 const source=()=>{const n=node();n.getTotalLength=()=>{if(failPulse)throw Error('missing geometry');return 140;};n.parentNode={append(n){generated.push(n);}};n.remove=()=>generated.splice(generated.indexOf(n),1);n.cloneNode=()=>{const c=source();c.style={};return c;};return n;};
 svg.querySelectorAll=s=>s==='[data-bnpl-line]'?Array.from({length:10},source):[];
 const media={matches:reduced,addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};
 const fine={matches:false,addEventListener(){},removeEventListener(){}};
 const docEvents=new Map();globalThis.document={documentElement:{},hidden:false,addEventListener(k,fn){docEvents.set(k,fn);},removeEventListener(k){docEvents.delete(k);}};
 const values={'--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--motion-duration-default':'770ms','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
 globalThis.getComputedStyle=()=>({getPropertyValue:k=>values[k]||''});
 globalThis.window={getComputedStyle:globalThis.getComputedStyle,setTimeout(fn){timers.set(++next,fn);return next;},clearTimeout(id){timers.delete(id);}};
 globalThis.matchMedia=s=>s.includes('reduce')?media:fine;
 const observers=[];globalThis.IntersectionObserver=class {constructor(fn){if(failObserver)throw Error('unavailable');this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 globalThis.ResizeObserver=class {observe(){}disconnect(){}};
 globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 return {root,rows,timers,frames,events,media,docEvents,generated,observers,
 visible(value=true){observers[0].fn([{isIntersecting:value}]);},
 restore(){for(const [k,v] of saved)v===undefined?delete globalThis[k]:globalThis[k]=v;}};
}
test('one mount owns six reveals and pulses; teardown restores styled fallback',()=>{
 const f=fixture();try{const d=init(f.root);init(f.root);assert.equal(f.observers.length,1);assert.equal(f.generated.length,6);f.visible();assert.equal(f.timers.size,6);assert.ok(f.root.attrs.has('data-bnpl-ready'));d();assert.equal(f.generated.length,0);assert.equal(f.timers.size,0);assert.equal(f.frames.size,0);assert.equal(f.docEvents.size,0);assert.equal(f.rows[0].getAttribute('style'),'color: red');assert.ok(!f.root.attrs.has('data-bnpl-ready'));const again=init(f.root);assert.equal(f.observers.length,2);again();}finally{f.restore();}
});
test('reduced motion restores original layers and cancels pending entrance and clocks',()=>{
 const f=fixture();try{const d=init(f.root);f.visible();f.media.matches=true;f.events.get('change')();assert.equal(f.timers.size,0);assert.equal(f.frames.size,0);assert.ok(!f.root.attrs.has('data-bnpl-ready'));assert.ok(!f.root.attrs.has('data-bnpl-pulses-ready'));d();}finally{f.restore();}
});
test('offscreen and hidden tabs stop clocks and leave every row visible',()=>{
 const f=fixture();try{const d=init(f.root);f.visible();f.visible(false);assert.equal(f.frames.size,0);assert.equal(f.timers.size,0);assert.ok(!f.root.attrs.has('data-bnpl-ready'));f.visible();assert.equal(f.frames.size,1);document.hidden=true;f.docEvents.get('visibilitychange')();assert.equal(f.frames.size,0);d();}finally{f.restore();}
});
for(const option of ['failObserver','failPulse'])test(`${option} restores fallback and removes partial setup`,()=>{
 const f=fixture({[option]:true});try{const d=init(f.root);assert.equal(f.generated.length,0);assert.equal(f.timers.size,0);assert.equal(f.frames.size,0);assert.ok(!f.root.attrs.has('data-bnpl-ready'));d();}finally{f.restore();}
});
