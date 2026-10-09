import test from 'node:test';
import assert from 'node:assert/strict';
import { sweepPosition, SWEEP_SECONDS, CYCLE_SECONDS } from '../src/embeds/worldwide-markets.js';
import { animateStage } from '../src/lib/effects/animation-stage.js';
test('map sweep clears both edges and rests outside the mask before repeating', () => {
  assert.equal(sweepPosition(0), 100 / .75);
  assert.ok(Math.abs(sweepPosition(SWEEP_SECONDS) + 100) < 1e-10);
  assert.ok(sweepPosition(.9) < sweepPosition(0));
  assert.equal(sweepPosition(SWEEP_SECONDS), sweepPosition(CYCLE_SECONDS - .01));
  assert.equal(sweepPosition(CYCLE_SECONDS), 100 / .75);
  assert.ok(Math.abs(sweepPosition(.9) - sweepPosition(CYCLE_SECONDS + .9)) < 1e-10);
});
test('stage setup failure disconnects already-created observers', () => {
  const keys = ['matchMedia', 'IntersectionObserver', 'ResizeObserver', 'cancelAnimationFrame', 'document'];
  const saved = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis,key)]));
  let disconnected = false;
  try {
    globalThis.matchMedia = () => ({addEventListener(){},removeEventListener(){}});
    globalThis.IntersectionObserver = class {observe(){} disconnect(){disconnected=true;} };
    globalThis.ResizeObserver = class {constructor(){throw new Error('failed setup');} };
    globalThis.cancelAnimationFrame = () => {};
    globalThis.document = {removeEventListener(){}};
    assert.throws(() => animateStage({}, {update(){}}), /failed setup/);
    assert.equal(disconnected,true);
  } finally {
    for(const key of keys) { if(saved[key]) Object.defineProperty(globalThis,key,saved[key]); else delete globalThis[key]; }
  }
});
