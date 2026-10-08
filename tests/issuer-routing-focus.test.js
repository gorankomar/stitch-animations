import test from 'node:test';
import assert from 'node:assert/strict';
import { createIssuerFocus, issuerFocusRoute } from '../src/embeds/issuer-routing-focus.js';

test('country focus keeps its shared source and both destinations; leaf focus excludes its sibling', () => {
 assert.deepEqual(issuerFocusRoute('ksa'), ['cards','ksa','visa','mada']);
 assert.deepEqual(issuerFocusRoute('eu'), ['cards','eu','apple-pay','stripe']);
 assert.deepEqual(issuerFocusRoute('mada'), ['cards','ksa','mada']);
 assert.deepEqual(issuerFocusRoute('visa'), ['cards','ksa','visa']);
 assert.deepEqual(issuerFocusRoute('apple-pay'), ['cards','eu','apple-pay']);
 assert.deepEqual(issuerFocusRoute('stripe'), ['cards','eu','stripe']);
 assert.deepEqual(issuerFocusRoute('cards'), ['cards']);
});

function fixture() {
 const node=()=>({style:{opacity:'',filter:'',transition:''},dataset:{},children:[],listeners:new Map(),addEventListener(k,f){this.listeners.set(k,f)},removeEventListener(k){this.listeners.delete(k)},appendChild(n){this.insertBefore(n,null)},insertBefore(n,next){n.remove();n.parentNode=this;const i=this.children.indexOf(next);this.children.splice(i<0?this.children.length:i,0,n)},remove(){if(this.parentNode){const a=this.parentNode.children;a.splice(a.indexOf(this),1);this.parentNode=null}},get nextSibling(){if(!this.parentNode)return null;return this.parentNode.children[this.parentNode.children.indexOf(this)+1]||null}});
 const names=['cards','ksa','eu','visa','mada','apple-pay','stripe'];
 const items=Object.fromEntries(names.map(n=>[n,node()])), svg=node();
 const paths=['stem','ksa','eu','ksa-top','ksa-bottom','eu-top','eu-bottom'].map(k=>{const n=node();n.dataset.irPulse=k;n.style.opacity='.7';svg.appendChild(n);return n});
 const root={querySelector:s=>items[s.replace('.ir-position-','')],querySelectorAll:s=>s==='[data-ir-pulse]'?paths:[]};
 const fine={matches:true,listeners:new Map(),addEventListener(k,f){this.listeners.set(k,f)},removeEventListener(k){this.listeners.delete(k)}};
 const reduced={matches:false};
 return {items,paths,svg,root,fine,reduced,node};
}
test('focus isolates instances, preserves pulse opacity and restores groups/listeners on cleanup',()=>{
 const oldDoc=globalThis.document,oldMedia=globalThis.matchMedia;
 const a=fixture(),b=fixture();globalThis.document={createElementNS:()=>a.node()};globalThis.matchMedia=q=>q.includes('reduced')?a.reduced:a.fine;
 try {
  const stop=createIssuerFocus(a.root),stopB=createIssuerFocus(b.root);
  a.items.mada.listeners.get('pointerenter')({pointerType:'mouse'});
  assert.equal(a.items.visa.style.opacity,'.5');assert.equal(a.items.eu.style.filter,'grayscale(1)');assert.equal(a.items.ksa.style.opacity,'');assert.equal(a.items.cards.style.opacity,'');assert.equal(b.items.visa.style.opacity,'');
  assert.equal(a.paths[0].style.opacity,'.7');assert.equal(a.paths.find(p=>p.dataset.irPulse==='eu').parentNode.style.opacity,'.5');
  assert.equal(a.paths.find(p=>p.dataset.irPulse==='ksa-bottom').parentNode.style.opacity,'');assert.equal(a.paths.find(p=>p.dataset.irPulse==='ksa-top').parentNode.style.opacity,'.5');
  a.items.mada.listeners.get('pointerleave')();assert.ok(Object.values(a.items).every(n=>n.style.opacity===''));
  a.items.eu.listeners.get('pointerenter')({pointerType:'touch'});assert.equal(a.items.ksa.style.opacity,'');
  a.reduced.matches=true;a.items.eu.listeners.get('pointerenter')({pointerType:'mouse'});assert.match(a.items.ksa.style.transition,/opacity 0ms linear/);
  stop();stop();stopB();assert.deepEqual(a.svg.children,a.paths);assert.ok(Object.values(a.items).every(n=>n.listeners.size===0&&n.style.opacity===''&&n.style.filter===''&&n.style.transition===''));
 }finally{globalThis.document=oldDoc;globalThis.matchMedia=oldMedia}
});
