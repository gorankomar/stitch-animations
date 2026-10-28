import test from 'node:test';
import assert from 'node:assert/strict';
import {paperFlipState,flipOutline,foldSurfacePath} from '../src/animations/icon-playground/paper-flip-motion.js';
test('clockwise paper movement and fold expansion use one deformation parameter',()=>{
 for(const p of [.1,.25,.45,.65]){
  const state=paperFlipState(p);
  assert.ok(state.rotation>0);
  assert.ok(Math.abs(state.rotation/12-state.turn)<1e-10);
  assert.ok(Math.abs(state.x/-10.8-state.turn)<1e-10);
  assert.ok(Math.abs((state.folded[1][1]-5.33333)/10.5-state.turn)<1e-10);
  assert.equal(state.folded[0][0],state.folded[1][0]);
  assert.equal(state.folded[1][1],state.folded[2][1]);
 }
});
test('replacement text starts while front page is still leaving',()=>{
 const early=paperFlipState(.3),mid=paperFlipState(.65),end=paperFlipState(1);
 assert.equal(early.content,0);assert.ok(mid.content>0&&mid.exit<1);assert.equal(end.content,1);assert.equal(end.exit,1);
 assert.equal(paperFlipState(0).rotation,0);
});

test('front outline and fold share their two crease attachment points',()=>{
 for(const p of [.2,.35,.5,.7]){
  const state=paperFlipState(p),[top,,right]=state.folded;
  assert.ok(flipOutline(state).endsWith(`V${right[1]}L${top[0]} ${top[1]}Z`));
 }
});

test('lower fold tip travels predominantly downward, with content tied to clearance',()=>{
 const start=paperFlipState(0),mid=paperFlipState(.65);
 const dx=Math.abs(mid.folded[1][0]-start.folded[1][0]);
 const dy=mid.folded[1][1]-start.folded[1][1];
 assert.ok(dy>dx*7);
 assert.equal(mid.content,(mid.turn-.72)/.28);
});
test('closing edge never backtracks past the lower-right curve',()=>{
 for(let i=0;i<=100;i++){
  const state=paperFlipState(i/100);
  assert.ok(state.folded[2][1]<=14.6667);
  const match=flipOutline(state).match(/C[^C]*13\.3333 ([\d.]+)V([\d.]+)L/);
  assert.ok(match);assert.ok(Number(match[1])+1e-8>=Number(match[2]));
 }
});

test('growing fold keeps the rounded bottom-left curve',()=>{
 for(const p of [0,.2,.5,1]){
  const state=paperFlipState(p),d=foldSurfacePath(state.folded);
  assert.equal((d.match(/C/g)||[]).length,3);
  assert.ok(d.startsWith(`M${state.folded[0][0]} ${state.folded[0][1]}V${state.folded[1][1]-1.06667}C`));
 }
});
