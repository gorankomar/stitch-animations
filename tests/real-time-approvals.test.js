import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approvalsState} from '../src/embeds/real-time-approvals.js';
import {sampleCursor} from '../src/lib/effects/demo-cursor.js';
test('drag values and cursor remain synchronized in both directions',()=>{
 for(const t of [2.5,3,4,5,10,11,12.5]){const s=approvalsState(t);assert.equal(s.x,s.ax);assert.equal(s.y,109);assert.equal(s.amount,Math.round(12000+(s.ax-137)/130*83000));}
 for(const t of [6.3,7,8.8,13.8,15,16.3]){const s=approvalsState(t);assert.equal(s.x,s.tx);assert.equal(s.y,185);assert.ok(Math.abs(s.weeks-(3+(s.tx-111)/120*11))<1e-9);}
});
test('loop resets values and hides cursor behind loan card',()=>{const s=approvalsState(18);assert.equal(s.amount,12000);assert.equal(s.weeks,3);assert.equal(s.opacity,0);assert.equal(s.behind,true);assert.equal(approvalsState(9).amount,95000);assert.equal(approvalsState(9).weeks,14);});
test('cursor waypoints clamp after the last point',()=>{assert.deepEqual(sampleCursor([{time:0,x:1,y:2},{time:1,x:3,y:4}],2),{x:3,y:4});});

import {cubicBezier} from '../src/lib/motion.js';
test('live primary easing stays within its range and reaches both endpoints',()=>{const ease=cubicBezier(.11,.61,.27,.99);assert.equal(ease(0),0);assert.equal(ease(1),1);let previous=0;for(let i=0;i<=100;i++){const v=ease(i/100);assert.ok(v>=previous&&v<=1);previous=v;}});
test('flat initial easing uses the subdivision fallback',()=>{const ease=cubicBezier(0,0,1,0);assert.equal(ease(0),0);assert.ok(ease(.0001)>=0);assert.equal(ease(1),1);});

test('cursor drops behind the card before its exit movement',()=>{assert.equal(approvalsState(16.9).behind,false);for(const t of [17,17.1,17.35,17.7])assert.equal(approvalsState(t).behind,true);});
