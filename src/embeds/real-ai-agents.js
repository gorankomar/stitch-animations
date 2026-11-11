import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { clampProgress, createDemoCursor, sampleCursor } from '../lib/effects/demo-cursor.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { getDefaultDurationMs, getFastDurationMs } from '../lib/easing.js';
import { readMotionEasingCurve } from '../lib/motion.js';

const designWidth = 536;

export function getAgentsTimeline(rowCount, duration, fast) {
  const stagger = fast * .25;
  const arrival = duration + (rowCount - 1) * stagger;
  // Browse the full catalog before the existing two-toggle demonstration.
  const scrollStart = arrival + fast;
  const scrollDuration = duration * 3;
  const returnStart = scrollStart + scrollDuration + duration;
  const cursorStart = returnStart + scrollDuration + fast;
  const firstClick = cursorStart + duration;
  const secondClick = firstClick + 1.25;
  const exit = secondClick + fast;
  const end = Math.max(exit + duration, secondClick + 1.2);
  return { stagger, arrival, scrollStart, scrollDuration, returnStart, cursorStart, firstClick, secondClick, exit, end };
}

export const init = stageInitializer('[data-real-ai-agents]', stage => {
  const frame = stage.querySelector('.agents-frame');
  const rows = [...stage.querySelectorAll('[data-agents-reveal]')];
  const catalog = [...stage.querySelectorAll('[data-agent]')];
  const cards = catalog.slice(0, 2);
  const toggles = cards.map(card => card.querySelector('.agents-toggle'));
  const pointer = stage.querySelector('.agents-cursor');
  const toast = stage.querySelector('.agents-toast');
  if (!frame || rows.length < 3 || toggles.length !== 2 || toggles.some(toggle => !toggle) || !pointer || !toast) return;

  const pane = stage.closest('.w-tab-pane');
  const ease = readMotionEasingCurve();
  const duration = getDefaultDurationMs() / 1000;
  const fast = getFastDurationMs() / 1000;
  const { stagger, arrival, scrollStart, scrollDuration, returnStart, cursorStart, firstClick, secondClick, exit, end } =
    getAgentsTimeline(rows.length, duration, fast);
  let direction = 'right-to-left';
  const makeTracks = () => rows.map(row => createRevealTrack(row, { frame, mode: 'hard', direction }));
  let tracks = makeTracks();
  const cursor = createDemoCursor(pointer, { frame, designWidth });
  let start, done = false, toastIndex = -1;

  function reset() {
    frame.scrollTop = 0;
    start = undefined;
    done = false;
    tracks.forEach(track => track.dispose());
    cursor.hide();
    cards.forEach(card => {
      card.removeAttribute('data-agent-active');
      card.removeAttribute('data-agent-hover');
    });
    toast.style.removeProperty('opacity');
    toast.textContent = '';
    toastIndex = -1;
  }

  const active = () => !pane || pane.classList.contains('w--tab-active');
  const activation = pane && new MutationObserver(() => {
    if (!active()) reset();
  });
  function enter({ detail }) {
    reset();
    direction = detail.direction === 'left-to-right' ? 'left-to-right' : 'right-to-left';
    tracks = makeTracks();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tracks.forEach(track => track.render(0, ease));
    }
  }

  const stop = animateStage(stage, {
    update({ time, reduced, dirty }) {
      if (reduced || !active()) {
        reset();
        return;
      }
      if (done) return;
      if (start === undefined || dirty) tracks.forEach(track => track.measure());
      start ??= time;
      const elapsed = time - start;
      if (elapsed <= arrival) {
        tracks.forEach((track, i) => track.render((elapsed - i * stagger) / duration, ease));
      } else {
        tracks.forEach(track => track.dispose());
      }

      const lastCard = catalog.at(-1);
      const maxScroll = lastCard ? Math.max(0, lastCard.getBoundingClientRect().bottom - frame.getBoundingClientRect().top + frame.scrollTop + parseFloat(getComputedStyle(frame).paddingBottom) - frame.clientHeight) : 0;
      const outward = ease(clampProgress((elapsed - scrollStart) / scrollDuration));
      const returning = ease(clampProgress((elapsed - returnStart) / scrollDuration));
      frame.scrollTop = maxScroll * (outward - returning);

      const clicks = [firstClick, secondClick];
      cards.forEach((card, i) => card.toggleAttribute('data-agent-active', elapsed >= clicks[i]));

      if (elapsed >= cursorStart && elapsed < exit + duration) {
        const rect = frame.getBoundingClientRect();
        const scale = designWidth / rect.width;
        const x = value => (value - rect.left - frame.clientLeft) * scale;
        const y = value => (value - rect.top - frame.clientTop) * scale;
        const [first, second] = toggles.map(toggle => {
          const box = toggle.getBoundingClientRect();
          return { x: x(box.left + box.width / 2), y: y(box.top + box.height / 2) };
        });
        const position = sampleCursor([
          { time: cursorStart, x: designWidth + 8, y: first.y + 32 },
          { time: firstClick - fast * .24, ...first },
          { time: firstClick + fast * .42, ...first },
          { time: secondClick - fast * .24, ...second },
          { time: exit, ...second },
          { time: exit + duration, x: designWidth + 8, y: second.y + 32 }
        ], elapsed, ease);
        const opacity = Math.min(clampProgress((elapsed - cursorStart) / fast), clampProgress((exit + duration - elapsed) / fast));
        cursor.render({ ...position, opacity, pressed: clicks.some(click => elapsed >= click && elapsed < click + fast * .22) });
        cards.forEach(card => {
          const box = card.getBoundingClientRect();
          card.toggleAttribute('data-agent-hover', opacity > 0 && position.x >= x(box.left) &&
            position.x <= x(box.right) && position.y >= y(box.top) && position.y <= y(box.bottom));
        });
      } else {
        cursor.hide();
        cards.forEach(card => card.removeAttribute('data-agent-hover'));
      }

      const index = elapsed >= secondClick ? 1 : elapsed >= firstClick ? 0 : -1;
      if (index >= 0) {
        if (toastIndex !== index) toast.textContent = `✓  ${cards[index].querySelector('.agents-title')?.textContent || cards[index].dataset.agent} agent is active now!`;
        toastIndex = index;
        const age = elapsed - clicks[index];
        toast.style.opacity = Math.min(clampProgress(age / (fast * .5)), clampProgress((1.2 - age) / fast));
      }
      done = elapsed >= end;
    }
  });
  pane?.addEventListener('stitch:tab-enter', enter);
  activation?.observe(pane, { attributes: true, attributeFilter: ['class'] });
  return () => {
    pane?.removeEventListener('stitch:tab-enter', enter);
    activation?.disconnect();
    stop();
    reset();
    cursor.dispose();
  };
});
