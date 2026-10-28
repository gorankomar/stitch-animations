import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {paperAltState,paperPart,PAPER_ORIGINAL} from '../src/animations/icon-playground/paper-alt-motion.js';
test('only one exact original sheet is visible at both endpoints',()=>{
 const start=paperAltState(0),end=paperAltState(1);
 assert.equal(start.a.visible,true);assert.equal(start.b.visible,false);
 assert.equal(end.a.visible,false);assert.equal(end.b.visible,true);
 assert.equal(start.a.scale,1);assert.equal(end.b.scale,1);
 assert.equal(end.b.x,0);assert.equal(end.b.y,0);
 const source=fs.readFileSync(new URL('../src/embeds/icon-playground/assets/whitepapers.svg',import.meta.url),'utf8');
 const parts=source.match(/ d="([^"]+)"/)[1].match(/M[^M]*/g);
 [4,0,3,1,2].forEach((sourceIndex,i)=>{
  assert.equal(PAPER_ORIGINAL[i],parts[sourceIndex]);
  assert.equal(paperPart(i,start),parts[sourceIndex]);assert.equal(paperPart(i+5,end),parts[sourceIndex]);
 });
});
test('blank sheet changes position without a flip and old sheet collapses below it',()=>{
 const split=paperAltState(.5),drawing=paperAltState(.8);
 assert.equal(split.a.fold,0);assert.equal(split.b.fold,0);assert.equal(split.b.text,0);
 assert.ok(split.a.x<0&&split.b.x>0);assert.ok(split.a.scale<.7);
 assert.equal(drawing.swapped,true);assert.ok(drawing.a.text<1&&drawing.b.text>0);
 assert.equal('flip' in drawing.b,false);
});
