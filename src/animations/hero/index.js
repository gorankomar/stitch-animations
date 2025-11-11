import { qs, qsa, byData, getDataNumber } from '../../lib/dom.js';
import { ensureMouseEngine, followMouse } from '../../lib/mouseFollow.js';
import { EASE, DURATION_MS } from '../../lib/easing.js';
import { ATTR, CLASSNAMES, THRESHOLDS, DATA_ATTRS } from '../../lib/config.js';

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  ensureMouseEngine();

  const section = qs(byData(ATTR.anim, DATA_ATTRS.hero), root);
  if (!section) return () => {};

  section.style.setProperty('--hero-transition', `all ${DURATION_MS}ms ${EASE}`);

  const cleanups = [];
  qsa('[data-follow]', section).forEach((el) => {
    const strength = getDataNumber(el, ATTR.strength, 0.08);
    const maxOffset = getDataNumber(el, ATTR.maxOffset, 24);
    const axis = el.dataset?.[ATTR.axis] ?? 'both';
    cleanups.push(
      followMouse(el, {
        strength,
        maxOffset,
        axis
      })
    );
  });

  const ready = () => section.classList.add(CLASSNAMES.readyHero);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= THRESHOLDS.heroIntersect) {
          ready();
          observer.disconnect();
        }
      });
    }, { threshold: THRESHOLDS.heroIntersect });
    observer.observe(section);
    cleanups.push(() => observer.disconnect());
  } else {
    ready();
  }

  return () => {
    cleanups.forEach((fn) => fn && fn());
    section.classList.remove(CLASSNAMES.readyHero);
  };
}
