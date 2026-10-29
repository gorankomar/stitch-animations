import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/animations/orbit/index.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace('export function init', 'function init');

function fixture({ reduced = false, count = 9, landscape = false, prepared = 3, requested = null } = {}) {
  const frames = new Map(), animations = [], followers = [], observers = [], resize = [];
  let serial = 0;
  const style = () => ({ setProperty(k, v) { this[k] = String(v); } });
  const element = () => ({
    style: style(), dataset: {}, attrs: new Map(),
    getAttribute(k) { return this.attrs.get(k) ?? null; },
    setAttribute(k, v) { this.attrs.set(k, v); },
    removeAttribute(k) { this.attrs.delete(k); if (k === 'style') this.style = style(); },
    animate(keyframes, options) {
      let resolve, reject;
      const animation = { keyframes, options, paused: false, cancelled: false, finished: new Promise((a, b) => { resolve = a; reject = b; }), cancel() { this.cancelled = true; reject(Error('cancelled')); }, pause() { this.paused = true; }, play() { this.paused = false; }, resolve };
      animations.push(animation); return animation;
    }
  });
  const rings = Array.from({length: prepared}, (_, i) => 66 + 100 * i / Math.max(1, prepared - 1)).map(radius => Object.assign(element(), { width: radius * 2, offsetLeft: 129, offsetTop: 192, getBoundingClientRect: () => ({ width: radius * .2, left: 0, top: 0 }) }));
  const dots = Array.from({ length: count }, () => {
    const inner = element();
    return Object.assign(element(), { querySelector: () => inner, getBoundingClientRect: () => ({ width: 28 }) });
  });
  const section = Object.assign(element(), { matches: () => true, addEventListener() {}, removeEventListener() {}, closest() { return this; }, querySelectorAll: () => [wrap] });
  if (requested !== null) section.setAttribute('data-orbit-rings', String(requested));
  const wrap = Object.assign(element(), {
    clientWidth: 258, clientHeight: 232, closest: () => section, getBoundingClientRect: () => ({ width: 258, height: 232 }), querySelector: () => null,
    querySelectorAll(selector) { if (selector === '*') return [...rings, ...dots]; if (selector.includes('ring')) return rings; if (selector.includes('dot')) return dots; return []; }
  });
  const media = { matches: reduced, addEventListener() {}, removeEventListener() {} };
  const listeners = new Map();
  const document = { hidden: false, addEventListener(name, fn) { listeners.set(name, fn); }, removeEventListener(name) { listeners.delete(name); }, querySelectorAll: () => [section], documentElement: {} };
  const context = vm.createContext({
    document, window: { requestAnimationFrame: cb => { frames.set(++serial, cb); return serial; }, cancelAnimationFrame: id => frames.delete(id), addEventListener() {}, removeEventListener() {}, clearTimeout() {}, setTimeout: () => 1, matchMedia: () => media, getComputedStyle: el => ({ zIndex: '1', width: `${el.width}px` }) },
    getComputedStyle: el => ({ width: `${el.width}px`, getPropertyValue: key => key === '--orbit-layout' && landscape ? 'landscape' : '0' }),
    byData: () => '[data-anim="orbit"]', qsa: (selector, root) => selector === '[data-follow-mouse]' ? [...rings, ...dots] : root.querySelectorAll(selector),
    ATTR: { anim: 'anim' }, DATA_ATTRS: { orbit: 'orbit' },
    ensureSectionReveal: () => ({ ensure() {}, cancel() {} }), whenVisible: (_, cb) => cb(), resolveVisibilityThreshold: () => .35,
    createFollowGroup: options => { const follower = { options, disposed: false }; followers.push(follower); return () => { follower.disposed = true; }; },
    readMotionEaseValue: () => 'cubic-bezier(.11,.61,.27,.99)', getDefaultDurationMs: () => 770,
    observeResize: (_, cb) => { resize.push(cb); return () => {}; },
    IntersectionObserver: class { constructor(cb) { this.cb = cb; observers.push(this); } observe() {} disconnect() { this.stopped = true; } },
    setTimeout, clearTimeout
  });
  vm.runInContext(source + '\nthis.api = { init, createOrbitWrapController, computeOrbitLayout };', context);
  const tick = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); };
  return { ...context.api, wrap, section, rings, dots, animations, followers, frames, media, resize, tick, document, observers, listeners };
}

test('orbit follow mounts before the pop-in and uses an independent transform channel', () => {
  const f = fixture(); const controller = f.createOrbitWrapController(f.wrap);
  controller.layout();
  assert.equal(f.followers.length, 1);
  assert.equal(f.followers[0].options.independentTranslate, true);
  controller.play({ ease: 'linear' });
  assert.ok(f.animations.length > 0);
  assert.equal(f.followers[0].disposed, false);
  controller.setPaused(true);
  assert.ok(f.animations.every(animation => animation.paused));
  controller.setPaused(false);
  assert.ok(f.animations.every(animation => !animation.paused));
  controller.dispose();
  assert.ok(f.followers.every(follower => follower.disposed));
});

