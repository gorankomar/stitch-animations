import { byData, qsa } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import { createFollowGroup } from '../../lib/effects/follow-group.js';
import { createDotsField } from '../../lib/effects/dots-field.js';
import './styles.css';

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.cards), root);
  if (!sections.length) return () => {};

  const cleanups = sections.map((section) => whenVisible(section, () => setupCardsSection(section)));

  return () => cleanups.forEach((dispose) => dispose && dispose());
}

function setupCardsSection(section) {
  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const followRoot = section.matches('[data-follow-root]') ? section : section.querySelector('[data-follow-root]');
  const teardownFollowers = followRoot ? createFollowGroup({ root: followRoot }) : () => {};

  const dotsCanvas = section.querySelector('.features-graphic_cc_dots-canvas');
  const dotsSensor = section.querySelector('.features-graphic_cc_dots-sensor');
  const disposeDots =
    dotsCanvas && dotsSensor
      ? createDotsField({
          canvas: dotsCanvas,
          sensor: dotsSensor,
          pointerTarget: followRoot ?? section
        })
      : () => {};

  return () => {
    teardownFollowers();
    disposeDots();
    revealController.cancel();
  };
}
