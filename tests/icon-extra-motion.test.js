import test from 'node:test';
import assert from 'node:assert/strict';
import {depositOffset,wholeMotion,pieceMotion,detailGeometry,walletConnection,WALLET_OPEN_DEGREES,searchOffset,globeWidth,globeVisibility,bindExtraMotion,transactionOffset} from '../src/animations/icon-playground/extra-motion.js';
test('deposit dips before its shorter upward lift',()=>{
 assert.equal(depositOffset(0),0);
 assert.ok(depositOffset(.2)>0);
 assert.ok(Math.abs(depositOffset(1)+.6)<1e-9);
});
test('globe rolls meridians without scaling strokes',()=>{
 const original='M8 1.3337C9.66749 3.15926 10.6151 5.52839 10.6666 8.00036C10.6151 10.4723 9.66749 12.8415 8 14.667';
 for(const p of [.25,.5,.75]) {
  const d=detailGeometry('globe',0,p,original);
  assert.match(d,/^M8 1.3337/);
  assert.match(d,/8 14.667$/);
  assert.equal(pieceMotion('globe',0,p,{}),'');
  const coordinates=d.match(/-?\d*\.?\d+/g).map(Number);
  assert.ok(Number.isFinite(coordinates[8]));
 }
 assert.equal(detailGeometry('globe',0,1,original),original);
});
test('integrations branches grow from a fixed center without stroke scaling',()=>{
 assert.match(detailGeometry('integrations',15,1,''),/^M5.6 .*L8 8$/);
 for(const index of [15,16,17]) assert.equal(pieceMotion('integrations',index,1,{}),'');
});
test('ledgers opens its cover without moving the entire icon',()=>{
 assert.equal(wholeMotion('ledgers',1),'');
 for(const index of [0,1]) assert.equal(pieceMotion('ledgers',index,1,{}),'');
});

test('cards have no flip or whole-icon transform',()=>{for(const key of ['cards','credit-card'])assert.equal(wholeMotion(key,1),'');});

test('wallet back rotates while its closing endpoint stays attached to the rim',()=>{
 for(const p of [0,.25,.5,1]){
  const {x,y}=walletConnection(p);const angle=-p*WALLET_OPEN_DEGREES*Math.PI/180;
  const worldX=2+(x-2)*Math.cos(angle)-(y-3.33333)*Math.sin(angle);
  const worldY=3.33333+(x-2)*Math.sin(angle)+(y-3.33333)*Math.cos(angle);
  assert.ok(Math.abs(worldX-11.3333)<1e-9);
  assert.ok(Math.abs(worldY-4.66667)<1e-9);
 }
 assert.equal(wholeMotion('loans',1),'');
 assert.equal(pieceMotion('loans',2,1,{}),'rotate(-10deg)');
});

test('stronger anticipation preserves approved deposit and search endpoints',()=>{
 assert.ok(Math.abs(depositOffset(.4)-.85)<1e-9);
 assert.ok(Math.abs(depositOffset(1)+.6)<1e-9);
 assert.deepEqual(searchOffset(0),{x:0,y:0});
 assert.deepEqual(searchOffset(.4),{x:1,y:.8});
 assert.ok(Math.abs(searchOffset(1).x+.8)<1e-9);
 assert.ok(Math.abs(searchOffset(1).y+.65)<1e-9);
});

test('anticipation has a true dwell and soft arrivals/departures',()=>{
 const ease=t=>1-(1-t)**3;
 const delta=.0001;
 for(const sample of [.34,.38,.44])assert.ok(Math.abs(depositOffset(sample,ease)-.85)<1e-9);
 assert.ok(Math.abs(depositOffset(.34-delta,ease)-.85)<1e-7);
 assert.ok(Math.abs(depositOffset(.44+delta,ease)-.85)<1e-7);
 assert.ok(Math.abs(depositOffset(delta,ease))<1e-7);
 assert.ok(Math.abs(searchOffset(.34,ease).x-searchOffset(.44,ease).x)<1e-9);
});

test('globe meridians remain inside the rim and coincident curves are occluded',()=>{
 for(let step=0;step<=100;step++){
  const p=step/100;
  for(const index of [0,1,5])assert.ok(Math.abs(globeWidth(index,p))<=(index===5?6.6667:4.80001));
 }
 assert.ok(globeVisibility(1,.25)<.001);
 assert.equal(globeVisibility(5,0),0);
 assert.equal(globeVisibility(5,1),0);
});

test('third meridian reaches the rim before hiding, without timed interior fades',()=>{
 assert.ok(Math.abs(globeWidth(5,0)-6.66663)<1e-9);
 assert.ok(Math.abs(globeWidth(5,.5)+6.66663)<1e-9);
 assert.ok(Math.abs(globeWidth(5,1)-6.66663)<1e-9);
 for(const p of [.01,.1,.3,.7,.95,.99])assert.equal(globeVisibility(5,p),1);
});

test('hidden effect layers share the visible source expansion measurements',()=>{
 function path(stroke,box){const attrs={stroke,d:'M10 4L12 6'};return {classList:['motion-piece-0'],style:{},dataset:{},getAttribute:name=>attrs[name],setAttribute:(name,value)=>{attrs[name]=value;},getBBox:()=>box};}
 const base=path('var(--base-color)',{x:10,y:4,width:2,height:2});
 const hidden=path('var(--hover-color)',{x:0,y:0,width:0,height:0});hidden.style.display='none';
 const svg={querySelectorAll:selector=>selector==='path'?[base,hidden]:[]};
 const render=bindExtraMotion(svg,'integrations');render(1);
 assert.equal(base.style.transform,'translate(0.375px, -0.375px)');
 assert.equal(hidden.style.transform,base.style.transform);
 render(0);assert.equal(hidden.style.transform,base.style.transform);
});

test('transactions pull back then use the default ease for the final outward leg',()=>{
 const ease=t=>1-(1-t)**3;
 assert.equal(transactionOffset(0,ease),0);
 assert.ok(transactionOffset(.2,ease)<0);
 assert.ok(Math.abs(transactionOffset(.34,ease)+.65)<1e-9);
 assert.ok(Math.abs(transactionOffset(.44,ease)+.65)<1e-9);
 assert.ok(Math.abs(transactionOffset(1,ease)-1.4)<1e-9);
 const time=.44+.56*.5;
 assert.ok(Math.abs(transactionOffset(time,ease)-(-.65+2.05*ease(.5)))<1e-9);
});
