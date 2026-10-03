import test from 'node:test';
import assert from 'node:assert/strict';
import { revealOffset, createRevealTrack } from '../src/lib/effects/reveal-groups.js';
import { virtualCardState } from '../src/embeds/instant-virtual-cards.js';

test('Hard Reveal fully clears all four frame edges', () => {
  const frame = { left: 10, top: 20, right: 550, bottom: 298 };
  const element = { left: 61, top: 44, right: 361, bottom: 233 };
  const expected = { 'right-to-left': [489, 0], 'left-to-right': [-351, 0], 'top-to-bottom': [0, -213], 'bottom-to-top': [0, 254] };
  for (const [direction, offset] of Object.entries(expected)) assert.deepEqual(revealOffset({ mode: 'hard', direction, frame, element }), offset);
  assert.deepEqual(revealOffset({ mode: 'soft', direction: 'bottom-to-top', offset: 24 }), [0, 24]);
});
test('Hard Reveal preserves opacity, remeasures and restores wrapper transforms', () => {
  let width = 540;
  const element = { dataset: {}, style: { transform: '', opacity: '.8' }, getBoundingClientRect: () => ({ left: 51, top: 24, right: 351, bottom: 213 }) };
  const frame = { getBoundingClientRect: () => ({ left: 0, top: 0, right: width, bottom: 278 }) };
  const track = createRevealTrack(element, { mode: 'hard', direction: 'right-to-left', frame });
  track.render(0); assert.match(element.style.transform, /489px/); assert.equal(element.style.opacity, '.8');
  width = 800; track.measure(); track.render(0); assert.match(element.style.transform, /749px/);
  track.dispose(); assert.equal(element.style.transform, ''); assert.equal(element.style.opacity, '.8');
});
test('Cards and controls enter sequentially before the cursor enables and counts', () => {
  assert.deepEqual(virtualCardState(.5, 1).reveals, [.5, 0, 0, 0]);
  const entered = virtualCardState(4, 1);
  assert.deepEqual(entered.reveals, [1, 1, 1, 1]);
  assert.equal(entered.enabled, false); assert.equal(entered.expansion, 0); assert.equal(entered.count, 0);
  assert.equal(virtualCardState(4.3, 1).behind, true);
  assert.equal(virtualCardState(5.2, 1).pressed, true);
  assert.equal(virtualCardState(5.75, 1).count, .5);
  const final = virtualCardState(8, 1);
  assert.equal(final.enabled, true); assert.equal(final.expansion, 1); assert.equal(final.count, 1); assert.equal(final.behind, true);
  const reduced = virtualCardState(0, 1, true);
  assert.deepEqual(reduced.reveals, [1, 1, 1, 1]); assert.equal(reduced.count, 1); assert.equal(reduced.cursorOpacity, 0);
});

test('control loop brings the cursor back to disable the toggle and never replays the entrances', () => {
  for (const t of [4, 4.3, 5.2, 5.75, 6.5, 8, 9.5, 10.5, 11.99]) {
    const first = virtualCardState(t, 1);
    const second = virtualCardState(t + 9, 1);
    for (const key of ['enabled','expansion','count','cursorOpacity','behind','pressed']) {
      if (typeof first[key] === 'number') assert.ok(Math.abs(second[key] - first[key]) < 1e-10);
      else assert.equal(second[key], first[key]);
    }
    assert.deepEqual(second.reveals, [1,1,1,1]);
  }
  const collapsing = virtualCardState(9.5, 1);
  assert.equal(collapsing.cursorOpacity, 1); assert.equal(collapsing.expansion, .5); assert.equal(collapsing.count, 1);
  const reset = virtualCardState(10, 1);
  assert.equal(reset.expansion, 0); assert.equal(reset.count, 0); assert.equal(reset.enabled, false);
  for (const t of [12.999999,13,13.000001]) {
    const seam = virtualCardState(t, 1);
    assert.equal(seam.behind,true); assert.equal(seam.expansion,0); assert.equal(seam.count,0);
  }
});

