import test from 'node:test';
import assert from 'node:assert/strict';
import { issuerPulseSchedule } from '../src/embeds/issuer-routing.js';
test('routing splits share junction arrival times and loops clear their tails', () => {
 const lengths={stem:18.857,ksa:160,eu:160,'ksa-stem':17.81,'eu-stem':17.81,'ksa-top':40,'ksa-bottom':40,'eu-top':40,'eu-bottom':40};
 const {starts,period}=issuerPulseSchedule(lengths);
 assert.equal(starts.ksa,starts.eu);
 for(const country of ['ksa','eu']) {
  assert.equal(starts[country]*48,lengths.stem);
  assert.equal(starts[`${country}-stem`],starts[country]+lengths[country]/48);
  assert.equal(starts[`${country}-top`],starts[`${country}-bottom`]);
  assert.equal(starts[`${country}-top`],starts[`${country}-stem`]+lengths[`${country}-stem`]/48);
 }
 for(const [name,length] of Object.entries(lengths)) assert.ok(period >= starts[name]+(length+32)/48+.6-1e-12);
});

import { init } from '../src/embeds/issuer-routing.js';
function fixture({failPulse=false, failObserver=false}={}) {
 const keys=['window','document','matchMedia','getComputedStyle','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
 const saved=keys.map(k=>[k,globalThis[k]]), generated=[], frames=new Map(), events=new Map(), docEvents=new Map(), observers=[];
 let id=0;
 const node=()=>({dataset:{},style:{transform:'',opacity:''},attrs:new Map(),getAttribute(k){return this.attrs.get(k)??null;},setAttribute(k,v){this.attrs.set(k,v);},removeAttribute(k){this.attrs.delete(k);},getBoundingClientRect(){return {width:540,height:278,left:0,top:0,right:540,bottom:278};}});
 const root=node(),frame=node(),dots=node();dots.style.backgroundImage='';root.isConnected=true;root.clientWidth=540;
 const nodes=Array.from({length:11},(_,i)=>{const n=node();n.dataset.irReveal=String(Math.min(4,i));return n;});
 const names=['stem','ksa','eu','ksa-stem','eu-stem','ksa-top','ksa-bottom','eu-top','eu-bottom'];
 const path=name=>{const n=node();n.dataset.irPulse=name;n.getTotalLength=()=>{if(failPulse)throw Error('Geometry unavailable');return 48;};n.parentNode={append(c){generated.push(c);}};n.cloneNode=()=>path(name);n.remove=()=>generated.splice(generated.indexOf(n),1);return n;};
 const paths=names.map(path);
 root.matches=s=>s==='[data-issuer-routing]';root.querySelectorAll=s=>s==='[data-ir-reveal]'?nodes:s==='[data-ir-pulse]'?paths:[];
 root.querySelector=s=>s==='.ir-frame'?frame:s==='.ir-dots'?dots:null;
 const media={matches:false,addEventListener(k,f){events.set(k,f);},removeEventListener(k){events.delete(k);}};
 globalThis.document={documentElement:{},hidden:false,addEventListener(k,f){docEvents.set(k,f);},removeEventListener(k){docEvents.delete(k);}};
 const tokens={'--motion-duration-default':'770ms','--motion-ease-primary':'cubic-bezier(.11,.61,.27,.99)','--reveal-offset-default':'7rem','--reveal-stagger-default':'200ms','--reveal-opacity-ratio':'.34'};
 globalThis.getComputedStyle=()=>({fontSize:'16px',getPropertyValue:k=>tokens[k]||''});globalThis.window={getComputedStyle:globalThis.getComputedStyle};
 globalThis.matchMedia=()=>media;
 globalThis.IntersectionObserver=class {constructor(fn){if(failObserver)throw Error('Observer unavailable');this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 globalThis.ResizeObserver=class {observe(){}disconnect(){}};
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 return {root,nodes,paths,generated,frames,media,events,docEvents,observers,
  visible(value=true){observers[0].fn([{isIntersecting:value,intersectionRatio:value?1:0}]);},
  tick(now){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));},
  restore(){for(const [k,v] of saved) v===undefined?delete globalThis[k]:globalThis[k]=v;}
 };
}
test('duplicate mounts share one clock; cleanup removes pulse samples and restores the visible design',()=>{
 const f=fixture();try {
  const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,1);assert.equal(f.generated.length,243);assert.equal(f.nodes[0].style.opacity,'0');
  f.visible();assert.equal(f.frames.size,1);f.tick(100);f.visible(false);assert.equal(f.frames.size,0);
  f.visible();document.hidden=true;f.docEvents.get('visibilitychange')();assert.equal(f.frames.size,0);
  dispose();assert.equal(f.generated.length,0);assert.equal(f.frames.size,0);assert.equal(f.events.size,0);assert.equal(f.docEvents.size,0);
  assert.ok(f.nodes.every(n=>n.style.opacity===''&&n.style.transform===''));assert.equal(f.root.attrs.has('data-ir-ready'),false);
  const again=init(f.root);assert.equal(f.observers.length,2);again();
 } finally {f.restore();}
});
test('reduced motion shows all elements and hides every traveling pulse',()=>{
 const f=fixture();try {const dispose=init(f.root);f.visible();f.media.matches=true;f.events.get('change')();f.tick(100);
  assert.ok(f.nodes.every(n=>n.style.opacity===''&&n.style.transform===''));assert.ok(f.paths.every(p=>p.style.opacity==='0'));assert.equal(f.frames.size,0);dispose();
 }finally{f.restore();}
});
for(const key of ['failPulse','failObserver'])test(`partial ${key} failure restores the native fallback`,()=>{
 const f=fixture({[key]:true}), warn=console.warn;console.warn=()=>{};
 try {const dispose=init(f.root);assert.equal(f.generated.length,0);assert.equal(f.frames.size,0);assert.equal(f.root.attrs.has('data-ir-ready'),false);assert.ok(f.nodes.every(n=>n.style.opacity===''&&n.style.transform===''));dispose();}
 finally {console.warn=warn;f.restore();}
});
