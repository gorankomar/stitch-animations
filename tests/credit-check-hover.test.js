import test from 'node:test';
import assert from 'node:assert/strict';
import {createCreditCheckHover} from '../src/embeds/credit-check-hover.js';

test('connector follows both card edges; spins finish cleanly and teardown restores fallback',()=>{
 const keys=['document','matchMedia','requestAnimationFrame','cancelAnimationFrame','ResizeObserver'];
 const saved=keys.map(k=>[k,globalThis[k]]);
 const node=()=>({attrs:new Map(),children:[],events:new Map(),
  setAttribute(k,v){this.attrs.set(k,String(v));},getAttribute(k){return this.attrs.get(k)??null;},removeAttribute(k){this.attrs.delete(k);},
  append(n){this.children.push(n);n.parent=this;},remove(){this.parent.children=this.parent.children.filter(x=>x!==this);},
  addEventListener(k,fn){this.events.set(k,fn);},removeEventListener(k){this.events.delete(k);}});
 const root=node(),top=node(),bottom=node(),host=node(),add=node(),black=node(),red=node();
 const a={left:48,width:218,bottom:108},b={left:272,width:218,top:183};
 top.getBoundingClientRect=()=>a;bottom.getBoundingClientRect=()=>b;
 host.getBoundingClientRect=()=>({left:0,top:0,width:540,height:278});
 const nodes={'.cc-credit-position .cc-card':top,'.cc-decline-position .cc-card':bottom,'.cc-flow':host,'.cc-add':add,'.cc-plus-position svg':black,'.cc-close-position svg':red};
 root.querySelector=s=>nodes[s];
 const spins=[];[black,red].forEach(icon=>icon.animate=(frames,timing)=>{
  const animation={effect:{target:icon},frames,timing,cancelled:false,cancel(){this.cancelled=true;}};
  spins.push(animation);return animation;
 });
 const frames=new Map();let next=0;
 globalThis.document={createElementNS:()=>node()};globalThis.matchMedia=()=>({matches:true});
 globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 let disconnected=false;globalThis.ResizeObserver=class{observe(){}disconnect(){disconnected=true;}};
 try{
  const controller=createCreditCheckHover(root,{duration:770,ease:'cubic-bezier(.11,.61,.27,.99)'});
  add.events.get('pointerenter')();assert.equal(spins.length,0);
  controller.setEnabled(true);const svg=host.children[0],line=svg.children[0],dot=svg.children[1],arrow=svg.children[2];
  assert.equal(dot.getAttribute('cy'),'108');assert.match(line.getAttribute('d'),/L 381 183$/);
  a.bottom-=4;b.top-=4;top.events.get('pointerenter')();
  assert.equal(dot.getAttribute('cy'),'104');assert.match(line.getAttribute('d'),/L 381 179$/);assert.match(arrow.getAttribute('d'),/L 381 179 L/);
  add.events.get('pointerenter')();add.events.get('pointerenter')();assert.equal(spins.length,1);
  assert.deepEqual(spins[0].frames,[{rotate:'0deg'},{rotate:'720deg'}]);assert.equal(spins[0].timing.duration,1540);
  spins[0].onfinish();assert.ok(spins[0].cancelled);
  bottom.events.get('pointerenter')();assert.equal(spins.length,2);assert.equal(spins[1].effect.target,red);
  controller.setEnabled(false);assert.ok(spins[1].cancelled);assert.equal(host.children.length,0);assert.equal(frames.size,0);assert.ok(!root.attrs.has('data-cc-connector-ready'));
  bottom.events.get('pointerenter')();assert.equal(spins.length,2);
  controller.dispose();assert.equal(top.events.size,0);assert.equal(add.events.size,0);assert.ok(disconnected);
 }finally{saved.forEach(([k,v])=>v===undefined?delete globalThis[k]:globalThis[k]=v);}
});
