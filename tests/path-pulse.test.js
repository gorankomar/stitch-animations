import test from 'node:test';
import assert from 'node:assert/strict';
import {createPathPulse,pulseDefaults} from '../src/lib/effects/path-pulse.js';
const path=()=>({style:{},getTotalLength:()=>120,getAttribute:()=>null,removeAttribute(){this.style={};},setAttribute(){}});
test('reverse pulse travels inward at configurable speed and length, then waits independently',()=>{
 const node=path(),pulse=createPathPulse(node,{span:12,speed:60,reverse:true,end:80,random:()=>.5,minDelay:1,maxDelay:3});
 pulse.update(0);assert.equal(node.style.strokeDasharray,'12 232');assert.equal(node.style.strokeDashoffset,'-80');
 pulse.update(.5);assert.equal(node.style.strokeDashoffset,'-50');
 pulse.update(2);assert.equal(node.style.opacity,'0');pulse.update(4.5);assert.equal(node.style.opacity,'1');
 pulse.update(4.6,true);assert.equal(node.style.opacity,'0');pulse.dispose();assert.deepEqual(node.style,{});
});
test('shared defaults have canonical blue and validate invalid speed',()=>{assert.equal(pulseDefaults.span,40);assert.match(pulseDefaults.color,/primary-blue/);assert.throws(()=>createPathPulse(path(),{speed:0}));});
