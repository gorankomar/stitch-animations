import test from 'node:test';
import assert from 'node:assert/strict';
import {verticalFieldPoses, verticalExitFocus, settlePromptPose, engagePromptPose, continuousRollFocus, verticalEntryFocus, createEntranceClock, verticalPickupFocus} from '../src/embeds/real-ai-product-layout-geometry.js';
const settings = {edgeScale:25, centerScale:150, tilt:60, gap:1};
const heights = [100,100,100,100,140,100,100,110,100,100,100,100,100,100];
test('final fields continue above the stage without extrapolating the last shrinking pair', () => {
  const end = verticalExitFocus(heights,1200,650,settings);
  const final = verticalFieldPoses(heights,end,1200,settings).at(-1);
  assert.ok(final.y + final.bottom < -325 || Math.abs(final.rotation) === 90);
  let previous;
  for (let focus=heights.length;focus<=end;focus+=.02) {
    const poses=verticalFieldPoses(heights,focus,1200,settings);
    for (const pose of poses) assert.ok(Math.abs(pose.rotation)<=90);
    if(previous) for(let i=heights.length-3;i<heights.length;i++) assert.ok(poses[i].y<=previous[i].y+.02);
    previous=poses;
  }
});
test('projected edge gaps remain equal around the taller description',()=>{
  const poses=verticalFieldPoses(heights,4.4,1200,settings);
  for(let i=1;i<poses.length;i++) assert.ok(Math.abs(poses[i].y-poses[i].top-poses[i-1].y-poses[i-1].bottom-12)<1e-8);
});

test('every field completes its outgoing turn only at the top of the frame', () => {
  const reached = new Set();
  for (let focus=-2;focus<30;focus+=.05) {
    for (const pose of verticalFieldPoses(heights,focus,1200,settings,650)) {
      if (Math.abs(pose.rotation)>=90 && pose.y<0) {
        assert.ok(pose.y<=-325+.01, `field ${pose.index} vanished at ${pose.y}`);
        reached.add(pose.index);
      }
    }
  }
  assert.equal(reached.size,heights.length);
});

test('prompt follows the final field and reaches a flat centered resting pose', () => {
  const promptHeight=155;
  const list=[...heights,promptHeight/(settings.centerScale/100)];
  const index=list.length-1;
  const incoming=verticalFieldPoses(list,index-.5,1200,settings,650).at(-1);
  const resting=verticalFieldPoses(list,index,1200,settings,650).at(-1);
  assert.ok(incoming.y>0);
  assert.ok(incoming.rotation<0);
  assert.ok(incoming.scale<resting.scale);
  assert.equal(resting.y,0);
  assert.equal(resting.rotation,0);
  assert.equal(resting.scale,settings.centerScale/100);
});

test('prompt settling matches its incoming speed and comes to rest without overshooting',()=>{
  const from={y:90,rotation:-35,scale:1.2,targetScale:1.5,velocity:100};
  const start=settlePromptPose(from,0,1.1), end=settlePromptPose(from,1,1.1);
  assert.equal(start.y,from.y); assert.equal(end.y,0); assert.equal(end.rotation,0); assert.equal(end.scale,1.5);
  assert.ok(Math.abs((settlePromptPose(from,.00001,1.1).y-start.y)/.00001+110)<.01);
  assert.ok(settlePromptPose(from,.99999,1.1).y<.00001);
  let previous=Infinity;
  for(let p=0;p<=1;p+=.01){const pose=settlePromptPose(from,p,1.1);assert.ok(pose.y>=0&&pose.y<=previous);previous=pose.y;}
});

test('wheel runs continuously through pickup without stopping or restarting',()=>{
  const step=.616,start=-2.4,pickup=-start*step,epsilon=.00001;
  const before=continuousRollFocus(pickup-epsilon,step,start);
  const at=continuousRollFocus(pickup,step,start);
  const after=continuousRollFocus(pickup+epsilon,step,start);
  assert.ok(Math.abs(at)<1e-10);
  assert.ok(before<at&&after>at);
  assert.ok(Math.abs((at-before)/epsilon-1/step)<1e-8);
  assert.ok(Math.abs((after-at)/epsilon-1/step)<1e-8);
});

