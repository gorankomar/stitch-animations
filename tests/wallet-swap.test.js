import test from 'node:test';
import assert from 'node:assert/strict';
import { walletSwapPose } from '../src/lib/effects/wallet-swap.js';

test('wallet cards trade resting positions and restore exactly', () => {
  assert.deepEqual(walletSwapPose(0, 18, 60, 4), {blueY:0, grayY:-0, blueFront:false});
  assert.deepEqual(walletSwapPose(1, 18, 60, 4), {blueY:18, grayY:-18, blueFront:true});
});

test('stacking changes only with full card clearance in both directions', () => {
  for (const [offset, height, gap] of [[18,60,4], [36,120,8], [12,40,4]]) {
    const before = walletSwapPose(0.49999,offset,height,gap);
    const after = walletSwapPose(0.50001,offset,height,gap);
    assert.equal(before.blueFront,false);
    assert.equal(after.blueFront,true);
    for (const pose of [before,after]) {
      assert.ok(pose.blueY > offset + pose.grayY + height, 'blue clears gray before stacking flips');
    }
    assert.ok(Math.abs(before.blueY-after.blueY)<0.001,'reversing is continuous at crossover');
  }
});
