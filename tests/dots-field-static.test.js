import test from 'node:test';
import assert from 'node:assert/strict';
import { createDotsField } from '../src/lib/effects/dots-field.js';
test('non-interactive filled dots redraw on resize without pointer handlers or a running clock', () => {
 const saved = Object.fromEntries(['window','ResizeObserver'].map(k=>[k,globalThis[k]]));
 let redraw, removed=false, draws=0, arcs=0;
 const ctx={setTransform(){},clearRect(){draws++;},beginPath(){},arc(){arcs++;},fill(){}};
 const canvas={clientWidth:80,clientHeight:40,width:0,height:0,getContext:()=>ctx};
 globalThis.window={devicePixelRatio:1};
 globalThis.ResizeObserver=class {constructor(fn){redraw=fn;}observe(){}disconnect(){removed=true;}};
 try {
  const dispose=createDotsField({canvas,sensor:{},pointerTarget:{},interactive:false,options:{gap:16,radius:0}});
  assert.equal(draws,1);assert.ok(arcs>0);assert.equal(canvas.width,80);assert.equal(canvas.height,40);
  // Avoid snapshot creation while exercising another layout size.
  canvas.width=canvas.height=0;canvas.clientWidth=160;redraw();assert.equal(draws,2);assert.equal(canvas.width,160);
  dispose();assert.equal(removed,true);
 } finally {for(const [k,v] of Object.entries(saved)) v===undefined?delete globalThis[k]:globalThis[k]=v;}
});
