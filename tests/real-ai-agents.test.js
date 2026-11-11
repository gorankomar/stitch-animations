import test from 'node:test';
import assert from 'node:assert/strict';
import { getAgentsTimeline } from '../src/embeds/real-ai-agents.js';

test('catalog returns fully to the top before cursor selection, regardless of card count', () => {
  for (const cards of [2, 4, 7, 15]) {
    const t = getAgentsTimeline(cards + 2, .77, .462);
    assert.ok(t.scrollStart >= t.arrival);
    assert.ok(t.returnStart > t.scrollStart + t.scrollDuration);
    assert.ok(t.cursorStart > t.returnStart + t.scrollDuration);
    assert.ok(t.firstClick > t.cursorStart);
    assert.ok(t.secondClick > t.firstClick);
    assert.ok(t.end > t.secondClick);
  }
  assert.ok(getAgentsTimeline(17, .77, .462).arrival > getAgentsTimeline(9, .77, .462).arrival);
});
