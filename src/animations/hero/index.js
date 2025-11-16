import { qs, qsa, byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { resolveRevealTimings, ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { createStackedWindowsController } from '../../lib/effects/stacked-windows.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import { toMs } from '../../lib/time.js';
import './styles.css';

const THRESHOLD = 0.25;
const BUFFER_MS = 50;
const WRAP_SELECTOR = '.stacked-windows_wrap';
const CARD_SELECTOR = '.stacked-windows_img-wrap';

export function init(root = document) {
  if (typeof window === 'undefined' || !root) return () => {};

  const section = qs(byData(ATTR.anim, DATA_ATTRS.hero), root);
  if (!section) return () => {};

  return whenVisible(section, () => setupHeroSection(section));
}

function setupHeroSection(section) {
  const wraps = qsa(WRAP_SELECTOR, section);
  if (!wraps.length) return () => {};

  const timings = resolveRevealTimings();
  const revealController = ensureSectionReveal(section);

  const readyTimeouts = new Map();
  const layoutCleanup = wraps.map((wrap) => createStackedWindowsController(wrap));

  const activateWrap = (wrap, enterDuration, stagger, revealDuration) => {
    wrap.classList.add('is-inview');
    const cards = qsa(CARD_SELECTOR, wrap);
    const staggerMs = toMs(stagger, timings.stagger);
    const structuralDelay =
      toMs(enterDuration, timings.duration) + Math.max(0, cards.length - 1) * staggerMs;
    const totalDelay = Math.max(structuralDelay, revealDuration) + BUFFER_MS;

    const timeoutId = window.setTimeout(() => {
      wrap.classList.add('is-ready');
      readyTimeouts.delete(wrap);
    }, totalDelay);
    readyTimeouts.set(wrap, timeoutId);
  };

  let observer = null;

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const wrap = entry.target;
          const computed = getComputedStyle(wrap);
          const stagger =
            wrap.dataset.stagger ||
            computed.getPropertyValue('--reveal-stagger') ||
            `${timings.stagger}ms`;
          const enterDur =
            wrap.dataset.dur ||
            computed.getPropertyValue('--reveal-duration') ||
            `${timings.duration}ms`;

          wrap.style.setProperty('--reveal-stagger', stagger.trim());
          wrap.style.setProperty('--reveal-duration', enterDur.trim());

          observer?.unobserve(wrap);
          const revealDuration = revealController.ensure();
          activateWrap(wrap, enterDur, stagger, revealDuration);
        });
      },
      { threshold: THRESHOLD }
    );

    wraps.forEach((wrap) => observer?.observe(wrap));
  } else {
    revealController.ensure();
    wraps.forEach((wrap) => wrap.classList.add('is-inview', 'is-ready'));
  }

  return () => {
    observer?.disconnect();
    revealController.cancel();
    readyTimeouts.forEach((id) => window.clearTimeout(id));
    layoutCleanup.forEach((dispose) => dispose());
    wraps.forEach((wrap) => wrap.classList.remove('is-inview', 'is-ready'));
  };
}
