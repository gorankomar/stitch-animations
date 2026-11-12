import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { getDefaultDurationMs, getFastDurationMs } from '../lib/easing.js';
import { readMotionEasingCurve } from '../lib/motion.js';

export const init = stageInitializer('[data-real-ai-harness]', frame => {
  const groups = [...frame.querySelectorAll('[data-harness-reveal]')];
  if (groups.length !== 4) return;
  const steps = [...frame.querySelectorAll('.harness-steps > span')];
  const labels = steps.map(step => [...step.childNodes].find(node => node.nodeType === 3 && node.textContent.trim()));
  const pending = ['Build', 'Test', 'Publish'];
  const completed = ['Built', 'Tested', 'Published'];
  function renderSteps(time, duration, burst, ease) {
    steps.forEach((step, i) => {
      const local = time - i * (duration + burst);
      const done = local >= duration;
      step.dataset.harnessState = done ? 'done' : local >= 0 ? 'working' : 'pending';
      if (labels[i]) labels[i].textContent = done ? completed[i] : pending[i];
      step.style.setProperty('--harness-working', local >= 0 && !done ? '1' : '0');
      step.style.setProperty('--harness-angle', `${-Math.max(0, local) / duration * 360}deg`);
      const p = Math.min(1, Math.max(0, (local - duration) / burst));
      step.style.setProperty('--harness-burst-opacity', done ? String(1 - p) : '0');
      step.style.setProperty('--harness-burst-expansion', String(4 * ease(p)));
    });
  }
  function restoreSteps() {
    steps.forEach((step, i) => {
      delete step.dataset.harnessState;
      if (labels[i]) labels[i].textContent = completed[i];
      for (const name of ['working', 'angle', 'burst-opacity', 'burst-expansion']) step.style.removeProperty(`--harness-${name}`);
    });
  }
  const pane = frame.closest('.w-tab-pane');
  const active = () => !pane || pane.classList.contains('w--tab-active');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let stop;
  let tracks = [];

  function reset() {
    stop?.();
    stop = undefined;
    tracks.forEach(track => track.dispose());
    tracks = [];
    restoreSteps();
  }

  function enter(event) {
    reset();
    if (!active() || motion.matches) return;
    const direction = event?.detail?.direction === 'left-to-right' ? 'left-to-right' : 'right-to-left';
    const duration = getDefaultDurationMs() / 1000;
    const ease = readMotionEasingCurve();
    const burst = getFastDurationMs() / 1000;
    const finish = duration + steps.length * (duration + burst);

    try {
      for (const group of groups) tracks.push(createRevealTrack(group, { frame, mode: 'hard', direction, travelFraction: 0.5 }));
      stop = animateStage(frame, {
        update({ time, reduced, dirty }) {
          if (reduced || !active() || time >= finish) {
            reset();
            return;
          }
          renderSteps(time - duration, duration, burst, ease);
          tracks.forEach(track => {
            if (dirty) track.measure();
            track.render(time / duration, ease);
          });
        }
      });
      tracks.forEach(track => track.render(0, ease));
      renderSteps(-duration, duration, burst, ease);
    } catch (error) {
      reset();
      throw error;
    }
  }

  const activation = pane && new MutationObserver(() => {
    if (!active()) reset();
  });
  enter();
  pane?.addEventListener('stitch:tab-enter', enter);
  activation?.observe(pane, { attributes: true, attributeFilter: ['class'] });
  return () => {
    pane?.removeEventListener('stitch:tab-enter', enter);
    activation?.disconnect();
    reset();
  };
});
