import test from 'node:test';
import assert from 'node:assert/strict';
import { schemesState, SCHEMES_PERIOD, init } from '../src/embeds/new-schemes.js';
const locations={entry:{x:475,y:225},outside:{x:510,y:252},afrigo:{x:316,y:153},mada:{x:73,y:130},exit:{x:28,y:270},hidden:{x:64,y:235}};
test('cursor checks AfriGo then Mada, waits hidden, and reverses those selections',()=>{
  for(const [t,afrigo,mada] of [[0,false,false],[2.09,true,false],[3.54,true,true],[6,true,true],[9.09,false,true],[10.54,false,false],[13,false,false]]){
    const s=schemesState(t,locations);assert.equal(s.afrigo,afrigo);assert.equal(s.mada,mada);
  }
  for(const t of [5,5.5,6,6.5,7,12,12.5,13,13.5]){const s=schemesState(t,locations);assert.equal(s.opacity,0);assert.equal(s.behind,true);}
  assert.deepEqual(schemesState(0,locations),schemesState(SCHEMES_PERIOD,locations));
  for(const t of [2.08,3.53,9.08,10.53])assert.equal(schemesState(t,locations).pressed,true);
});
test('cursor uses moving targets rather than fixed illustration coordinates',()=>{
 const original=schemesState(2.08,locations);
 const moved=schemesState(2.08,{...locations,afrigo:{x:300,y:140}});
 assert.equal(original.x,316);assert.equal(moved.x,300);assert.equal(moved.y,140);
});
function fixture({reduced=false,failObserver=false}={}){
 const keys=['window','document','getComputedStyle','matchMedia','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
 const saved=keys.map(k=>[k,globalThis[k]]),frames=new Map(),events=new Map(),docEvents=new Map(),observers=[],resizers=[];let id=0,width=540;
 const node=()=>({dataset:{},attrs:new Map(),style:{cssText:'',transform:'',opacity:''},classList:{set:new Set(),contains(k){return this.set.has(k)},toggle(k,on){on?this.set.add(k):this.set.delete(k)}},getBoundingClientRect(){return {left:0,top:0,right:width,bottom:278,width,height:278}},toggleAttribute(k,on){on?this.attrs.set(k,''):this.attrs.delete(k)},removeAttribute(k){this.attrs.delete(k)}});
 const root=node(),frame=node(),pointer=node();pointer.firstElementChild=node();const panels=[node(),node()],checks=[node(),node()];checks.forEach(n=>n.classList.set.add('ns-checked'));
 const targets=[node(),node(),node()];targets.forEach((n,i)=>n.dataset.nsReveal=String(i*.2));
 root.matches=s=>s==='[data-new-schemes]';root.querySelectorAll=s=>s==='[data-ns-panel]'?panels:s==='[data-ns-reveal]'?targets:[];
 root.querySelector=s=>s==='.ns-frame'?frame:s==='.ns-cursor'?pointer:s.includes('afrigo')?checks[0]:s.includes('mada')?checks[1]:null;
 const tokens={'--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--motion-duration-default':'770ms','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
 globalThis.getComputedStyle=()=>({getPropertyValue:k=>tokens[k]||''});globalThis.window={getComputedStyle};globalThis.document={documentElement:{},hidden:false,addEventListener(k,f){docEvents.set(k,f)},removeEventListener(k){docEvents.delete(k)}};
 const media={matches:reduced,addEventListener(k,f){events.set(k,f)},removeEventListener(k){events.delete(k)}};globalThis.matchMedia=()=>media;
 globalThis.IntersectionObserver=class{constructor(fn){if(failObserver)throw Error('Unavailable');this.fn=fn;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
 globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;resizers.push(fn)}observe(){}disconnect(){}};
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 return {root,targets,checks,pointer,frames,events,docEvents,media,observers,visible(on=true){observers[0].fn([{isIntersecting:on,intersectionRatio:on?1:0}])},tick(now){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now))},resize(){width=270;resizers.forEach(fn=>fn())},restore(){for(const[k,v]of saved)v===undefined?delete globalThis[k]:globalThis[k]=v}};
}
test('one clock per instance, visibility pause and cleanup restore the supplied checked fallback',()=>{
 const f=fixture();try{const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,1);f.visible();f.tick(100);assert.equal(f.frames.size,1);assert.equal(f.targets[0].style.opacity,'0');f.visible(false);assert.equal(f.frames.size,0);f.visible();document.hidden=true;f.docEvents.get('visibilitychange')();assert.equal(f.frames.size,0);dispose();assert.equal(f.frames.size,0);assert.equal(f.events.size,0);assert.equal(f.docEvents.size,0);assert.equal('nsReady'in f.root.dataset,false);assert.ok(f.checks.every(n=>n.classList.contains('ns-checked')));assert.ok(f.targets.every(n=>n.style.opacity===''&&n.style.transform===''));const again=init(f.root);assert.equal(f.observers.length,2);again();}finally{f.restore()}
});
test('reduced motion keeps the native checked design visible with no loop',()=>{
 const f=fixture({reduced:true});try{const dispose=init(f.root);f.visible();f.tick(100);assert.equal(f.frames.size,0);assert.equal(f.pointer.style.opacity,'0');assert.ok(f.checks.every(n=>n.classList.contains('ns-checked')));assert.ok(f.targets.every(n=>n.style.opacity===''&&n.style.transform===''));dispose();}finally{f.restore()}
});
test('failed motion setup leaves the complete static illustration intact',()=>{
 const f=fixture({failObserver:true}),warn=console.warn;console.warn=()=>{};try{init(f.root)();assert.equal('nsReady'in f.root.dataset,false);assert.ok(f.checks.every(n=>n.classList.contains('ns-checked')));assert.ok(f.targets.every(n=>n.style.opacity===''&&n.style.transform===''));assert.equal(f.frames.size,0);}finally{console.warn=warn;f.restore()}
});

test('resize scales the in-progress soft reveal with the parent width',()=>{
 const f=fixture();try{const dispose=init(f.root);f.visible();f.tick(100);assert.match(f.targets[0].style.transform,/,12px,/);f.resize();f.tick(100);assert.match(f.targets[0].style.transform,/,6px,/);dispose();}finally{f.restore()}
});
