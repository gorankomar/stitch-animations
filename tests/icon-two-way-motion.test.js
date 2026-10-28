import test from 'node:test';
import assert from 'node:assert/strict';
import {createTwoWayMotion} from '../src/animations/icon-playground/two-way-motion.js';
const ease=t=>1-(1-t)**3;
for(const key of ['transactions','card-upload','onboarding','developers-guide','digital-wallets','digital-loans']){
 test(`${key} exits directly with primary easing, without a second anticipation`,()=>{
  const motion=createTwoWayMotion(key,ease);motion.setHovered(true);motion.advance(1000,1000);
  const end=[...motion.position];motion.setHovered(false);motion.advance(500,1000);
  end.forEach((value,i)=>assert.ok(Math.abs(motion.position[i]-value*(1-ease(.5)))<1e-9));
  let previous=motion.position.map(Math.abs);
  for(let i=0;i<5;i++){motion.advance(100,1000);motion.position.forEach((v,j)=>assert.ok(Math.abs(v)<=previous[j]+1e-9));previous=motion.position.map(Math.abs);}
  motion.position.forEach(v=>assert.ok(Math.abs(v)<1e-9));assert.equal(motion.active,false);
 });
 test(`${key} interruption and re-entry retain the current position`,()=>{
  const motion=createTwoWayMotion(key,ease);motion.setHovered(true);motion.advance(200,1000);
  const dip=[...motion.position];motion.setHovered(false);assert.deepEqual(motion.position,dip);
  motion.advance(200,1000);const duringExit=[...motion.position];motion.setHovered(true);assert.deepEqual(motion.position,duringExit);
  motion.advance(0,1000);assert.deepEqual(motion.position,duringExit);
 });
}
test('final hover leg uses the primary curve directly for all three tracks',()=>{
 for(const [key,dip,end] of [['transactions',[-.65,0],[1.4,0]],['card-upload',[0,.85],[0,-.6]],['onboarding',[1,.8],[-.8,-.65]]]){
  const motion=createTwoWayMotion(key,ease);motion.setHovered(true);motion.advance(720,1000);
  end.forEach((v,i)=>assert.ok(Math.abs(motion.position[i]-(dip[i]+(v-dip[i])*ease(.5)))<1e-9));
 }
});

test('developer slash contracts to half height then extends to 120 percent',()=>{
 const motion=createTwoWayMotion('developers-guide',ease);
 motion.setHovered(true);motion.advance(400,1000);
 assert.equal(1+motion.position[0],.5);
 motion.advance(600,1000);assert.equal(1+motion.position[0],1.2);
 motion.setHovered(false);motion.advance(1000,1000);assert.equal(1+motion.position[0],1);
});
