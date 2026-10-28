import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window={getComputedStyle:()=>({getPropertyValue:()=> 'cubic-bezier(.11,.61,.27,.99)'})};
const {init}=await import('../src/embeds/collections-graphic.js');
function fixture() {
 const raf=new Map(),listeners=new Map(),observers=[];let serial=0,now=0;
 const media={matches:false,addEventListener(k,f){this.change=f},removeEventListener(){this.change=null}};
 const card=h=>({style:{},getAttribute:()=>null,removeAttribute(){this.style={}},getBoundingClientRect:()=>({height:h})});
 const cards=[card(201),card(244)],stage={dataset:{},querySelectorAll:()=>cards,getAttribute:()=>null,removeAttribute(){delete this.dataset.collectionsState},getBoundingClientRect:()=>({width:258})};
 globalThis.document={documentElement:{},hidden:false,addEventListener(k,f){listeners.set(k,f)},removeEventListener(k){listeners.delete(k)},querySelectorAll:()=>[stage]};
 globalThis.matchMedia=()=>media;
 globalThis.getComputedStyle=()=>({direction:"ltr"});
 globalThis.requestAnimationFrame=f=>{raf.set(++serial,f);return serial};
 globalThis.cancelAnimationFrame=id=>raf.delete(id);
 globalThis.IntersectionObserver=class{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
 globalThis.ResizeObserver=class{observe(){}disconnect(){}};
 const tick=()=>{now+=16;const current=[...raf.values()];raf.clear();current.forEach(f=>f(now))};
 return {stage,cards,media,raf,listeners,observers,tick,visible(value){observers[0].cb([{isIntersecting:value,intersectionRatio:value?1:0}])}};
}
test('Collections pauses offscreen/hidden, shares one mount and restores fallback on reduced motion/disposal',()=>{
 const f=fixture(),stop=init();init();assert.equal(f.observers.length,1);
 assert.deepEqual(f.cards[0].style,{}); // Visible static fallback until the observer starts motion.
 f.visible(true);f.tick();assert.equal(f.cards[0].style.opacity,'0');
 for(let i=0;i<220;i++)f.tick();assert.equal(f.stage.dataset.collectionsState,'returning');
 f.visible(false);assert.equal(f.raf.size,0);const paused=f.cards[0].style.transform;f.tick();assert.equal(f.cards[0].style.transform,paused);
 f.visible(true);document.hidden=true;f.listeners.get('visibilitychange')();assert.equal(f.raf.size,0);
 document.hidden=false;f.listeners.get('visibilitychange')();f.media.matches=true;f.media.change();f.tick();assert.deepEqual(f.cards[0].style,{});
 f.media.matches=false;f.media.change();f.tick();assert.equal(f.stage.dataset.collectionsState,'revealing');
 stop();assert.equal(f.raf.size,0);assert.equal(f.listeners.size,0);assert.deepEqual(f.cards[1].style,{});assert.equal(f.stage.dataset.collectionsState,undefined);
 const again=init();assert.equal(f.observers.length,2);again();
});
test('Collections restores native appearance after a rendering failure',()=>{
 const f=fixture(),stop=init();f.visible(true);f.tick();f.stage.getBoundingClientRect=()=>{throw Error('measurement unavailable')};
 const old=console.error;console.error=()=>{};try{f.tick()}finally{console.error=old}
 assert.deepEqual(f.cards[0].style,{});assert.equal(f.raf.size,0);stop();
});