function fixture({ reduced = false, failObserver = false } = {}) {
  const keys = ['window','document','getComputedStyle','matchMedia','IntersectionObserver','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
  const saved = keys.map(key => [key, globalThis[key]]);
  const frames = new Map(), observers = [], listeners = new Map(); let next = 0;
  const rect = { left: 0, top: 0, right: 540, bottom: 278, width: 540, height: 278 };
  const node = () => ({ dataset: {}, style: { cssText: '', transform: '', opacity: '', height: '' }, textContent: '', getBoundingClientRect: () => rect,
    getAttribute() { return this.classes || ''; }, setAttribute(k,v) { if(k === 'class') this.classes = v; },
    classList: { add() {}, remove() {} }, querySelectorAll: () => [] });
  const root = node(), frame = node(), details = node(), amount = node(), toggle = node(), cursor = node(), thumb = node();
  amount.textContent = '$3,650'; toggle.firstElementChild = thumb; cursor.firstElementChild = node();
  const reveals = [node(),node(),node(),node()];
  root.matches = s => s === '[data-instant-virtual-cards]';
  const nodes = { '.ivc-frame': frame, '.ivc-details': details, '.ivc-amount': amount, '[data-ivc-toggle="limit"] [data-stitch-toggle]': toggle, '.ivc-cursor': cursor };
  root.querySelector = s => nodes[s]; root.querySelectorAll = s => s === '[data-ivc-reveal]' ? reveals : [];
  const media = { matches: reduced, addEventListener(k,fn) { listeners.set(k,fn); }, removeEventListener(k) { listeners.delete(k); } };
  globalThis.document = { hidden: false, documentElement: {}, addEventListener(k,fn) { listeners.set(k,fn); }, removeEventListener(k) { listeners.delete(k); } };
  globalThis.getComputedStyle = () => ({ getPropertyValue: k => k === '--motion-duration-default' ? '770ms' : 'cubic-bezier(.11,.61,.27,.99)' });
  globalThis.window = { getComputedStyle: globalThis.getComputedStyle };
  globalThis.matchMedia = s => s.includes('reduce') ? media : { matches: false };
  globalThis.IntersectionObserver = class { constructor(fn) { if(failObserver) throw Error('setup failure');this.fn=fn;observers.push(this); } observe() {} disconnect() { this.disconnected = true; } };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = fn => { frames.set(++next,fn); return next; };globalThis.cancelAnimationFrame = id => frames.delete(id);
  return { root, amount, details, reveals, media, frames, observers, listeners,
    visible(v=true) { observers.at(-1).fn([{ isIntersecting:v, intersectionRatio:v?1:0 }]); },
    tick(now) { const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now); },
    restore() { for(const [key,value] of saved) value === undefined ? delete globalThis[key] : globalThis[key]=value; } };
}
const { init } = await import('../src/embeds/instant-virtual-cards.js');
test('mount ownership, offscreen pause, reduced motion and cleanup restore the fallback', () => {
  const f=fixture();try {
    const dispose=init(f.root);init(f.root);assert.equal(f.observers.length,2);
    f.visible();f.tick(100);assert.equal(f.amount.textContent,'$0');assert.equal(f.details.style.height,'0px');
    assert.equal(f.reveals[0].style.opacity,'');
    f.visible(false);assert.equal(f.frames.size,0);
    f.visible();f.media.matches=true;f.listeners.get('change')();f.tick(200);
    assert.equal(f.amount.textContent,'$3,650');assert.equal(f.details.style.height,'');assert.equal(f.frames.size,0);
    dispose();assert.equal(f.amount.textContent,'$3,650');assert.equal(f.root.dataset.ivcReady,undefined);assert.equal(f.listeners.size,0);
    assert(f.observers.every(o=>o.disconnected));
    const again=init(f.root);assert.equal(f.observers.length,4);again();
  } finally { f.restore(); }
});
test('setup failure preserves fully visible cards and spending amount', () => {
  const f=fixture({failObserver:true});const log=console.error;console.error=()=>{};
  try { init(f.root)();assert.equal(f.root.dataset.ivcReady,undefined);assert.equal(f.amount.textContent,'$3,650');assert(f.reveals.every(n=>n.style.transform===''));assert.equal(f.frames.size,0); }
  finally { console.error=log;f.restore(); }
});

 test('cursor returns for both toggle clicks on every repeated cycle', () => {
  for (const cycle of [0, 1, 2, 5]) {
    for (const click of [5.25, 9]) {
      const state = virtualCardState(click + cycle * 9, 1);
      assert.equal(state.cursorOpacity, 1);
      assert.equal(state.pressed, true);
      assert.equal(state.behind, false);
    }
    assert.equal(virtualCardState(11 + cycle * 9, 1).behind, true);
  }
});

test('cursor stays opaque and waits an extra second behind the card', () => {
  for (const t of [4, 7.9, 8, 11, 12, 12.99]) {
    const state = virtualCardState(t, 1);
    assert.equal(state.cursorOpacity, 1); assert.equal(state.behind, true);
  }
  const duration = .77, period = 8 * duration + 1;
  assert.ok(Math.abs(virtualCardState(5.25 * duration + period, duration).cycleTime - 5.25) < 1e-10);
});