test('selected low tilt softens only outgoing fields and preserves incoming arrival',()=>{
  const selected={...settings,tilt:8,edgeScale:74};
  const poses=verticalFieldPoses(heights,6,1200,selected,650);
  assert.ok(poses.filter(p=>p.y<0).every(p=>Math.abs(p.rotation)<=69));
  assert.ok(poses.filter(p=>p.y>325).every(p=>Math.abs(p.rotation)===90));
});

test('first fields rotate from a hidden wheel angle into the stationary bar pickup',()=>{
  const selected={...settings,tilt:8,edgeScale:74};
  const layout=[58,...heights,130], shift=-54;
  const start=verticalEntryFocus(layout,1200,650,selected,shift);
  const hidden=verticalFieldPoses(layout,start,1200,selected,650)[1];
  const pickup=verticalFieldPoses(layout,0,1200,selected,650)[1];
  const middle=verticalFieldPoses(layout,start*.5,1200,selected,650)[1];
  assert.ok(start<0);
  assert.ok(hidden.y+shift>=325);
  assert.ok(hidden.y>middle.y&&middle.y>pickup.y);
  assert.ok(Math.abs(hidden.rotation)>Math.abs(pickup.rotation));
  assert.ok(pickup.scale>hidden.scale);
  assert.equal(verticalFieldPoses(layout,0,1200,selected,650)[0].y,0);
});

test('the first edge-on item starts close to the frame rather than waiting a full card below it',()=>{
  const selected={...settings,tilt:8,edgeScale:74};
  const layout=[58,...heights,130],shift=-54;
  const start=verticalEntryFocus(layout,1200,650,selected,shift);
  const pose=verticalFieldPoses(layout,start,1200,selected,650)[1];
  assert.ok(pose.y+shift>=325);
  assert.ok(pose.y+shift<350);
  assert.equal(Math.abs(pose.rotation),90);
});

test('visible entrance speed stays consistent through the stationary bar pickup',()=>{
  const selected={...settings,tilt:8,edgeScale:74};
  const layout=[18.125,30,30,30,30,42,30,30,34,30,30,30,30,40.625];
  const start=verticalEntryFocus(layout,375,375,selected);
  const clock=createEntranceClock(layout,375,375,selected,start);
  const speeds=[];
  for(const focus of [-1,-.5,-.1,.1,.5,1]){
    const t=clock.timeAtFocus(focus),delta=.0001;
    const a=verticalFieldPoses(layout,clock.focus(t-delta),375,selected,375)[1];
    const b=verticalFieldPoses(layout,clock.focus(t+delta),375,selected,375)[1];
    speeds.push((a.y-b.y)/(2*delta));
  }
  assert.ok(Math.max(...speeds)/Math.min(...speeds)<1.03,JSON.stringify(speeds));
  const pickup=verticalPickupFocus(layout,375,375,selected,-16.875);
  assert.ok(Math.abs(verticalFieldPoses(layout,pickup,375,selected,375)[0].y+16.875)<1e-6);
});

test('first prompt engages from rest and joins the wheel at the same pose and velocity',()=>{
  const from={y:-17,rotation:0,scale:1.5};
  const to={y:-64,rotation:6,scale:1.36,velocity:-72,rotationVelocity:9,scaleVelocity:-.18};
  const duration=.8,epsilon=.00001;
  const first=engagePromptPose(from,to,0,duration),last=engagePromptPose(from,to,1,duration);
  assert.deepEqual(first,from);assert.equal(last.y,to.y);assert.equal(last.scale,to.scale);assert.equal(last.rotation,to.rotation);
  const afterStart=engagePromptPose(from,to,epsilon,duration);
  assert.ok(Math.abs((afterStart.y-first.y)/(epsilon*duration))<.01);
  const beforeEnd=engagePromptPose(from,to,1-epsilon,duration);
  for(const [key,velocity] of [['y','velocity'],['rotation','rotationVelocity'],['scale','scaleVelocity']])assert.ok(Math.abs((last[key]-beforeEnd[key])/(epsilon*duration)-to[velocity])<.01);
  let previous=from.y;
  for(let p=.01;p<=1;p+=.01){const current=engagePromptPose(from,to,p,duration);assert.ok(current.y<=previous&&current.y>=to.y);previous=current.y;}
});
