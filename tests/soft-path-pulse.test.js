import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoftPathPulse} from '../src/lib/effects/soft-path-pulse.js';
function fixture(){const nodes=[];const parent={append(n){nodes.push(n);}};function node(){return {style:{},parentNode:parent,getTotalLength:()=>120,getAttribute:()=>null,removeAttribute(){},cloneNode:node,remove(){nodes.splice(nodes.indexOf(this),1);}};}return {path:node(),nodes};}
test('soft pulse fades both ends, follows reversed paths and restores samples on disposal',()=>{const f=fixture(),effect=createSoftPathPulse(f.path,{reverse:true});effect.update(.5);assert.equal(f.nodes.length,27);assert.ok(Number(f.path.style.opacity)<Number(f.nodes[13].style.opacity));assert.ok(Number(f.nodes[26].style.opacity)<Number(f.nodes[13].style.opacity));assert.equal(f.path.style.strokeDashoffset,'-96');effect.update(.5,true);assert.ok(f.nodes.every(n=>n.style.opacity==='0'));effect.dispose();assert.equal(f.nodes.length,0);});
test('periodic consumer keeps its exact phase after a full loop',()=>{const f=fixture(),effect=createSoftPathPulse(f.path,{start:1.37,period:5.71});effect.update(2);const offset=f.path.style.strokeDashoffset;effect.update(7.71);assert.ok(Math.abs(Number(offset)-Number(f.path.style.strokeDashoffset))<1e-8);effect.dispose();});
test('geometry refresh follows expanded routes without changing normalized duration',()=>{
 const f=fixture();let length=120;f.path.getTotalLength=()=>length;
 const effect=createSoftPathPulse(f.path,{span:42,speed:162,period:1000});
 effect.update(.5);assert.equal(f.path.style.strokeDashoffset,'-81');
 length=240;effect.refreshGeometry(84,324);effect.update(.5);
 assert.equal(f.path.style.strokeDashoffset,'-162');
 assert.match(f.path.style.strokeDasharray,/340$/);
 effect.update(.999);assert.notEqual(f.path.style.opacity,'0');
 effect.update(1);assert.equal(f.path.style.opacity,'0');effect.dispose();
});
