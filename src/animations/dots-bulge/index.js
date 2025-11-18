import { byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible, resolveVisibilityThreshold } from '../../lib/effects/threshold.js';
import { createDotsFieldBulge } from '../../lib/effects/dots-field-bulge.js';
import '../dots/styles.css';

const DEFAULT_VISIBILITY = 0.4;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const section = root?.querySelector?.(byData(ATTR.anim, DATA_ATTRS.dotsBulge));
  if (!section) return () => {};

  const threshold = resolveVisibilityThreshold(section, DEFAULT_VISIBILITY);
  return whenVisible(section, () => setupDotsSection(section), { threshold });
}

function setupDotsSection(section) {
  const canvas = section.querySelector('#dots-bulge');
  const sensor = section.querySelector('#sensor-bulge');
  if (!canvas || !sensor) return () => {};

  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const disposeDots = createDotsFieldBulge({ canvas, sensor });

  return () => {
    disposeDots();
    revealController.cancel();
  };
}
