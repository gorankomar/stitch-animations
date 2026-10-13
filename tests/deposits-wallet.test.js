import test from 'node:test';
import assert from 'node:assert/strict';
import { addedProgress, addedFillOpacity, init } from '../src/embeds/deposits-wallet.js';

test('Added stays gray until the pulse arrives, fills during traversal and resets for another pulse', () => {
  const options = { start: 2, period: 6, distance: 48, width: 48, speed: 48 };
  assert.equal(addedProgress(1, options), 0);
  assert.equal(addedProgress(2.9, options), 0);
  assert.equal(addedProgress(3.5, options), .5);
  assert.equal(addedProgress(5, options), 1);
  assert.equal(addedProgress(8, options), 0);
  assert.equal(addedProgress(9.5, options), .5);
});

test('blue fill fades linearly for one second, then rests for half a second before the next pulse', () => {
  const options = { start: 2, period: 6.5, fadeStart: 5, fadeDuration: 1 };
  assert.equal(addedFillOpacity(6.99, options), 1);
  assert.equal(addedFillOpacity(7.5, options), .5);
  assert.equal(addedFillOpacity(8, options), 0);
  assert.equal(addedFillOpacity(8.49, options), 0);
  assert.equal(addedFillOpacity(8.5, options), 1);
});

function fixture({ missingTokens = false, failObserver = false, reduced = false } = {}) {
  const keys = ['window', 'document', 'getComputedStyle', 'matchMedia', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = keys.map(k => [k, globalThis[k]]), frames = new Map(), events = new Map(), observers = [], animations = [], generated = new Set();
  let serial = 0;
  const node = () => ({ dataset: {}, attrs: new Map(), style: { transform: '', opacity: '', backgroundImage: '', getPropertyValue(k) { return this[k] || ''; }, setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } }, getAttribute(k) { return this.attrs.get(k) ?? null; }, setAttribute(k,v) { this.attrs.set(k,v); }, removeAttribute(k) { this.attrs.delete(k); }, getBoundingClientRect: () => ({ left: 0, top: 0, right: 593, bottom: 308, width: 593, height: 308 }), animate() { const a = { currentTime: 0, pause() {}, cancel() { this.cancelled = true; } }; animations.push(a); return a; } });
  const root = node(), frame = node(), hard = Array.from({ length: 4 }, node), soft = Array.from({ length: 6 }, node), rings = Array.from({ length: 3 }, node), path = node(), badge = node(), balance = node(), dots = node(), canvas = node();
  balance.textContent = '$25,450.00';
  root.clientWidth = 593; root.isConnected = true;
  root.matches = s => s === '[data-deposits-wallet]';
  root.querySelectorAll = s => ({ '[data-dw-hard]': hard, '[data-dw-soft]': soft, '[data-dw-ring]': rings })[s] || [];
  root.querySelector = s => ({ '.dw-frame-1': frame, '[data-dw-pulse]': path, '.dw-added': badge, '.dw-balance-value': balance, '.dw-balance': soft[1], '.dw-dots': dots, '[data-dw-dots]': canvas })[s];
  canvas.getContext = () => null;
  path.getTotalLength = () => 155;
  path.parentNode = { append(n) { generated.add(n); } };
  path.cloneNode = () => { const n = node(); n.remove = () => generated.delete(n); return n; };
  const media = { matches: reduced, addEventListener(k, fn) { events.set('motion', fn); }, removeEventListener() { events.delete('motion'); } };
  const tokens = { '--motion-ease-primary': 'cubic-bezier(.11,.61,.27,.99)', '--motion-duration-default': '770ms', '--reveal-stagger-default': '200ms', '--reveal-opacity-ratio': '.34' };
  globalThis.getComputedStyle = () => ({ getPropertyValue: k => missingTokens ? '' : tokens[k] || '' });
  globalThis.window = {}; globalThis.document = { hidden: false, addEventListener(k, fn) { events.set(k, fn); }, removeEventListener(k) { events.delete(k); } };
  globalThis.matchMedia = () => media;
  globalThis.requestAnimationFrame = fn => { frames.set(++serial, fn); return serial; }; globalThis.cancelAnimationFrame = id => frames.delete(id);
  globalThis.IntersectionObserver = class { constructor(fn) { if (failObserver) throw Error('unavailable'); this.fn = fn; observers.push(this); } observe() {} disconnect() {} };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  return { root, hard, soft, balance, frames, events, media, generated, animations, observers, visible(v = true) { observers.at(-1).fn([{ isIntersecting: v, intersectionRatio: v ? 1 : 0 }]); }, tick(now = 100) { const [id, fn] = frames.entries().next().value; frames.delete(id); fn(now); }, restore() { for (const [k, v] of saved) v === undefined ? delete globalThis[k] : globalThis[k] = v; } };
}

test('duplicate mounts share one stage; hard reveal remains opaque and disposal restores all layers', () => {
  const f = fixture();
  try {
    const dispose = init(f.root); init(f.root);
    assert.equal(f.observers.length, 1);
    assert.equal(f.generated.size, 27);
    f.hard.forEach(n => { assert.equal(n.style.opacity, ''); assert.match(n.style.transform, /translate3d/); });
    f.soft.forEach(n => assert.equal(n.style.opacity, '0'));
    f.visible(); f.tick(); dispose();
    assert.equal(f.frames.size, 0); assert.equal(f.events.size, 0); assert.equal(f.generated.size, 0);
    [...f.hard, ...f.soft].forEach(n => { assert.equal(n.style.transform, ''); assert.equal(n.style.opacity, ''); });
    assert.equal(f.root.getAttribute('data-dw-ready'), null);
  } finally { f.restore(); }
});

test('offscreen and hidden stages stop their clocks; reduced motion restores content and stops rings', () => {
  const f = fixture();
  try {
    const dispose = init(f.root); f.visible(); f.tick(); f.visible(false);
    assert.equal(f.frames.size, 0);
    f.visible(); document.hidden = true; f.events.get('visibilitychange')(); assert.equal(f.frames.size, 0);
    document.hidden = false; f.media.matches = true; f.events.get('motion')(); f.tick();
    [...f.hard, ...f.soft].forEach(n => assert.equal(n.style.transform, ''));
    assert.ok(f.animations.every(a => a.cancelled)); assert.equal(f.frames.size, 0);
    assert.equal(f.root.style.getPropertyValue('--dw-added-progress'), '1'); dispose();
  } finally { f.restore(); }
});

for (const option of ['missingTokens', 'failObserver']) test(`${option} preserves the static fallback`, () => {
  const f = fixture({ [option]: true }), warn = console.warn; console.warn = () => {};
  try { const dispose = init(f.root); assert.equal(f.frames.size, 0); assert.equal(f.generated.size, 0); [...f.hard, ...f.soft].forEach(n => assert.equal(n.style.transform, '')); dispose(); }
  finally { console.warn = warn; f.restore(); }
});

 test('shared balance counter rises from zero after its panel reveal and restores on disposal', () => {
  const f = fixture();
  try {
    const dispose = init(f.root);
    assert.equal(f.balance.textContent, '$0.00');
    f.visible();
    for (let now = 0; now <= 1850; now += 50) f.tick(now);
    const midway = Number(f.balance.textContent.replace(/[^0-9.]/g, ''));
    assert.ok(midway > 0 && midway < 25450);
    for (let now = 1900; now <= 3500; now += 50) f.tick(now);
    assert.equal(f.balance.textContent, '$25,450.00');
    dispose(); assert.equal(f.balance.textContent, '$25,450.00');
  } finally { f.restore(); }
});
