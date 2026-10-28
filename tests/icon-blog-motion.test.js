import test from 'node:test';
import assert from 'node:assert/strict';
import {blogScroll,blogPose,blogTextGeometry} from '../src/animations/icon-playground/blog-motion.js';
test('blog scroll presents three pages with a middle reading pause',()=>{
 assert.equal(blogScroll(0),0);assert.equal(blogScroll(.42),10);assert.equal(blogScroll(.58),10);assert.equal(blogScroll(1),20);
 for(const p of [0,.25,.5,.75,1]){assert.equal(blogPose(1,p), '');assert.equal(blogPose(3,p),'');}
 assert.equal(blogPose(11,1),'translate(6.66667px, 0px)');
 assert.equal(blogPose(9,1),'translate(-8px, 0px)');
});
test('middle text lines draw in order while preserving constant stroke width',()=>{
 assert.ok(Math.abs(Number(blogTextGeometry(5,.2).split('H')[1])-6)<1e-9);
 assert.match(blogTextGeometry(8,.2),/H2.001$/);
 assert.match(blogTextGeometry(5,.58),/H14$/);
 assert.match(blogTextGeometry(8,.58),/H11$/);
});
