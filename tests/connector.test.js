import test from 'node:test';
import assert from 'node:assert/strict';
import { roundedPath, fillDot, paintPulse, setPath, pathLength } from '../src/lib/effects/connector.js';
const node = () => ({ attrs: {}, style: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; } });
test('routes handle reversed and coincident points without invalid coordinates', () => {
  for (const points of [[{x:20,y:0},{x:20,y:20},{x:0,y:20}], [{x:0,y:0},{x:0,y:0},{x:0,y:20}], [{x:0,y:0},{x:0,y:0}]]) {
    assert.doesNotMatch(roundedPath(points), /NaN|Infinity/);
  }
});
test('dot head fills downward and tail clears downward; leftward flow mirrors', () => {
  const n = node();
  fillDot(n, 0, -10); assert.equal(n.attrs.y, -4); assert.equal(n.attrs.height, 4);
  fillDot(n, 10, 0); assert.equal(n.attrs.y, 0); assert.equal(n.attrs.height, 4);
  fillDot(n, 20, 4); assert.equal(n.attrs.height, 0);
  fillDot(n, 0, -10, 0, 'x', -1); assert.equal(Math.abs(n.attrs.x), 0); assert.equal(n.attrs.width, 4);
});
test('branch pulse begins at the shared junction distance', () => {
  const n = node(); paintPulse(n, {head:100, span:34, length:300, offset:100});
  assert.equal(n.style.strokeDashoffset, '34');
});
test('path length cache invalidates only on geometry changes', () => {
  const n = node(); let reads = 0; n.getTotalLength = () => ++reads;
  setPath(n, 'M 0 0 L 2 0'); assert.equal(pathLength(n), 1);
  setPath(n, 'M 0 0 L 2 0'); assert.equal(pathLength(n), 1);
  setPath(n, 'M 0 0 L 3 0'); assert.equal(pathLength(n), 2);
});
