import test from 'node:test';
import assert from 'node:assert/strict';
import {holderTiltTarget} from '../src/lib/effects/holder-tilt.js';
const box={left:100,top:100,width:64,height:64};
test('holder faces the approaching cursor and light tracks its side',()=>{
 const right=holderTiltTarget(box,180,132),above=holderTiltTarget(box,132,80);
 assert.ok(right.ry>0);assert.equal(Math.abs(right.rx),0);assert.equal(right.lightX,100);assert.ok(right.strength>0&&right.strength<1);
 assert.ok(above.rx>0);assert.equal(above.ry,0);assert.equal(above.lightY,0);
});
test('center is flat and distant cursor releases the holder',()=>{
 const center=holderTiltTarget(box,132,132),far=holderTiltTarget(box,500,500);
 assert.equal(Math.abs(center.rx)+Math.abs(center.ry),0);assert.equal(center.strength,1);
 assert.equal(far.strength,0);assert.equal(Math.abs(far.rx)+Math.abs(far.ry),0);
});

test('holder edge reaches a prominent tilt at every sample size',()=>{
 for(const size of [32,48,64,96]){
  const plane={left:0,top:0,width:size,height:size};
  assert.equal(holderTiltTarget(plane,size,size/2).ry,17);
  assert.equal(holderTiltTarget(plane,size/2,0).rx,17);
 }
});
