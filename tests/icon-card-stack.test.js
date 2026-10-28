import test from 'node:test';
import assert from 'node:assert/strict';
import {cardStackOffsets,cardStackWidths,stackLayout} from '../src/animations/icon-playground/card-stack.js';
test('three cards spread evenly around the original center and collapse to one',()=>{
 assert.deepEqual(cardStackOffsets(0).map(v=>v||0),[0,0,0]);
 for(const p of [.25,.5,1]){
  const [top,middle,bottom]=cardStackOffsets(p);
  assert.equal(middle-top,bottom-middle);
  assert.equal(top+bottom,0);
  assert.ok(bottom>0);
 }
 assert.deepEqual(cardStackOffsets(1),[-2.2,0,2.2]);
});

test('rear cards narrow progressively while foreground retains its width',()=>{
 assert.deepEqual(cardStackWidths(0),[1,1,1]);
 assert.deepEqual(cardStackWidths(1),[.84,.92,1]);
 const [top,middle,front]=cardStackWidths(.5);assert.ok(top<middle&&middle<front);
});

test('whitepapers stack below a raised foreground without changing the card stack',()=>{
 const paper=stackLayout(1,{direction:'below',spacing:1.3});
 assert.deepEqual(paper.rear,[1.3,0]);assert.equal(paper.front,-1.3);
 assert.deepEqual(paper.widths,[.84,.92,1]);
 const cards=stackLayout(1);assert.deepEqual(cards.rear,[-2.2,0]);assert.equal(cards.front,2.2);
});

test('side papers spread symmetrically with space between matching full-width outlines',()=>{
 const paper=stackLayout(1,{direction:'sides',spacing:3.2});
 assert.deepEqual(paper.rearX,[-3.2,3.2]);
 assert.deepEqual(paper.rear,[0,0]);assert.equal(paper.front,0);
 assert.deepEqual(paper.widths,[1,1,1]);
 assert.ok(paper.rearX[1]-1.8>1);
 const closed=stackLayout(0,{direction:'sides',spacing:3.2});
 assert.ok(closed.rearX.every(x=>x===0));
});
