import { qsa, byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { createFollowGroup } from '../../lib/effects/follow-group.js';
import { createPressRipple } from '../../lib/effects/press-ripple.js';
import { createGlowSweep } from '../../lib/effects/glow-sweep.js';
import { resolveRevealTimings, ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible, resolveVisibilityThreshold } from '../../lib/effects/threshold.js';
import './styles.css';

const GLOW_SWEEP_MS = 2200;
const GLOW_LOOP_DELAY_MS = 700;
const GLOW_DIRECTION_SNAP = 45;

export function init(root = document) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.api), root);
  if (!sections.length) return () => {};

  const disposers = sections.map((section) => whenVisible(section, () => setupApiSection(section)));

  return () => disposers.forEach((fn) => fn && fn());
}

function setupApiSection(section) {
  const timings = resolveRevealTimings();
  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const cleanups = [() => revealController.cancel()];
  const wraps = section.matches?.('.api-graphic_wrap')
    ? [section]
    : qsa('.api-graphic_wrap', section);

  wraps.forEach((wrap) => {
    const track = wrap.querySelector('[data-follow-mouse]');
    const block = wrap.querySelector('.api-graphic_block');
    const ripple = wrap.querySelector('.api-graphic_ripple');
    const glowTemplate = wrap.querySelector('.api-graphic_glow');
    if (!track || !block) return;

    cleanups.push(createFollowGroup({ root: wrap }));
    cleanups.push(
      createPressRipple({
        trigger: wrap,
        target: block,
        ripple
      })
    );
    if (glowTemplate) {
      const threshold = resolveVisibilityThreshold(wrap, 0.5);
      cleanups.push(
        createGlowSweep({
          wrap,
          template: glowTemplate,
          pointerTarget: wrap,
          sweepDuration: GLOW_SWEEP_MS,
          loopDelay: GLOW_LOOP_DELAY_MS,
          rotationSnap: GLOW_DIRECTION_SNAP,
          threshold
        })
      );
    }
  });

  return () => cleanups.forEach((fn) => fn && fn());
}
