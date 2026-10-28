import test from 'node:test';
import assert from 'node:assert/strict';
import {traceRoutes,routeProgress,traceDashState} from '../src/animations/icon-playground/stroke-trace.js';
test('transfer heads wait for their shaft and branch from the correct shared tip',()=>{
 const routes=traceRoutes('transactions',[]);
 assert.equal(routes.length,6);
 for(const [shaft,...heads] of [routes.slice(0,3),routes.slice(3)]){
  assert.equal(routeProgress(.69,shaft.start,shaft.end) > 0,true);
  for(const head of heads){assert.equal(head.start,shaft.end);assert.equal(routeProgress(.69,head.start,head.end),0);assert.equal(routeProgress(1,head.start,head.end),1);}
  assert.equal(heads[0].d.split('L')[0],heads[1].d.split('L')[0]);
 }
 assert.match(routes[0].d,/H13.3333$/);
 assert.match(routes[3].d,/H2.66659$/);
});
test('upload starts at arrow bottom and splits at the tip',()=>{
 const routes=traceRoutes('card-upload',[]);
 assert.equal(routes[0].d,'M8 13.3333V8.66667');
 for(const head of routes.slice(1)){assert.equal(head.start,routes[0].end);assert.match(head.d,/^M8 8.66667L/);}
});

test('completed trace has no dash seam and reversal restores drawing',()=>{
 assert.deepEqual(traceDashState(1),{array:'none',offset:0});
 assert.deepEqual(traceDashState(.9999999),{array:'none',offset:0});
 assert.deepEqual(traceDashState(.5),{array:'1 1',offset:.5});
});

test('clipping and mask paths cannot become visible effect artwork',async()=>{
 const {isArtworkPath}=await import('../src/animations/icon-playground/stroke-trace.js');
 for(const parent of ['defs','clipPath','mask'])assert.equal(isArtworkPath({closest:selector=>selector.includes(parent)?{}:null}),false);
 assert.equal(isArtworkPath({closest:()=>null}),true);
});
