import { renderCopilotShadow, clearCopilotShadow } from '../lib/effects/copilot-shadow.js';
import { copilotTyping } from '../lib/effects/copilot-typing.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';

const selector = '[data-real-ai-copilot]';

export const init = stageInitializer(selector, (stage) => {
  const card = stage.querySelector('.real-ai-copilot-card');
  const copy = stage.querySelector('[data-copilot-copy]');
  const icon = stage.querySelector('.real-ai-copilot-icon');
  if (!card || !copy || !icon) return;

  const pane = stage.closest('.w-tab-pane');
  const frame = card.closest('.real-ai-copilot-frame');
  let entrance;

  function revealCard({ detail: { direction, options, addAnimation } }) {
    if (!frame) return;
    entrance?.cancel();
    const track = createRevealTrack(card, {
      frame,
      mode: 'hard',
      direction,
      travelFraction: 0.5
    });
    entrance = card.animate(track.keyframes(), { ...options, delay: options.duration * 0.2 });
    addAnimation(entrance);
  }

  const text = copy.textContent;
  const { letters, keys, total } = copilotTyping(text);

  const typed = document.createElement('span');
  typed.setAttribute('data-copilot-typed', '');
  typed.setAttribute('aria-hidden', 'true');

  const style = getComputedStyle(icon);
  const easing = style.getPropertyValue('--motion-ease-primary').trim();
  const duration = style.getPropertyValue('--motion-duration-default').trim();
  const spinTime = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
  let spin;
  let stop;
  let start;
  let shown = -1;

  function restore() {
    typed.remove();
    stage.removeAttribute('data-copilot-playing');
    shown = -1;
    clearCopilotShadow(card);
    if (spin) spin.currentTime = 0;
  }

  const activation = pane && new MutationObserver(() => {
    if (pane.classList.contains('w--tab-active')) start = undefined;
  });

  try {
    if (easing && spinTime > 0 && icon.animate) {
      spin = icon.animate([{ transform: 'rotate(0turn)' }, { transform: 'rotate(1turn)' }],
        { duration: spinTime, easing, fill: 'both' });
      spin.pause();
      spin.currentTime = 0;
    }
    activation?.observe(pane, { attributes: true, attributeFilter: ['class'] });
    stop = animateStage(stage, {
      update({ time, reduced }) {
        if (reduced) {
          restore();
          start = undefined;
          return;
        }
        if (pane && !pane.classList.contains('w--tab-active')) return;
        stage.toggleAttribute('data-copilot-playing', true);
        start ??= time;
        const elapsed = time - start;
        const progress = Math.max(0, (elapsed - .18) / 3.65) * total;
        let count = shown < 0 || elapsed === 0 ? 0 : shown;
        while (count < keys.length && keys[count] <= progress) count++;
        if (count !== shown) {
          shown = count;
          typed.textContent = letters.slice(0, count).join('');
          if (count < keys.length) copy.after(typed);
          else typed.remove();
        }

        renderCopilotShadow(card, elapsed);
        if (spin) spin.currentTime = Math.min(spinTime, Math.max(0, (elapsed % 3.4 - 2.35) * 1000));
      },
    });
  } catch (error) {
    activation?.disconnect();
    spin?.cancel();
    restore();
    throw error;
  }

  pane?.addEventListener('stitch:tab-enter', revealCard);
  return () => {
    pane?.removeEventListener('stitch:tab-enter', revealCard);
    entrance?.cancel();
    stop();
    activation?.disconnect();
    restore();
    spin?.cancel();
  };
});
