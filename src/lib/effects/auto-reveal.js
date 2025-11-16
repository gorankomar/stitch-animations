import { ATTR } from '../config.js';
import { qsa } from '../dom.js';
import { ensureSectionReveal } from './reveal-groups.js';
import { whenVisible } from './threshold.js';

const SELECTOR = `[data-${ATTR.anim}]`;

export function initAutoReveals(root = document) {
  if (!root) return () => {};
  const sections = qsa(SELECTOR, root);
  const watchers = sections.map((section) =>
    whenVisible(section, () => {
      const controller = ensureSectionReveal(section);
      controller?.ensure();
    })
  );
  return () => watchers.forEach((stop) => stop && stop());
}