test('layout uses untransformed ring geometry and places every author-added dot', () => {
  for (const count of [1, 2, 9, 12, 20]) {
    const f = fixture({ count }); const layout = f.computeOrbitLayout(f.wrap);
    assert.deepEqual(Array.from(layout.ringInfo, ring => ring.radius), [66, 116, 166]);
    assert.equal(layout.dotPlacements.length, count);
    for (const p of layout.dotPlacements) {
      assert.ok(p.x >= 14 && p.x <= 244);
      assert.ok(p.y >= 0 && p.y <= 232);
      assert.ok(Math.abs(Math.hypot(p.x - p.centerX, p.y - p.centerY) - p.radius) < 1e-8);
    }
  }
});

test('reduced motion keeps every dot visible without entrance or follow', () => {
  const f = fixture({ reduced: true }); const controller = f.createOrbitWrapController(f.wrap);
  controller.layout(); controller.play({ ease: 'linear' });
  assert.equal(f.animations.length, 0);
  assert.equal(f.followers.length, 0);
  assert.ok(f.dots.every(dot => dot.style.opacity === '1'));
  controller.dispose();
});

test('duplicate mounts are ignored; disposing before the first frame cancels setup and allows remount', () => {
  const f = fixture(); const stop = f.init(); const duplicate = f.init();
  assert.equal(f.frames.size, 1);
  duplicate(); stop(); f.tick();
  assert.equal(f.animations.length, 0);
  assert.equal(f.frames.size, 0);
  const again = f.init(); f.tick(); f.tick();
  assert.ok(f.animations.length > 0);
  again(); assert.equal(f.frames.size, 0);
});


test('offscreen and hidden-tab observers pause active entrances without hiding the static fallback', () => {
  const f = fixture(); const stop = f.init(); f.tick(); f.tick();
  f.observers[0].cb([{ isIntersecting: false }]);
  assert.ok(f.animations.every(animation => animation.paused));
  assert.equal(f.followers.at(-1).options.isEnabled(), false);
  f.observers[0].cb([{ isIntersecting: true }]);
  assert.ok(f.animations.every(animation => !animation.paused));
  f.document.hidden = true; f.listeners.get('visibilitychange')();
  assert.ok(f.animations.every(animation => animation.paused));
  f.document.hidden = false; f.listeners.get('visibilitychange')();
  assert.ok(f.animations.every(animation => !animation.paused));
  stop(); assert.equal(f.listeners.size, 0);
});


test('resizing interrupts the entrance and lays dots onto the newly sized rings immediately', () => {
  const f = fixture(); const controller = f.createOrbitWrapController(f.wrap);
  controller.layout(); controller.observe(); controller.play({ ease: 'linear' });
  const previous = f.dots[0].style.left;
  f.rings.forEach(ring => { ring.width *= .5; ring.offsetLeft *= .5; ring.offsetTop *= .5; });
  f.wrap.clientWidth = 129; f.wrap.clientHeight = 116;
  f.wrap.getBoundingClientRect = () => ({ width: 129, height: 116 });
  f.resize[0]();
  assert.notEqual(f.dots[0].style.left, previous);
  assert.ok(f.followers.slice(0, -1).every(follower => follower.disposed));
  controller.dispose();
});


test('a partial entrance failure restores visible native styles and removes observers', () => {
  const f = fixture(); f.rings[0].animate = () => { throw Error('animation unavailable'); };
  const stop = f.init(); f.tick(); f.tick();
  assert.ok(f.dots.every(dot => dot.style.opacity !== '0'));
  assert.ok(f.rings.every(ring => ring.style.opacity !== '0'));
  assert.ok(f.followers.every(follower => follower.disposed));
  assert.equal(f.frames.size, 0);
  assert.equal(f.listeners.size, 0);
  assert.ok(f.observers.every(observer => observer.stopped));
  stop();
});


test('the initial resize notification on every replay must not cancel the reveal', () => {
  const f = fixture();
  for (let replay = 0; replay < 3; replay++) {
    const stop = f.init(); f.tick(); f.tick();
    const current = f.animations.filter(animation => !animation.cancelled);
    assert.ok(current.length > 0);
    f.resize.at(-1)();
    assert.ok(current.every(animation => !animation.cancelled));
    const ringEnd = Math.max(...current.filter(animation => animation.keyframes[0].transform?.startsWith('translate(-50%')).map(animation => animation.options.delay + animation.options.duration));
    const paths = current.filter(animation => 'left' in animation.keyframes[0]);
    assert.equal(paths.length, 9);
    assert.ok(paths.every(animation => animation.options.delay > 0));
    assert.ok(paths.some(animation => animation.options.delay + animation.options.duration > ringEnd));
    assert.ok(paths.every(animation => animation.keyframes.length === 49));
    stop();
  }
});


