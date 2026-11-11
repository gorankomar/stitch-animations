import test from 'node:test';
import assert from 'node:assert/strict';
import { init } from '../src/embeds/real-ai-product.js';

for (const initiallyVisible of [false, true]) test(`fields start with screen; bar waits for completed lock update and viewport (initially visible: ${initiallyVisible})`, () => {
  const keys = ['document', 'window', 'matchMedia', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'DOMMatrixReadOnly'];
  const saved = keys.map(key => [key, globalThis[key]]);
  const observers = [], frames = new Map();
  let id = 0, timestamp = 100;
  const node = () => ({ dataset: {}, style: { removeProperty(key) { delete this[key]; } }, tracks: [],
    getBoundingClientRect: () => ({ top: 100, bottom: 200, left: 0, right: 100 }),
    animate(keyframes, options) {
      const track = { currentTime: 0, options, effect: { setKeyframes() {} }, pause() {}, cancel() { this.cancelled = true; } };
      this.tracks.push(track); return track;
    }
  });
  const stage = node(), frame = node(), bar = node(), lock = node(), updated = node(), value = node(), control = node(), marker = node();
  bar.parentElement = frame; bar.closest = () => frame;
  let restingTop = initiallyVisible ? 799 : 900;
  frame.getBoundingClientRect = () => ({ top: restingTop + 800, bottom: restingTop + 900, left: 0, right: 100 }); value.parentElement = control; value.textContent = 'USD'; lock.textContent = '3';
  const field = { querySelector: selector => selector === '[data-product-value]' ? value : marker };
  stage.querySelector = selector => ({ '[data-product-bar]': bar, '[data-product-lock]': lock, '[data-product-updated]': updated })[selector];
  stage.querySelectorAll = selector => selector === '[data-product-field]' ? [field] : [];
  stage.matches = () => true;
  globalThis.document = { documentElement: { addEventListener() {}, removeEventListener() {} }, hidden: false, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, getComputedStyle: () => ({ getPropertyValue: key => key === '--reveal-duration-default' ? '100ms' : '' }) };
  globalThis.getComputedStyle = () => ({ transform: 'matrix(1,0,0,1,0,800)' });
  globalThis.DOMMatrixReadOnly = class { m41 = 0; m42 = 800; };
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = key => frames.delete(key);
  const tick = () => { const pending = [...frames.values()]; frames.clear(); timestamp += 50; pending.forEach(callback => callback(timestamp)); };
  try {
    const dispose = init(stage);
    init(stage);
    assert.equal(observers.length, 1);
    observers[0].callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    tick();
    assert.equal(stage.tracks[0].currentTime, 0);
    assert.equal(value.textContent, 'USD'); // Filling starts on the first screen frame.
    assert.equal(lock.textContent, '2');
    assert.equal(frame.tracks[0].currentTime, 0); // Even an onscreen bar waits for completion.
    tick();
    assert.equal(lock.textContent, '2');
    assert.equal(frame.tracks[0].currentTime, 0);
    tick();
    assert.equal(lock.textContent, '3');
    assert.equal(frame.tracks[0].currentTime, 0);
    if (!initiallyVisible) {
      for (let i = 0; i < 15; i++) tick();
      assert.equal(value.textContent, 'USD');
      assert.equal(lock.textContent, '3');
      assert.equal(frame.tracks[0].currentTime, 0);
      assert.ok(!observers[0].disconnected);
      restingTop = 799; // Resting frame enters; translated bounds remain offscreen.
      tick();
    }
    tick();
    assert.ok(frame.tracks[0].currentTime > 0);
    for (let i = 0; i < 20; i++) tick();
    assert.equal(value.textContent, 'USD');
    assert.equal(lock.textContent, '3');
    assert.ok(observers.every(observer => observer.disconnected));
    dispose();
    assert.equal(frames.size, 0);
    assert.ok(frame.tracks[0].cancelled);
  } finally {
    for (const [key, value] of saved) value === undefined ? delete globalThis[key] : globalThis[key] = value;
  }
});
