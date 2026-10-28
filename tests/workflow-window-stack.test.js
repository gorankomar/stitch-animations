import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleWorkflowStack,WORKFLOW_SLOTS} from '../src/lib/effects/workflow-window-stack.js';

test('workflow holds for 2.5 seconds before advancing; Assets grows into front',()=>{
  assert.equal(sampleWorkflowStack(2.5,3,1).width,448);
  const mid=sampleWorkflowStack(3,3,1);
  assert.equal(mid.width,475);assert.equal(mid.top,252);
  assert.equal(sampleWorkflowStack(3.5,3,1).width,502);
});
test('front exits completely before changing depth and returns at back',()=>{
  const before=sampleWorkflowStack(3.5-1e-7,4,1);
  const after=sampleWorkflowStack(3.5,4,1);
  assert.ok(before.top>395);assert.ok(after.top>395);
  assert.equal(before.z,5);assert.equal(after.z,1);assert.equal(after.raised,0);
  assert.equal(sampleWorkflowStack(4.5,4,1).raised,1);
});
test('all five windows visit every slot and wrap seamlessly without losing content',()=>{
  for(let i=0;i<5;i++){
    const widths=new Set();
    for(let turn=0;turn<5;turn++)widths.add(sampleWorkflowStack(turn*4.5,i,1).width);
    assert.equal(widths.size,5);
    assert.equal(sampleWorkflowStack(22.5,i,1).width,WORKFLOW_SLOTS[i].width);
    for(let turn=1;turn<=5;turn++){
      const end=sampleWorkflowStack(turn*4.5-1e-8,i,1),next=sampleWorkflowStack(turn*4.5,i,1);
      assert.ok(Math.abs(end.top-next.top)<1e-4);
      assert.ok(Math.abs(end.raised-next.raised)<1e-4);
    }
  }
});
