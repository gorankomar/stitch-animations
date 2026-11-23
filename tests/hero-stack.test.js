import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHeroStackController } from '../src/lib/effects/hero-stack.js';

test('hero hover composes with Reveal and is available in the static fallback', () => {
  const css = readFileSync(new URL('../src/animations/hero/styles.css', import.meta.url), 'utf8');
  assert.match(css, /:not\(\.is-reveal-ready\):hover,[^{}]+\.is-reveal[^{]*:hover\s*\{\s*--reveal-transform-active: translate3d\(0, -10%, 1px\)/);
  assert.match(css, /:not\(\.is-reveal-ready\)\s*\{[^}]+transform: var\(--reveal-transform-active\)/);
  assert.match(css, /\.stacked-windows_img-wrap:hover\s*\{[^}]+translate: none !important;/);
  assert.doesNotMatch(css, /\.is-ready|\.is-inview/);
});

for (const mode of ['normal', 'expired', 'reduced']) {
  test(`hero entrance lifecycle with ${mode} startup`, () => {
    let listener;
    const preference = {
      matches: mode === 'reduced',
      addEventListener(event, handler) { listener = handler; },
      removeEventListener(event, handler) {
        assert.equal(listener, handler);
        listener = undefined;
      }
    };
    const previousWindow = globalThis.window;
    globalThis.window = { matchMedia: () => preference };
    try {
      let starts = 0;
      let cancels = 0;
      const reveal = {
        ensure() { starts++; },
        cancel() { cancels++; }
      };
      const section = { dataset: { revealEarlyState: mode } };
      const dispose = createHeroStackController(section, reveal);
      assert.equal(starts, mode === 'normal' ? 1 : 0);
      preference.matches = true;
      listener();
      assert.equal(cancels, 1);
      preference.matches = false;
      listener();
      assert.equal(starts, mode === 'normal' ? 1 : 0);
      dispose();
      assert.equal(cancels, 2);
      assert.equal(listener, undefined);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
}
