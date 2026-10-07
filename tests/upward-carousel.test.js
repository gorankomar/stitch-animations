import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleUpwardCarousel as sample } from '../src/lib/effects/upward-carousel.js';
import { carouselOptions } from '../src/embeds/fallback-retry.js';
const options={visibleSlots:4,scaleMode:'edges',spacing:54};
test('four visible rows remain full scale with two concealed recycling slots',()=>{
 const poses=Array.from({length:6},(_,i)=>sample(0,i,770,x=>x,options));
 assert.deepEqual(poses.map(p=>p.opacity),[1,1,1,1,0,0]);
 assert.deepEqual(poses.slice(0,4).map(p=>p.scale),[1,1,1,1]);
 assert.deepEqual(poses.map(p=>p.y),[0,54,108,162,216,-54]);
});
test('only exiting and entering rows scale and opacity stays linear',()=>{
 const poses=Array.from({length:6},(_,i)=>sample(3080,i,770,()=>.8,options));
 assert.equal(poses[0].opacity,.5);assert.equal(poses[4].opacity,.5);
 assert.ok(poses[0].scale<1);assert.ok(poses[4].scale<1);
 for(const i of [1,2,3])assert.equal(poses[i].scale,1);
 assert.equal(poses[5].opacity,0);
});
test('all six turns preserve order and loop seam without visible recycling',()=>{
 for(let turn=0;turn<12;turn++) {
  const poses=Array.from({length:6},(_,i)=>sample(turn*3850,i,770,x=>x,options));
  assert.equal(poses.filter(p=>p.opacity===1).length,4);
  for(let j=0;j<4;j++)assert.equal(poses[(turn+j)%6].y,54*j);
 }
 for(let i=0;i<6;i++)assert.deepEqual(sample(0,i,770,x=>x,options),sample(23100,i,770,x=>x,options));
 for(let t=0;t<3850;t+=11)assert.equal(sample(t,5,770,x=>x,options).opacity,0);
});
test('legacy five-slot defaults and data attribute validation',()=>{
 assert.deepEqual(Array.from({length:5},(_,i)=>sample(0,i,770,x=>x).y),[0,50,100,-100,-50]);
 assert.equal(carouselOptions({dataset:{carouselVisibleSlots:'4',carouselScaleMode:'edges'}}).visibleSlots,4);
 assert.equal(carouselOptions({dataset:{carouselVisibleSlots:'0'}}),null);
});
