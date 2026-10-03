import test from 'node:test';
import assert from 'node:assert/strict';
import { createRevealController, resolveRevealStagger } from '../src/lib/effects/reveal-groups.js';

test('numeric controller stagger is milliseconds while attribute strings retain CSS units', () => {
  assert.equal(resolveRevealStagger('soft', 200), 200);
  assert.equal(resolveRevealStagger('hard', 340), 340);
  assert.equal(resolveRevealStagger('soft', 0), 0);
  assert.equal(resolveRevealStagger('soft', '.2s'), 200);
  assert.equal(resolveRevealStagger('soft', '200ms'), 200);
});

for (const [selector, count] of [['[data-uo-row]', 9], ['[data-cc-reveal]', 3]]) {
  test(`${selector} completes its stagger without waiting hundreds of seconds`, () => {
    const savedWindow = globalThis.window;
    const timers = new Map();
    let next = 0;
    globalThis.window = {
      setTimeout(fn, delay) { timers.set(++next, { fn, delay }); return next; },
      clearTimeout(id) { timers.delete(id); }
    };
    const rows = Array.from({ length: count }, () => {
      const classes = new Set();
      return { nodeType: 1, childNodes: [], dataset: {}, classes,
        matches: value => value === selector,
        style: { setProperty() {} },
        classList: { add: name => classes.add(name), remove: name => classes.delete(name) }
      };
    });
    const root = { dataset: {}, childNodes: rows, querySelectorAll: () => rows };
    try {
      const controller = createRevealController({ root, selector, timings: { duration: 770, stagger: 200, opacityRatio: .34 } });
      assert.equal(controller.ensure(), (count - 1) * 200 + 770);
      assert.deepEqual([...timers.values()].map(timer => timer.delay), rows.map((_, i) => i * 200));
      controller.ensure();
      assert.equal(timers.size, count);
      for (const { fn } of timers.values()) fn();
      assert.ok(rows.every(row => row.classes.has('is-reveal')));
      controller.cancel();
      assert.equal(timers.size, 0);
      assert.ok(rows.every(row => !row.classes.has('is-reveal')));
    } finally {
      if (savedWindow === undefined) delete globalThis.window;
      else globalThis.window = savedWindow;
    }
  });
}
