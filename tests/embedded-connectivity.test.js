import { test } from 'node:test';
import assert from 'node:assert/strict';

const frames = new Map(), observers = [], events = new Map();
let nextFrame = 0, now = 1000;
const motion = { matches: false, addEventListener(_, fn) { this.changed = fn; }, removeEventListener() {} };
globalThis.window = {};
globalThis.document = { readyState: 'loading', hidden: false, addEventListener(name, fn) { events.set(name, fn); }, removeEventListener() {} };
globalThis.matchMedia = () => motion;
globalThis.requestAnimationFrame = fn => { frames.set(++nextFrame, fn); return nextFrame; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.IntersectionObserver = class { constructor(fn) { this.changed = fn; observers.push(this); } observe() {} disconnect() {} };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
const { init, endpoint, wave } = await import('../src/embeds/embedded-connectivity.js');
const style = () => ({ setProperty(name, value) { this[name] = value; }, removeProperty(name) { delete this[name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]; } });
function fixture() {
  const cards = ['top', 'right', 'bottom', 'left'].map(ecCard => ({ dataset: { ecCard }, style: style() }));
  const rings = ['outer', 'middle', 'inner'].map(ecRing => ({ dataset: { ecRing }, style: style() }));
  const pulses = cards.map(card => ({ dataset: { ecPulse: card.dataset.ecCard }, style: style(), setAttribute() {} }));
  const stage = { querySelectorAll(selector) { return selector === '[data-ec-card]' ? cards : selector === '[data-ec-ring]' ? rings : selector === '[data-ec-pulse]' ? pulses : []; } };
  const root = { querySelectorAll() { return [stage]; } };
  const dispose = init(root), observer = observers.at(-1);
  return { cards, rings, pulses, root, dispose, observer };
}
function advance(seconds) {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    now += 1000 / 60;
    const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now));
  }
}
const scale = node => Number(node.style.transform.match(/scale\(([^)]+)\)/)[1]);

test('one outward pulse drives directional card response and diminishing rings', () => {
  const f = fixture();
  f.observer.changed([{ isIntersecting: true, intersectionRatio: 1 }]);
  advance(.8);
  assert.ok(f.pulses.every(p => p.style.opacity === '1'));
  const earlier = f.pulses[0].style.strokeDashoffset;
  advance(.2);
  assert.ok(f.pulses[0].style.strokeDashoffset < earlier);
  advance(1.1);
  assert.match(f.cards[0].style.transform, /translate\(0cqi, -/);
  assert.match(f.cards[1].style.transform, /translate\(0\.[\d]+cqi, 0cqi\)/);
  assert.match(f.cards[2].style.transform, /translate\(0cqi, 0\./);
  assert.match(f.cards[3].style.transform, /translate\(-/);
  assert.ok(scale(f.cards[0]) > 1 && scale(f.cards[0]) <= 1.012);
  assert.ok(f.rings[2].style['--ec-wave-scale'] > f.rings[1].style['--ec-wave-scale']);
  advance(2);
  assert.ok(f.cards.every(c => scale(c) === 1));
  assert.ok(f.rings.every(r => r.style['--ec-wave-opacity'] === 0));
  assert.ok(f.pulses.every(p => p.style.opacity === '0'));
  f.dispose();
});

test('repeat mounts stay single; offscreen and hidden states pause; reduced motion resets', () => {
  const f = fixture(), count = observers.length;
  init(f.root); assert.equal(observers.length, count);
  f.observer.changed([{ isIntersecting: true, intersectionRatio: 1 }]); advance(2.1);
  const before = f.cards[0].style.transform;
  f.observer.changed([{ isIntersecting: false, intersectionRatio: 0 }]);
  advance(1); assert.equal(f.cards[0].style.transform, before); assert.equal(frames.size, 0);
  f.observer.changed([{ isIntersecting: true, intersectionRatio: 1 }]);
  document.hidden = true; events.get('visibilitychange')(); assert.equal(frames.size, 0);
  document.hidden = false; events.get('visibilitychange')();
  motion.matches = true; motion.changed(); advance(.1);
  assert.ok(f.cards.every(c => scale(c) === 1));
  assert.ok(f.rings.every(r => r.style['--ec-wave-opacity'] === 0));
  assert.ok(f.pulses.every(p => p.style.opacity === '0')); assert.equal(frames.size, 0);
  f.dispose(); motion.matches = false;
});


test('dots stay centered on moving border strokes and waves only expand while visible', () => {
  for (const push of [0, .25, .75, 1]) {
    const s = 1 + push * .012, m = push * 1.2;
    assert.deepEqual(endpoint('top', push), [129, 44 - m + 15.5 * s]);
    assert.deepEqual(endpoint('right', push), [206 + m - 20.5 * s, 118]);
    assert.deepEqual(endpoint('bottom', push), [129, 190 + m - 15.5 * s]);
    assert.deepEqual(endpoint('left', push), [51 - m + 20.5 * s, 118]);
  }
  let previous = 1;
  for (let t = 1.36; t < 3.15; t += .05) {
    const state = wave(t, 1.35, .09);
    assert.ok(state.scale > previous); previous = state.scale;
    assert.ok(state.opacity > 0);
  }
  assert.equal(wave(3.16, 1.35, .09).opacity, 0);
});
