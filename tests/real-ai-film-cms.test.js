import test from 'node:test';
import assert from 'node:assert/strict';
import { initCMSVideos } from '../src/embeds/real-ai-film/cms.js';

function marker(key = 'real-ai') {
  const attributes = new Map([['data-stitch-video', key]]);
  const background = { play: () => Promise.resolve() };
  return {
    innerHTML: '', isConnected: true,
    classList: { add(name) { attributes.set('class', name); } },
    matches: () => key === 'real-ai',
    querySelectorAll: () => [],
    querySelector: () => background,
    hasAttribute: name => attributes.has(name),
    getAttribute: name => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name)
  };
}

test('CMS loader mounts only requested markers, guards repeats and restores placeholders', () => {
  const markers = [marker(), marker(), marker('unknown')];
  let starts = 0, stops = 0;
  const root = { querySelectorAll: () => markers.filter(m => m.matches()) };
  const dispose = initCMSVideos({ root, markup: '<video>trusted player</video>', observe: false,
    initPlayer: m => { starts++; m.setAttribute('data-film-ready', 'true'); return () => { stops++; m.removeAttribute('data-film-ready'); }; }
  });
  assert.equal(starts, 2);
  assert.equal(markers[2].innerHTML, '');
  assert.equal(markers[0].getAttribute('data-film-player'), 'true');
  const repeated = initCMSVideos({ root, markup: 'duplicate', observe: false, initPlayer: () => { throw Error('Must not remount'); } });
  repeated();
  assert.equal(markers[0].innerHTML, '<video>trusted player</video>');
  dispose();
  assert.equal(stops, 2);
  assert.equal(markers[0].innerHTML, '');
  assert.equal(markers[0].getAttribute('class'), null);
});

test('CMS loader handles delayed Rich Text insertion and removal', () => {
  const originalObserver = globalThis.MutationObserver;
  let callback, disconnected = false, starts = 0, stops = 0;
  globalThis.MutationObserver = class {
    constructor(fn) { callback = fn; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  try {
    const dispose = initCMSVideos({ root: { querySelectorAll: () => [] }, markup: 'player',
      initPlayer: () => { starts++; return () => { stops++; }; }
    });
    const item = marker(); item.nodeType = 1;
    callback([{ addedNodes: [item] }]);
    callback([{ addedNodes: [item] }]);
    assert.equal(starts, 1);
    item.isConnected = false;
    callback([{ addedNodes: [] }]);
    assert.equal(stops, 1);
    dispose();
    assert.equal(disconnected, true);
  } finally { globalThis.MutationObserver = originalObserver; }
});
