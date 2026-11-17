import test from 'node:test';
import assert from 'node:assert/strict';
import { formatFilmTime, initFilmPlayer, createFilmIdle } from '../src/embeds/real-ai-film/player.js';

class Node extends EventTarget {
  dataset = {};
  style = { values: {}, setProperty(k, v) { this.values[k] = v; }, removeProperty(k) { delete this.values[k]; } };
  attributes = new Map();
  hidden = false;
  tagName = 'BUTTON';
  icons = [];
  setAttribute(k, v) { this.attributes.set(k, v); }
  removeAttribute(k) { this.attributes.delete(k); }
  querySelectorAll() { return this.icons; }
  focus() {}
  click() { this.dispatchEvent(new Event('click', { cancelable: true })); }
}
function setup() {
  const document = new Node();
  document.body = { style: { overflow: 'scroll' } };
  const names = ['video', 'start', 'controls', 'toggle', 'mute', 'seek', 'volume', 'fullscreen', 'status', 'time'];
  const nodes = Object.fromEntries(names.map(name => [name, new Node()]));
  const video = nodes.video;
  Object.assign(video, { duration: 102, currentTime: 0, paused: true, muted: false, volume: 1, ended: false,
    buffered: { length: 1, start: () => 0, end: () => 60 },
    play() { this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); },
    pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  });
  const background = { paused: false, pause() { this.paused = true; } };
  const root = new Node();
  root.querySelector = selector => selector.includes('data-real-ai-background') ? background : nodes[selector.match(/data-film-([\w-]+)/)?.[1]];
  return { root, document, nodes, background };
}

test('film time formatting handles unloaded media and minute boundaries', () => {
  assert.equal(formatFilmTime(NaN), '0:00');
  assert.equal(formatFilmTime(-4), '0:00');
  assert.equal(formatFilmTime(65.8), '1:05');
});

test('film starts only on click, isolates controls, restores overflow and disposes listeners', async () => {
  const { root, document, nodes, background } = setup();
  const previous = globalThis.document;
  globalThis.document = document;
  try {
    const dispose = initFilmPlayer(root);
    assert.equal(nodes.video.paused, true);
    assert.equal(nodes.controls.inert, true);
    const duplicateDispose = initFilmPlayer(root);
    duplicateDispose();
    nodes.start.click();
    await Promise.resolve();
    assert.equal(root.dataset.filmStarted, 'true');
    assert.equal(background.paused, true);
    assert.equal(nodes.video.paused, false);
    assert.equal(nodes.video.muted, false);
    assert.equal(nodes.start.hidden, true);
    assert.equal(nodes.controls.inert, false);
    nodes.toggle.click();
    assert.equal(nodes.video.paused, true);
    nodes.seek.value = 50;
    nodes.seek.dispatchEvent(new Event('input'));
    assert.equal(nodes.video.currentTime, 51);
    assert.equal(nodes.video.paused, true);
    nodes.mute.click();
    assert.equal(nodes.video.muted, true);
    nodes.volume.value = 25;
    nodes.volume.dispatchEvent(new Event('input'));
    assert.equal(nodes.video.volume, .25);
    assert.equal(nodes.video.muted, false);
    nodes.fullscreen.click();
    await Promise.resolve();
    assert.equal(root.dataset.filmExpanded, 'true');
    assert.equal(document.body.style.overflow, 'hidden');
    dispose();
    assert.equal(document.body.style.overflow, 'scroll');
    assert.equal(root.dataset.filmReady, undefined);
    assert.equal(nodes.start.hidden, false);
    nodes.start.click();
    assert.equal(nodes.video.paused, true);
  } finally { globalThis.document = previous; }
});

test('fullscreen idle waits 2.5s, resets on activity, and never hides paused controls', () => {
  let eligible = true;
  let hidden = false;
  let current;
  let cleared = 0;
  const idle = createFilmIdle({
    eligible: () => eligible,
    render: value => { hidden = value; },
    setTimer: (callback, delay) => { assert.equal(delay, 2500); current = callback; return 1; },
    clearTimer: () => { cleared++; current = undefined; }
  });
  idle.sync();
  assert.equal(hidden, false);
  current();
  assert.equal(hidden, true);
  idle.activity();
  assert.equal(hidden, false);
  idle.activity();
  assert.equal(cleared, 1);
  eligible = false;
  idle.sync();
  assert.equal(current, undefined);
  assert.equal(hidden, false);
  eligible = true;
  idle.sync();
  idle.dispose();
  assert.equal(current, undefined);
  assert.equal(hidden, false);
});
