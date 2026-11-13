import test from 'node:test';
import assert from 'node:assert/strict';
import { init } from '../src/embeds/real-ai-product.js';

for (const locale of [null, 'ar', 'vi', 'id']) {
test(`${locale || 'legacy'}: product bar waits for its own frame, then runs the coordinated fields and cleans up`, () => {
  const keys = ['document', 'window', 'matchMedia', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = keys.map(key => [key, globalThis[key]]);
  const observers = [], frames = new Map();
  let id = 0, timestamp = 100;
  const node = () => ({ dataset: {}, removeAttribute(name) { if (name === 'data-product-state') delete this.dataset.productState; }, querySelector() { return null; }, style: { setProperty(key, value) { this[key] = value; }, removeProperty(key) { delete this[key]; } }, tracks: [],
    getBoundingClientRect: () => ({ top: 100, bottom: 200, left: 0, right: 100 }),
    animate(keyframes, options) {
      const track = { currentTime: 0, options, effect: { setKeyframes() {} }, pause() {}, cancel() { this.cancelled = true; } };
      this.tracks.push(track); return track;
    }
  });
  const stage = node(), frame = node(), bar = node(), lock = node(), updated = node(), value = node(), control = node(), marker = node();
  bar.parentElement = frame; value.parentElement = control; value.dataset.productPlaceholder = 'Select currency'; value.textContent = 'USD'; lock.textContent = '3';
  const title = node(), policy = node(), prompt = node(), submit = node(), icon = node();
  title.textContent = 'All required details have been completed.'; policy.textContent = 'Click Create loan product to proceed.'; prompt.textContent = 'Ask for another change…';
  bar.querySelector = selector => ({ '.lp-product-change-title': title, '.lp-product-policy': policy, '.lp-product-prompt': prompt, '.lp-product-stop': submit, '.lp-product-sparkle': icon })[selector];
  const field = { querySelector: selector => selector === '[data-product-value]' ? value : marker };
  const localized = locale && { 'idle-title': `${locale} اسأل`, 'working-title': `${locale} Đang tạo`, request: `${locale} Buat pinjaman`, 'lock-placeholder': `${locale} الأشهر`, 'lock-working': '٦', 'placeholder-0': `${locale} Chọn tiền tệ` };
  if (locale) { title.textContent = `${locale} اكتمل`; policy.textContent = `${locale} Tiếp tục`; prompt.textContent = `${locale} Perubahan lain…`; }
  const completed = [title.textContent, policy.textContent, prompt.textContent];
  stage.querySelector = selector => localized && selector.startsWith('[data-product-copy=') ? { textContent: localized[selector.match(/"(.*?)"/)[1]] } : ({ '[data-product-bar]': bar, '[data-product-lock]': lock, '[data-product-updated]': updated })[selector];
  stage.querySelectorAll = selector => selector === '[data-product-field]' ? [field] : [];
  stage.matches = () => true;
  globalThis.document = { documentElement: {}, hidden: false, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { getComputedStyle: () => ({ getPropertyValue: key => key === '--reveal-duration-default' || key === '--motion-duration-default' ? '100ms' : '' }) };
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = key => frames.delete(key);
  const tick = (delta = 50) => { const pending = [...frames.values()]; frames.clear(); timestamp += delta; pending.forEach(callback => callback(timestamp)); };
  try {
    const dispose = init(stage);
    init(stage);
    assert.equal(observers.length, 2);
    assert.equal(observers[0].target, frame);
    assert.deepEqual(observers[0].options, { threshold: 0 });
    observers[1].callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    for (let i = 0; i < 15; i++) tick();
    assert.ok(stage.tracks[0].currentTime >= 100);
    assert.equal(bar.tracks[0].currentTime, 0);
    assert.equal(value.textContent, localized?.['placeholder-0'] || 'Select currency');
    assert.equal(lock.textContent, localized?.['lock-placeholder'] || 'Enter months');
    assert.equal(title.textContent, localized?.['idle-title'] || 'Ask Stitch AI');
    observers[0].callback([{ isIntersecting: true }]);
    tick(); tick();
    assert.ok(bar.tracks[0].currentTime > 0);
    tick(40);
    assert.equal(bar.dataset.productState, 'typing');
    assert.ok(bar.tracks[0].currentTime < 100, 'typing begins before the reveal finishes');
    assert.ok((localized?.request || 'Create').startsWith(prompt.textContent));
    for (let i = 0; i < 15; i++) tick();
    assert.equal(bar.dataset.productState, 'typing');
    assert.ok(prompt.textContent.startsWith(locale || 'Create'));
    assert.equal(value.textContent, localized?.['placeholder-0'] || 'Select currency');
    const pausedCopy = prompt.textContent;
    observers[1].callback([{ isIntersecting: false, intersectionRatio: 0 }]);
    for (let i = 0; i < 20; i++) tick();
    assert.equal(prompt.textContent, pausedCopy);
    observers[1].callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    tick();
    for (let i = 0; i < 15; i++) tick();
    assert.equal(bar.dataset.productState, 'working');
    assert.equal(title.textContent, localized?.['working-title'] || 'Creating personal loan...');
    assert.ok(bar.style['--product-working-shadow']);
    assert.ok(bar.style['--product-working-opacity'] > 0);
    assert.ok(bar.style['--product-working-opacity'] < 1, 'working glow fades in instead of appearing at full opacity');
    assert.equal(lock.textContent, localized?.['lock-working'] || '6');
    assert.match(bar.style['--product-working-outline'], /^conic-gradient/);
    const workingRotation = icon.tracks[0].currentTime;
    for (let i = 0; i < 4; i++) tick();
    assert.equal(bar.dataset.productState, 'complete');
    assert.equal(title.textContent, completed[0]);
    assert.ok(bar.style['--product-working-opacity'] > 0, 'effects remain visible while completion fades them out');
    assert.ok(bar.style['--product-working-opacity'] < 1);
    assert.ok(bar.style['--product-working-outline']);
    assert.ok(icon.tracks[0].currentTime > workingRotation, 'completion continues the current turn');
    let lastRotation = icon.tracks[0].currentTime;
    let reachedUpright = false;
    for (let i = 0; i < 80; i++) {
      tick();
      const rotation = icon.tracks[0].currentTime;
      assert.ok(rotation >= lastRotation, 'the finishing turn never snaps backward');
      reachedUpright ||= rotation === 100 && !icon.tracks[0].cancelled;
      lastRotation = rotation;
    }
    assert.ok(reachedUpright, 'the icon reaches a full turn and holds before cleanup');
    assert.equal(title.textContent, completed[0]);
    assert.equal(policy.textContent, completed[1]);
    assert.equal(bar.style['--product-working-shadow'], undefined);
    assert.equal(bar.style['--product-working-opacity'], undefined);
    assert.equal(bar.style['--product-working-outline'], undefined);
    assert.equal(value.textContent, 'USD');
    assert.equal(lock.textContent, '3');
    assert.ok(observers.every(observer => observer.disconnected));
    dispose();
    assert.equal(frames.size, 0);
    assert.ok(bar.tracks[0].cancelled);
    const repeatDispose = init(stage);
    assert.equal(title.textContent, localized?.['idle-title'] || 'Ask Stitch AI');
    repeatDispose();
    assert.equal(value.textContent, 'USD');
    globalThis.matchMedia = () => ({ matches: true });
    const trackCount = bar.tracks.length;
    const reducedDispose = init(stage);
    assert.equal(value.textContent, 'USD');
    assert.equal(lock.textContent, '3');
    assert.equal(title.textContent, completed[0]);
    assert.equal(bar.tracks.length, trackCount);
    reducedDispose();
  } finally {
    for (const [key, value] of saved) value === undefined ? delete globalThis[key] : globalThis[key] = value;
  }
});

}
