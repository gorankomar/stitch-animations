import test from 'node:test';
import assert from 'node:assert/strict';
import {init, topUpsSchedule} from '../src/embeds/top-ups.js';
function fixture({missingTokens=false,failObserver=false,reduced=false}={}) {
 const keys=['window','document','getComputedStyle','matchMedia','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
 const saved=keys.map(k=>[k,globalThis[k]]),frames=new Map(),events=new Map(),observers=[];let next=0;
 const node=()=>({dataset:{},style:{transform:'',opacity:''},attrs:new Map(),getAttribute(k){return this.attrs.get(k)??null},setAttribute(k,v){this.attrs.set(k,v)},removeAttribute(k){this.attrs.delete(k)},getBoundingClientRect:()=>({left:0,top:24,right:540,bottom:210,width:540,height:186})});
 const root=node(),frame=node(),layers=[node(),node(),node()],items=Array.from({length:9},node),followers=[node(),node(),node()];
 layers.forEach((e,i)=>e.dataset.tuLayer=i?'hard':'soft');
 root.matches=s=>s==='[data-top-ups]';root.querySelector=s=>s==='.tu-frame'?frame:null;
 root.querySelectorAll=s=>({'[data-tu-layer]':layers,'[data-tu-item]':items,'[data-follow-mouse]':followers})[s]||[];
 const media={matches:reduced,addEventListener(k,fn){events.set('motion',fn)},removeEventListener(){events.delete('motion')}};
 const fine={matches:false,addEventListener(){},removeEventListener(){}};
 globalThis.document={hidden:false,addEventListener(k,fn){events.set(k,fn)},removeEventListener(k){events.delete(k)}};
 globalThis.matchMedia=s=>s.includes('reduce')?media:fine;
 const tokens={'--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--motion-duration-default':'770ms','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
 globalThis.getComputedStyle=()=>({getPropertyValue:k=>missingTokens?'':tokens[k]||''});globalThis.window={getComputedStyle:globalThis.getComputedStyle};
 globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 globalThis.IntersectionObserver=class{constructor(fn){if(failObserver)throw Error('observer unavailable');this.fn=fn;observers.push(this)}observe(){}disconnect(){}};
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 return {root,layers,items,frames,events,observers,media,visible(v=true){observers.at(-1).fn([{isIntersecting:v,intersectionRatio:v?1:0}])},tick(now){const[id,fn]=frames.entries().next().value;frames.delete(id);fn(now)},restore(){for(const[k,v]of saved)v===undefined?delete globalThis[k]:globalThis[k]=v}};
}
test('hard foreground remains opaque; cleanup and duplicate mounts restore the static illustration',()=>{
 const f=fixture();try{const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,2);assert.equal(f.layers[0].style.opacity,'0');assert.equal(f.layers[1].style.opacity,'');assert.match(f.layers[1].style.transform,/translate3d/);f.visible();f.tick(100);dispose();assert.equal(f.frames.size,0);assert.equal(f.events.size,0);for(const e of [...f.layers,...f.items]){assert.equal(e.style.opacity,'');assert.equal(e.style.transform,'')}assert.equal(f.root.getAttribute('data-tu-ready'),null)}finally{f.restore()}
});
test('hidden/offscreen clocks pause; reduced motion restores every layer and item',()=>{
 const f=fixture();try{const dispose=init(f.root);f.visible();f.tick(100);f.visible(false);assert.equal(f.frames.size,0);f.visible();document.hidden=true;f.events.get('visibilitychange')();assert.equal(f.frames.size,0);document.hidden=false;f.media.matches=true;f.events.get('motion')();f.tick(200);for(const e of [...f.layers,...f.items])assert.equal(e.style.transform,'');assert.equal(f.frames.size,0);dispose()}finally{f.restore()}
});
for(const option of ['missingTokens','failObserver'])test(`${option} leaves a visible fallback`,()=>{const f=fixture({[option]:true}),error=console.error;console.error=()=>{};try{const dispose=init(f.root);assert.equal(f.frames.size,0);for(const e of [...f.layers,...f.items])assert.equal(e.style.transform,'');dispose()}finally{console.error=error;f.restore()}});
test('all panel contents start after the panel lands with a slight stagger',()=>{const starts=topUpsSchedule(9,.77);assert.equal(starts[3],1.11);assert.ok(starts[2]<starts[1]+.77);assert.ok(starts.at(-1)+.77<2.5)});
