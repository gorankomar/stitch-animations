import { byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible, resolveVisibilityThreshold } from '../../lib/effects/threshold.js';
import { createDotsField } from '../../lib/effects/dots-field.js';
import './styles.css';

const DEFAULT_VISIBILITY = 0.4;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const section = root?.querySelector?.(byData(ATTR.anim, DATA_ATTRS.dots));
  if (!section) return () => {};

  const threshold = resolveVisibilityThreshold(section, DEFAULT_VISIBILITY);
  return whenVisible(section, () => setupDotsSection(section), { threshold });
}

function setupDotsSection(section) {
  const canvas = section.querySelector('#dots');
  const sensor = section.querySelector('#sensor');
  if (!canvas || !sensor) return () => {};

  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const disposeDots = createDotsField({ canvas, sensor });

  return () => {
    disposeDots();
    revealController.cancel();
  };
}
