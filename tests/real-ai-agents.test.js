import test from 'node:test';
import assert from 'node:assert/strict';
import { getAgentsTimeline } from '../src/embeds/real-ai-agents.js';

test('catalog starts scrolling after the title, returns immediately, and selects within five seconds', () => {
  for (const cards of [2, 4, 7, 15]) {
    for (const [duration, fast] of [[.77, .462], [1.2, .72], [.5, .3]]) {
      const t = getAgentsTimeline(cards + 2, duration, fast);
      assert.equal(t.scrollStart, t.duration);
      assert.ok(t.arrival <= t.returnStart, 'last card reveals before the bottom is reached');
      assert.equal(t.returnStart, t.scrollStart + t.scrollDuration);
      assert.equal(t.cursorStart, t.returnStart + t.scrollDuration);
      assert.ok(t.firstClick > t.cursorStart);
      assert.ok(t.secondClick > t.firstClick);
      assert.ok(t.end >= t.secondClick + t.toastDuration);
      assert.ok(t.end <= 4.8 + 1e-9, 'leave a margin before the five-second tab change');
    }
  }
});
