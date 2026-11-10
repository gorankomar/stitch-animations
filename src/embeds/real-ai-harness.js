import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';
import { createRevealTrack } from '../lib/effects/reveal-groups.js';
import { getDefaultDurationMs, getFastDurationMs } from '../lib/easing.js';
import { readMotionEasingCurve } from '../lib/motion.js';

export const init = stageInitializer('[data-real-ai-harness]', frame => {
  const groups = [...frame.querySelectorAll('[data-harness-reveal]')];
  if (groups.length !== 4) return;
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
  }

  function enter(event) {
    reset();
    if (!active() || motion.matches) return;
    const direction = event?.detail?.direction === 'left-to-right' ? 'left-to-right' : 'right-to-left';
    const duration = getDefaultDurationMs() / 1000;
    const stagger = getFastDurationMs() / 4000;
    const ease = readMotionEasingCurve();

    try {
      for (const group of groups) tracks.push(createRevealTrack(group, { frame, mode: 'hard', direction }));
      stop = animateStage(frame, {
        update({ time, reduced, dirty }) {
          if (reduced || !active() || time >= duration + (groups.length - 1) * stagger) {
            reset();
            return;
          }
          tracks.forEach((track, i) => {
            if (dirty) track.measure();
            track.render((time - i * stagger) / duration, ease);
          });
        }
      });
      tracks.forEach(track => track.render(0, ease));
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
