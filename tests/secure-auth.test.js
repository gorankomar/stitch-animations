import test from 'node:test';
import assert from 'node:assert/strict';
import {secureState} from '../src/embeds/secure-auth.js';

test('authentication sequence enables before selecting Advanced and disables before exit',()=>{
  assert.equal(secureState(2.9).enabled,false);
  assert.equal(secureState(3.2).enabled,true);
  assert.equal(secureState(4).open,1);
  assert.equal(secureState(5.9).selected,0);
  assert.equal(secureState(6.5).selected,1);
  assert.equal(secureState(9.9).enabled,false);
  assert.equal(secureState(11).open,0);
  assert.equal(secureState(13.5).opacity,0);
  assert.equal(secureState(13.5).behind,true);
});
test('reduced motion presents the final readable state without a moving cursor',()=>{
  for(const t of [0,4,8,12]){
    const state=secureState(t,true);
    assert.equal(state.open,1);assert.equal(state.selected,1);
    assert.equal(state.enabled,true);assert.equal(state.opacity,0);
  }
});
test('loop reset is hidden behind the static window',()=>{
  const end=secureState(14.599),start=secureState(14.6);
  assert.equal(end.opacity,0);assert.equal(start.opacity,0);
  assert.equal(end.behind,true);assert.equal(start.behind,true);
  assert.equal(end.x,start.x);assert.equal(end.y,start.y);
  assert.equal(end.open,start.open);
});
