import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleCollections } from '../src/embeds/collections-graphic.js';
const linear = t => t;
test('Collections entrance staggers the front window and keeps opacity linear', () => {
  assert.equal(sampleCollections(0, 0, 201, linear).opacity, 0);
  assert.equal(sampleCollections(.1, 1, 244, linear).opacity, .1/.9);
  const curved=sampleCollections(.55,0,201,t=>t*t);
  assert.ok(Math.abs(curved.opacity-.5)<1e-10);
  assert.ok(Math.abs(curved.y-201*1.25*.75)<1e-10);
});
test('Collections preserves the supplied static positions during its first hold', () => {
  assert.deepEqual(sampleCollections(1.2,0,201,linear),{x:0,y:0,opacity:1,z:2,phase:'holding'});
  assert.deepEqual(sampleCollections(1.2,1,244,linear),{x:-49,y:-48,opacity:1,z:1,phase:'holding'});
});
test('outgoing window leaves the frame before recycling invisibly behind', () => {
  const before=sampleCollections(3.45-1e-6,0,201,linear);
  assert.ok(before.x>374);assert.equal(before.z,2);assert.equal(before.opacity,1);
  const returning=sampleCollections(3.450001,0,201,linear);
  assert.equal(returning.x,-49);assert.equal(returning.z,1);assert.ok(returning.opacity<.00001);
  assert.equal(sampleCollections(4.1,0,201,linear).y,-48);
});
test('both complete windows alternate front slots with a 3500ms hold', () => {
  assert.equal(sampleCollections(7.49,1,244,linear).x,0);
  assert.equal(sampleCollections(7.49,0,201,linear).x,-49);
  assert.equal(sampleCollections(9,0,201,linear).x,0);
  assert.equal(sampleCollections(9,1,244,linear).x,-49);
  assert.deepEqual(sampleCollections(12.39,0,201,linear),sampleCollections(2.59,0,201,linear));
});
