import test from 'node:test';
import assert from 'node:assert/strict';
const frames=new Map(), observers=[];let next=0;
const rect={left:0,top:0,right:526,bottom:278,width:526,height:278};
function node(){return {dataset:{},style:{transform:'',opacity:'',willChange:'',removeProperty(k){this[k]='';}},textContent:'',getBoundingClientRect:()=>rect,getAttribute:()=>null,setAttribute(){},removeAttribute(){},querySelectorAll:()=>[]};}
const media={matches:false,addEventListener(){},removeEventListener(){}};
globalThis.window={getComputedStyle:()=>({getPropertyValue:k=>k==='--motion-duration-default'?'770ms':'cubic-bezier(.11,.61,.27,.99)'})};
globalThis.getComputedStyle=window.getComputedStyle;
globalThis.document={documentElement:{},readyState:'loading',hidden:false,addEventListener(){},removeEventListener(){}};
globalThis.matchMedia=s=>s.includes('reduce')?media:{matches:false,addEventListener(){},removeEventListener(){}};
globalThis.IntersectionObserver=class {constructor(fn,opts){this.fn=fn;this.threshold=opts.threshold;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
globalThis.ResizeObserver=class {observe(){}disconnect(){}};
globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
const {init}=await import('../src/embeds/dynamic-funding.js');
function fixture(){frames.clear();observers.length=0;media.matches=false;const root=node(),frame=node(),reveals=[node(),node(),node()],amounts=[node(),node()];amounts.forEach((n,i)=>{n.dataset.dfValue=i?'400.23':'2400.23';n.textContent=i?'$400.23':'$2,400.23';});root.matches=s=>s==='[data-dynamic-funding]';root.querySelector=()=>frame;root.querySelectorAll=s=>s==='[data-df-reveal]'?reveals:s==='[data-df-value]'?amounts:[];return {root,reveals,amounts,visible(r){observers.forEach(o=>o.fn([{isIntersecting:r>0,intersectionRatio:r}]));},tick(now){const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now);}};}
test('40% viewport gate pauses the entrance clock and counters; duplicate mount is inert',()=>{
 const f=fixture(),dispose=init(f.root);init(f.root);assert.equal(observers.length,2);assert.ok(observers.every(o=>o.threshold===.4));
 f.visible(.39);assert.equal(frames.size,0);f.visible(.4);f.tick(100);for(let t=150;t<=600;t+=50)f.tick(t);
 assert.notEqual(f.reveals[0].style.transform,f.reveals[1].style.transform);assert.notEqual(f.amounts[0].textContent,'$0.00');assert.notEqual(f.amounts[0].textContent,'$2,400.23');
 f.visible(.1);assert.equal(frames.size,0);const saved=f.amounts.map(n=>n.textContent);assert.deepEqual(f.amounts.map(n=>n.textContent),saved);
 f.visible(.8);for(let t=1000;t<=2400;t+=50)f.tick(t);assert.deepEqual(f.amounts.map(n=>n.textContent),['$2,400.23','$400.23']);assert.ok(f.reveals.every(n=>n.style.transform===''));
 dispose();assert.ok(observers.every(o=>o.disconnected));assert.equal(frames.size,0);assert.deepEqual(f.amounts.map(n=>n.textContent),['$2,400.23','$400.23']);
});
test('reduced motion reveals every element and full cent-accurate values',()=>{
 const f=fixture();media.matches=true;const dispose=init(f.root);f.visible(1);f.tick(100);assert.ok(f.reveals.every(n=>n.style.transform===''));assert.deepEqual(f.amounts.map(n=>n.textContent),['$2,400.23','$400.23']);assert.equal(frames.size,0);dispose();
});
test('observer setup failure restores complete static fallback',()=>{
 const f=fixture(),Observer=globalThis.IntersectionObserver,log=console.error;globalThis.IntersectionObserver=class {constructor(){throw Error('test setup failure');}};console.error=()=>{};
 try{init(f.root);assert.ok(f.reveals.every(n=>n.style.transform===''));assert.deepEqual(f.amounts.map(n=>n.textContent),['$2,400.23','$400.23']);}finally{globalThis.IntersectionObserver=Observer;console.error=log;}
});
