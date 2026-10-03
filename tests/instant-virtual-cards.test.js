import test from 'node:test';
import assert from 'node:assert/strict';
import { revealOffset, createRevealTrack } from '../src/lib/effects/reveal-groups.js';
import { virtualCardState, virtualCardTimeline } from '../src/embeds/instant-virtual-cards.js';

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
test('Cards enter once and the cursor makes one continuous visit per cycle', () => {
  const timing = virtualCardTimeline(1);
  assert.deepEqual(virtualCardState(.5, 1).reveals, [.5, 0, 0, 0]);
  assert.deepEqual(virtualCardState(4, 1).reveals, [1, 1, 1, 1]);
  assert.equal(virtualCardState(4, 1).enabled, false);
  assert.equal(virtualCardState(4.3, 1).behind, true);
  assert.equal(virtualCardState(5.2, 1).pressed, true);
  assert.equal(virtualCardState(5.75, 1).count, .5);
  for (const t of [5.35, 6, timing.holdEnd, timing.off, timing.exitStart]) {
    const state = virtualCardState(t, 1);
    assert.equal(state.cursorOpacity, 1); assert.equal(state.behind, false);
  }
  assert.equal(virtualCardState(timing.off, 1).enabled, false);
  assert.equal(virtualCardState(timing.off, 1).pressed, true);
  assert.equal(virtualCardState(timing.off + .5, 1).expansion, .5);
  const rest = virtualCardState(timing.exitEnd, 1);
  assert.equal(rest.behind, true); assert.equal(rest.count, 0); assert.equal(rest.expansion, 0);
  const reduced = virtualCardState(0, 1, true);
  assert.equal(reduced.count, 1); assert.equal(reduced.cursorOpacity, 0);
});

test('cursor holds 1.5 seconds, rests concealed for 3 seconds and repeats the original entrance', () => {
  const duration = .77, timing = virtualCardTimeline(duration);
  assert.ok(Math.abs((timing.holdEnd - timing.holdStart) * duration - 1.5) < 1e-10);
  assert.ok(Math.abs((4 + timing.period - timing.exitEnd) * duration - 3) < 1e-10);
  for (const phase of [4, 4.3, 4.8, 5.25, timing.holdEnd, timing.off, timing.exitEnd + 1]) {
    const first = virtualCardState(phase * duration, duration);
    const repeat = virtualCardState((phase + timing.period) * duration, duration);
    for (const key of ['cursorOpacity', 'behind', 'enabled', 'expansion', 'count', 'pressed']) {
      if (typeof first[key] === 'number') assert.ok(Math.abs(first[key] - repeat[key]) < 1e-10);
      else assert.equal(first[key], repeat[key]);
    }
    assert.deepEqual(repeat.reveals, [1, 1, 1, 1]);
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
  const nodes = { '.ivc-frame': frame, '.ivc-details': details, '.ivc-amount': amount, '[data-ivc-toggle="limit"] [data-stitch-toggle]': toggle, '.ivc-cursor': cursor, '.ivc-front': frame };
  root.querySelector = s => nodes[s]; root.querySelectorAll = s => s === '[data-ivc-reveal]' ? reveals : [];
  const media = { matches: reduced, addEventListener(k,fn) { listeners.set(k,fn); }, removeEventListener(k) { listeners.delete(k); } };
  globalThis.document = { hidden: false, documentElement: {}, addEventListener(k,fn) { listeners.set(k,fn); }, removeEventListener(k) { listeners.delete(k); } };
  globalThis.getComputedStyle = () => ({ getPropertyValue: k => k === '--motion-duration-default' ? '770ms' : 'cubic-bezier(.11,.61,.27,.99)' });
  globalThis.window = { getComputedStyle: globalThis.getComputedStyle };
  globalThis.matchMedia = s => s.includes('reduce') ? media : { matches: false };
  globalThis.IntersectionObserver = class { constructor(fn) { if(failObserver) throw Error('setup failure');this.fn=fn;observers.push(this); } observe() {} disconnect() { this.disconnected = true; } };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = fn => { frames.set(++next,fn); return next; };globalThis.cancelAnimationFrame = id => frames.delete(id);
  return { root, amount, details, cursor, reveals, media, frames, observers, listeners,
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

test('rendered cursor holds visibly, revisits the toggle, then returns diagonally behind the card', () => {
  const f = fixture();
  try {
    const dispose = init(f.root); f.visible(); f.tick(100);
    const duration = .77, timing = virtualCardTimeline(duration);
    const holds = [], exits = [];
    for (let ms = 10; ms <= 18000; ms += 10) {
      f.tick(100 + ms);
      const state = virtualCardState(ms / 1000, duration);
      const point = f.cursor.style.transform.match(/translate3d\(([^,]+),([^,]+),/).slice(1).map(parseFloat);
      if (state.cycleTime > timing.holdStart && state.cycleTime < timing.holdEnd) {
        holds.push(point); assert.equal(Number(f.cursor.style.opacity), 1);
        assert.equal(f.cursor.style.zIndex, '4');
      }
      if (state.cycleTime > timing.exitStart && state.cycleTime < timing.exitEnd) {
        exits.push(point);
        // Straight-line interpolation between toggle and concealed resting point.
        assert.ok(Math.abs((point[0] - 334.8) / 15.2 - (point[1] - 144.56) / 35.44) < 1e-6);
        assert.equal(Number(f.cursor.style.opacity), 1);
      }
    }
    assert.ok(holds.length > 200); assert.ok(exits.length > 100);
    assert.ok(holds.every(([x,y]) => Math.abs(x - 366.8) < 1e-6 && Math.abs(y - 182.56) < 1e-6));
    dispose();
  } finally { f.restore(); }
});
