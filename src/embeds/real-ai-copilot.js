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
  const letters = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), ({ segment }) => segment)
    : Array.from(text);
  const rhythm = [12, 8, 16, 10, 22, 9, 13, 17, 8];
  let total = 0;
  const keys = letters.map((letter, index) => {
    total += rhythm[index % rhythm.length] + (/[.!?]/.test(letter) && letters[index + 1] === ' ' ? 85 : /[, ]/.test(letter) ? 18 : 0);
    return total;
  });

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
  const shadowProperties = ['--copilot-shadow-x', '--copilot-shadow-y', '--copilot-glow-x', '--copilot-glow-y', '--copilot-glow-alpha'];

  function restore() {
    typed.remove();
    stage.removeAttribute('data-copilot-playing');
    shown = -1;
    for (const property of shadowProperties) card.style.removeProperty(property);
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

        const angle = elapsed * 2 * Math.PI / 5.5;
        const offsets = [3.856 * Math.sin(angle), 3.856 * Math.cos(angle),
          -3 * Math.sin(angle), 3 * (1 - Math.cos(angle))];
        offsets.forEach((offset, index) => card.style.setProperty(shadowProperties[index], offset + 'cqi'));
        const pulse = 1 - Math.abs((elapsed % 2.75) / 1.375 - 1);
        card.style.setProperty('--copilot-glow-alpha', .35 + .25 * pulse);
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
