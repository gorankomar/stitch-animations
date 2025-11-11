import { qsa, byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { prefersReducedMotion, remToPx } from '../../lib/motion.js';
import { createSpringFollower } from '../../lib/pointer/springFollower.js';
import './styles.css';

export function init(root = document) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.api), root);
  if (!sections.length) return () => {};

  const cleanups = [];

  sections.forEach((section) => {
    qsa('.api-graphic_wrap', section).forEach((wrap) => {
      const track = wrap.querySelector('.api-graphic_track');
      const block = wrap.querySelector('.api-graphic_block');
      const ripple = wrap.querySelector('.api-graphic_ripple');
      if (!track || !block) return;

      const maxRem = Number.parseFloat(wrap.dataset.maxRem ?? '0.5');
      const smoothParsed = Number.parseFloat(wrap.dataset.smooth ?? '0.06');
      const stopParsed = Number.parseFloat(wrap.dataset.stopEps ?? '0.08');
      const smooth = Number.isFinite(smoothParsed) ? smoothParsed : 0.06;
      const stopEps = Number.isFinite(stopParsed) ? stopParsed : 0.08;

      const options = { wrap, track, block, ripple, smooth, stopEps };
      if (Number.isFinite(maxRem)) {
        options.maxOffset = remToPx(maxRem);
      }
      cleanups.push(createSpringFollower(options));
    });
  });

  return () => cleanups.forEach((fn) => fn && fn());
}
