import test from 'node:test';
import assert from 'node:assert/strict';
const frames=new Map(),observers=[],listeners=new Map();let next=0,failObserver=false;
const rect={left:0,top:0,right:540,bottom:395,width:540,height:395};
const media={matches:false,addEventListener(k,fn){listeners.set('media',fn);},removeEventListener(){}};
globalThis.window={getComputedStyle:()=>({getPropertyValue:k=>k==='--motion-duration-default'?'770ms':'cubic-bezier(.11,.61,.27,.99)'})};
globalThis.getComputedStyle=window.getComputedStyle;
globalThis.document={documentElement:{},readyState:'loading',hidden:false,addEventListener(k,fn){listeners.set(k,fn);},removeEventListener(){}};
globalThis.matchMedia=()=>media;
globalThis.IntersectionObserver=class{constructor(fn){if(failObserver)throw Error('setup');this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
const {init}=await import('../src/embeds/workflow-flexibility.js');
function node(){return {dataset:{},style:{transform:'',opacity:''},getBoundingClientRect:()=>rect,getAttribute:()=>null,removeAttribute(){this.style={transform:'',opacity:''};},setAttribute(){},querySelectorAll:()=>[]};}
function fixture(){frames.clear();observers.length=0;media.matches=false;document.hidden=false;const root=node(),frame=node(),windows=Array.from({length:5},()=>node()),labels=windows.map(()=>node()),icons=windows.map(()=>node());windows.forEach((n,i)=>n.querySelector=()=>labels[i]);labels.forEach((n,i)=>n.querySelector=()=>icons[i]);root.matches=()=>true;root.querySelector=()=>frame;root.querySelectorAll=()=>windows;return {root,windows,labels,icons,visible(v){observers[0].fn([{isIntersecting:v,intersectionRatio:v?1:0}]);},tick(now){const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now);}};}
test('duplicate mount, offscreen and hidden pause, resize, reduced motion and teardown',()=>{
 const f=fixture(),dispose=init(f.root);init(f.root);assert.equal(observers.length,1);
 f.visible(true);for(let t=100;t<6000;t+=50)f.tick(t);
 assert.ok(f.windows.some(n=>n.style.width));
 f.visible(false);assert.equal(frames.size,0);f.visible(true);
 document.hidden=true;listeners.get('visibilitychange')();assert.equal(frames.size,0);
 document.hidden=false;listeners.get('visibilitychange')();assert.equal(frames.size,1);
 media.matches=true;listeners.get('media')();f.tick(6100);assert.equal(frames.size,0);
 assert.ok([...f.windows,...f.labels,...f.icons].every(n=>n.style.width===undefined));
 dispose();assert.ok(observers[0].disconnected);assert.equal(frames.size,0);
});
test('partial setup failure leaves the complete static fallback',()=>{
 const f=fixture(),log=console.error;failObserver=true;console.error=()=>{};
 try{init(f.root);assert.ok(f.windows.every(n=>n.style.transform===''));assert.equal(frames.size,0);}finally{failObserver=false;console.error=log;}
});
