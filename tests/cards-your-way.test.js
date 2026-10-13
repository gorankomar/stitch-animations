import test from 'node:test';
import assert from 'node:assert/strict';
import {cardsYourWayState} from '../src/embeds/cards-your-way.js';
test('hard reveal order finishes before facial recognition loop begins',()=>{
  const d=.77;
  assert.deepEqual(cardsYourWayState(0,d).reveals,[0,0,0,0]);
  const middle=cardsYourWayState(.9,d);
  assert.equal(middle.reveals[0],1);
  assert.ok(middle.reveals[1]>middle.reveals[2]);
  assert.equal(middle.reveals[3],0);
  assert.equal(middle.active,false);
  assert.equal(cardsYourWayState(1.79,d).active,true);
  assert.deepEqual(cardsYourWayState(1.79,d).reveals,[1,1,1,1]);
});
test('reduced motion retains full fallback and no face loop',()=>{
  assert.deepEqual(cardsYourWayState(0,.77,true).reveals,[1,1,1,1]);
  assert.equal(cardsYourWayState(12,.77,true).active,false);
});
test('recognition loop repeats without restarting entrance',()=>{
  const a=cardsYourWayState(2,.77),b=cardsYourWayState(2+FACE_CYCLE*.77,.77);
  assert.ok(Math.abs(a.loop-b.loop)<1e-10);
  assert.deepEqual(b.reveals,[1,1,1,1]);
});

import {recognitionState, projectFaceRing, faceRingOrientation, FACE_RING_COLORS, FACE_CYCLE, faceRecognitionTime, FACE_RING_SPEEDS} from '../src/embeds/cards-your-way-face-motion.js';
test('Face ID has distinct face, rings, confirmation and return phases',()=>{
  const face=recognitionState(.4,true),rings=recognitionState(1.85,true),confirmed=recognitionState(3.8,true),rest=recognitionState(5.8,true);
  assert.equal(face.features,1);assert.equal(face.morph,0);
  assert.equal(rings.features,0);assert.equal(rings.wire,1);assert.equal(rings.morph,1);assert.equal(rings.check,0);
  assert.equal(confirmed.wire,0);assert.equal(confirmed.check,1);assert.equal(confirmed.checkDraw,1);
  assert.equal(rest.features,1);assert.equal(rest.morph,0);assert.equal(rest.check,0);
  assert.equal(recognitionState(1.85,false).active,false);
});
test('Face ID loop seam matches the static face without a position jump',()=>{
  const start=recognitionState(0,true),end=recognitionState(FACE_CYCLE,true);
  for(const key of ['morph','features','wire','check','pulse'])assert.equal(start[key],end[key]);
});
test('independent circle projections stay inside the face footprint',()=>{
  for(let ring=0;ring<FACE_RING_COLORS.length;ring++)for(let i=0;i<100;i++){
    const a=i/100*Math.PI*2;
    const p=projectFaceRing(Math.cos(a),Math.sin(a),faceRingOrientation(1.85,ring));
    assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));
    assert.ok(p.x>=16&&p.x<=56&&p.y>=16&&p.y<=56);
  }
});
test('colored rings rotate in different planes and align into the confirmation circle',()=>{
  const poses=FACE_RING_COLORS.map((_,i)=>faceRingOrientation(1.85,i));
  assert.equal(new Set(poses.map(p=>JSON.stringify(p))).size,4);
  assert.equal(new Set(FACE_RING_COLORS).size,4);
  for(let i=0;i<4;i++)for(const time of [0,2.75,3.8,5.8]) {
    const pose=faceRingOrientation(time,i);
    for(const angle of Object.values(pose))assert.ok(Math.abs(Math.sin(angle/2))<1e-12);
  }
});

test('only the rotation window is compressed; alignment keeps its original duration',()=>{
  assert.equal(faceRecognitionTime(1),1);
  assert.ok(Math.abs(faceRecognitionTime(2.05)-4.05)<1e-12);
  assert.ok(Math.abs(faceRecognitionTime(2.75)-faceRecognitionTime(2.05)-.7)<1e-12);
  assert.ok(Math.abs((faceRecognitionTime(1.9)-faceRecognitionTime(1.8))/.1-2.45/.45)<1e-12);
});

test('rings start during the morph, have distinct speeds, and never rewind into alignment',()=>{
  assert.ok(recognitionState(1.4,true).wire>0);
  assert.ok(recognitionState(1.4,true).morph<1);
  assert.equal(new Set(FACE_RING_SPEEDS).size,4);
  for(let ring=0;ring<4;ring++) {
    let previous=faceRingOrientation(1.3,ring);
    for(let t=1.31;t<=2.76;t+=.01) {
      const current=faceRingOrientation(t,ring);
      for(const axis of ['yaw','pitch','roll'])assert.ok(current[axis]>=previous[axis]-1e-10);
      previous=current;
    }
  }
});
