import test from 'node:test';
import assert from 'node:assert/strict';
// Exercise the shipped module, including its module dependencies, after the build.
import { cardControlsState } from '../dist/feature-card-controls.js';

test('cursor rests on each toggle when its click activates it', () => {
  for (const [time, target] of [[2.5,'travel'],[4.7,'food']]) {
    const state=cardControlsState(time);
    assert.equal(state.from,target);
    assert.equal(state.to,target);
    assert.equal(state[target],true);
    assert.ok(state.opacity > .99);
    assert.ok(state.scale < 1);
  }
  assert.equal(cardControlsState(2.49).travel,false);
  assert.equal(cardControlsState(4.69).food,false);
});

test('toggles reset only after the cursor leaves, with a stable loop boundary', () => {
  assert.equal(cardControlsState(8).travel,true);
  assert.equal(cardControlsState(8).food,true);
  assert.equal(cardControlsState(8.4).opacity,0);
  assert.equal(cardControlsState(8.4).travel,false);
  assert.equal(cardControlsState(8.4).food,false);
  assert.deepEqual(cardControlsState(9.6),cardControlsState(0));
});

test('reduced motion keeps a readable active state without a cursor', () => {
  const state=cardControlsState(0,true);
  assert.equal(state.travel,true);
  assert.equal(state.food,true);
  assert.equal(state.opacity,0);
});
