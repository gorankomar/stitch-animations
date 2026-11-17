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
  get textContent() { return this.children ? this.children.map(child => child.textContent).join('') : this._text || ''; }
  set textContent(value) { this.children = undefined; this._text = value; }
  replaceChildren(...children) { this.children = children; }
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

test('subtitle language switching renders RTL cues, supports native fullscreen and cleans up', async () => {
  const { initFilmSubtitles } = await import('../src/embeds/real-ai-film/player.js');
  const previous = globalThis.document;
  const selector = new Node();
  const overlay = new Node();
  const status = new Node();
  const source = { textContent: JSON.stringify(['en', 'ar', 'vi', 'id'].map(language => ({language, label: language, vtt: 'WEBVTT\n'}))) };
  const elements = [];
  globalThis.document = { createElement(tag) {
    if (tag === 'span') return new Node();
    const element = new Node();
    element.track = { mode: 'disabled', activeCues: [] };
    element.remove = () => { element.removed = true; };
    elements.push(element);
    return element;
  } };
  const root = { querySelector: key => ({'[data-film-subtitles]': selector, '[data-film-caption]': overlay, '[data-film-subtitle-data]': source, '[data-film-status]': status})[key] };
  const video = new Node();
  video.append = () => {};
  try {
    const dispose = initFilmSubtitles(root, video);
    assert.ok(elements.every(element => element.track.mode === 'disabled'));
    selector.value = 'ar';
    selector.dispatchEvent(new Event('change'));
    elements[1].track.activeCues = [{text:'مرحباً بكم'}];
    elements[1].dispatchEvent(new Event('cuechange'));
    assert.equal(elements[1].track.mode, 'hidden');
    assert.equal(overlay.textContent, 'مرحباً بكم');
    assert.equal(overlay.dir, 'rtl');
    video.webkitDisplayingFullscreen = true;
    video.dispatchEvent(new Event('webkitbeginfullscreen'));
    assert.equal(elements[1].track.mode, 'showing');
    assert.equal(overlay.hidden, true);
    video.webkitDisplayingFullscreen = false;
    video.dispatchEvent(new Event('webkitendfullscreen'));
    assert.equal(elements[1].track.mode, 'hidden');
    selector.value = 'vi';
    selector.dispatchEvent(new Event('change'));
    assert.equal(elements[1].track.mode, 'disabled');
    assert.equal(elements[2].track.mode, 'hidden');
    selector.value = '';
    selector.dispatchEvent(new Event('change'));
    assert.equal(overlay.hidden, true);
    dispose();
    assert.ok(elements.every(element => element.removed && element.track.mode === 'disabled'));
  } finally { globalThis.document = previous; }
});

test('subtitle menu supports keyboard selection, outside dismissal and independent teardown', async () => {
  const { initFilmSubtitleMenu } = await import('../src/embeds/real-ai-film/player.js');
  const previous = globalThis.document;
  const document = new Node();
  globalThis.document = document;
  let focused;
  const trigger = new Node();
  trigger.value = '';
  trigger.contains = target => target === trigger;
  trigger.focus = () => { focused = trigger; };
  const menu = new Node();
  const options = ['', 'en', 'ar', 'vi', 'id'].map((language, index) => {
    const node = new Node();
    node.dataset.filmLanguage = language;
    node.textContent = ['Off', 'English', 'العربية', 'Tiếng Việt', 'Bahasa Indonesia'][index];
    node.focus = () => { focused = node; };
    return node;
  });
  menu.querySelectorAll = () => options;
  menu.contains = target => options.includes(target) || target === menu;
  const root = new Node();
  const fullscreen = new Node();
  fullscreen.focus = () => { focused = fullscreen; };
  root.querySelector = selector => selector === '[data-film-subtitle-menu]' ? menu : fullscreen;
  const key = (node, value, shiftKey = false) => {
    const event = new Event('keydown', {cancelable: true});
    Object.defineProperties(event, {key: {value}, shiftKey: {value: shiftKey}});
    node.dispatchEvent(event);
  };
  let changes = 0;
  trigger.addEventListener('change', () => changes++);
  try {
    const dispose = initFilmSubtitleMenu(root, trigger);
    assert.equal(menu.hidden, true);
    trigger.click();
    assert.equal(trigger.attributes.get('aria-expanded'), 'true');
    assert.equal(root.dataset.filmSubtitlesOpen, 'true');
    assert.equal(focused, options[0]);
    key(options[0], 'ArrowUp');
    assert.equal(focused, options[4]);
    options[2].click();
    assert.equal(trigger.value, 'ar');
    assert.equal(changes, 1);
    assert.equal(options[2].attributes.get('aria-checked'), 'true');
    assert.equal(menu.hidden, true);
    assert.equal(focused, trigger);
    key(trigger, 'ArrowDown');
    assert.equal(focused, options[2]);
    key(root, 'Escape');
    assert.equal(menu.hidden, true);
    assert.equal(focused, trigger);
    trigger.click();
    key(root, 'Tab');
    assert.equal(focused, fullscreen);
    assert.equal(menu.hidden, true);
    trigger.click();
    document.dispatchEvent(new Event('pointerdown'));
    assert.equal(menu.hidden, true);
    assert.equal(root.dataset.filmSubtitlesOpen, undefined);
    dispose();
    trigger.click();
    assert.equal(menu.hidden, true);
  } finally { globalThis.document = previous; }
});