test('Landscape places the reference nine dots on two, three and four ring positions', () => {
  const f = fixture({ landscape: true });
  f.wrap.clientWidth = 564; f.wrap.clientHeight = 276;
  f.wrap.getBoundingClientRect = () => ({ width: 564, height: 276 });
  f.rings.forEach((ring, index) => { ring.width = [197, 309.295, 421.59][index]; ring.offsetLeft = 282; ring.offsetTop = 221; });
  f.dots.forEach(dot => { dot.getBoundingClientRect = () => ({ width: 44 }); });
  const layout = f.computeOrbitLayout(f.wrap);
  assert.deepEqual([0, 1, 2].map(index => layout.dotPlacements.filter(p => p.ringIndex === index).length), [2, 3, 4]);
  assert.deepEqual(Array.from(layout.dotPlacements, p => p.angleDeg), [-127.8, -52.2, -135.9, -90, -44.1, -158.4, -117, -63, -21.6]);
  for (const p of layout.dotPlacements) {
    assert.ok(p.x >= 22 && p.x <= 542 && p.y >= 0 && p.y <= 276);
    assert.ok(Math.abs(Math.hypot(p.x - p.centerX, p.y - p.centerY) - p.radius) < 1e-8);
  }
});


test('a numeric ring property selects only the requested prepared rings and defaults to three', () => {
  for (const [requested, expected] of [[null,3],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[99,6],[0,1],['invalid',3],[2.7,3]]) {
    const f = fixture({ prepared: 6, requested });
    const layout = f.computeOrbitLayout(f.wrap);
    assert.equal(layout.ringInfo.length, expected);
    assert.equal(layout.dotPlacements.length, 9);
    assert.ok(layout.dotPlacements.every(p => p.ringIndex < expected));
    assert.equal(f.section.getAttribute('data-orbit-rings'), String(expected));
  }
});

test('static nine-dot fallback matches runtime placement for every format and supported ring count', () => {
  const css = readFileSync(new URL('../src/embeds/orbit-graphic/ring-count-fallback.css', import.meta.url), 'utf8');
  for (const landscape of [false, true]) for (let count = 1; count <= 6; count++) {
    const f = fixture({ prepared: 6, requested: count, landscape });
    const width = landscape ? 564 : 258, height = landscape ? 276 : 232;
    const min = landscape ? 98.5 : 66, max = landscape ? 210.795 : 166, cy = landscape ? 221 : 192;
    f.wrap.getBoundingClientRect = () => ({ width, height });
    f.rings.forEach((ring, index) => {
      ring.width = 2 * (count === 1 ? max : min + (max - min) * index / (count - 1));
      ring.offsetLeft = width / 2; ring.offsetTop = cy;
    });
    f.dots.forEach(dot => { dot.getBoundingClientRect = () => ({ width: landscape ? 44 : 28 }); });
    const layout = f.computeOrbitLayout(f.wrap);
    const root = `.orbit-graphic[data-orbit-rings="${count}"]`;
    const selector = landscape ? `${root}:is(.w-variant-9ca0466f-42cf-4c7e-8753-3cbdd1e476f2,.orbit-graphic--landscape)` : root;
    const lines = css.split('\n').filter(line => line.startsWith(selector + ' .orbit-dots>'));
    assert.equal(lines.length, 9);
    lines.forEach((line, index) => {
      const [, left, top] = line.match(/left:([\d.]+)%;top:([\d.]+)%/);
      assert.ok(Math.abs(Number(left) - layout.dotPlacements[index].x / width * 100) < .000001);
      assert.ok(Math.abs(Number(top) - layout.dotPlacements[index].y / height * 100) < .000001);
    });
  }
});

test('a previous replay completion cannot reveal dots at the new replay starting point', async () => {
  const f = fixture({ landscape: true });
  const stop = f.init(); f.tick(); f.tick();
  f.animations.forEach(animation => animation.resolve());
  // A replay can start before already-queued completion callbacks are delivered.
  stop();
  const next = f.init(); f.tick(); f.tick();
  assert.ok(f.dots.every(dot => dot.querySelector().style.transform === 'scale(0)'));
  await Promise.resolve(); await Promise.resolve();
  assert.ok(f.dots.every(dot => dot.querySelector().style.transform === 'scale(0)'));
  next();
});
