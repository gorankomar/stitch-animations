import test from 'node:test';
import assert from 'node:assert/strict';
import { createFollowGroup } from '../src/lib/effects/follow-group.js';

function fixture() {
  let serial = 0;
  const frames = new Map(), listeners = new Map();
  class Element {
    constructor() {
      this.dataset = { followDepth: '2' };
      this.style = { transform: 'translate(-50%, -50%) scale(.1)', translate: '2px 3px', willChange: 'opacity', removeProperty(key) { delete this[key]; } };
    }
  }
  globalThis.HTMLElement = Element;
  const layer = new Element();
  const root = {
    querySelectorAll: () => [layer],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }),
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name)
  };
  globalThis.window = {
    getComputedStyle: el => ({ transform: el.style.transform }),
    requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => frames.delete(id)
  };
  const tick = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); };
  return { root, layer, frames, listeners, tick, move: () => listeners.get('pointermove')({ clientX: 200, clientY: 100 }) };
}

test('independent follow moves immediately without capturing or overwriting the entrance transform', () => {
  const f = fixture();
  const stop = createFollowGroup({ root: f.root, independentTranslate: true });
  f.move(); f.tick();
  assert.notEqual(f.layer.style.translate, '2px 3px');
  assert.equal(f.layer.style.transform, 'translate(-50%, -50%) scale(.1)');
  // The entrance can continue changing the same element's transform while follow remains active.
  f.layer.style.transform = 'translate(-50%, -50%) scale(.7)';
  f.tick();
  assert.equal(f.layer.style.transform, 'translate(-50%, -50%) scale(.7)');
  stop();
  assert.equal(f.layer.style.translate, '2px 3px');
  assert.equal(f.layer.style.willChange, 'opacity');
  assert.equal(f.frames.size, 0);
  assert.equal(f.listeners.size, 0);
});

test('a paused orbit stops the follow clock until a new enabled pointer event', () => {
  const f = fixture(); let active = true;
  const stop = createFollowGroup({ root: f.root, independentTranslate: true, isEnabled: () => active });
  f.move(); f.tick(); const position = f.layer.style.translate;
  active = false; f.tick();
  assert.equal(f.frames.size, 0);
  f.move(); f.tick();
  assert.equal(f.layer.style.translate, position);
  active = true; f.move(); f.tick();
  assert.notEqual(f.layer.style.translate, position);
  stop();
});

test('existing consumers retain transform-based follow by default', () => {
  const f = fixture(); const stop = createFollowGroup({ root: f.root });
  f.move(); f.tick();
  assert.match(f.layer.style.transform, /scale\(\.1\).*translate3d/);
  assert.equal(f.layer.style.translate, '2px 3px');
  stop();
});
