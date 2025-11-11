import { qs, qsa, byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';

const THRESHOLD = 0.25;
const BUFFER_MS = 50;
const DEFAULT_STAGGER_MS = 200;
const DEFAULT_DURATION_MS = 700;
const REVEAL_SELECTOR = '[data-reveal]';
const REVEAL_CLASS = 'is-reveal';

const toMs = (value, fallback = 0) => {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) return fallback;
  return trimmed.endsWith('ms') ? num : num * 1000;
};

const readRevealAttr = (el, key) => {
  if (el.dataset?.[key]) return el.dataset[key];
  const group = el.closest('[data-reveal-group]');
  if (group?.dataset?.[key]) return group.dataset[key];
  return null;
};

const applyRevealOverrides = (el) => {
  const durationValue = readRevealAttr(el, 'revealDuration');
  const offsetValue = readRevealAttr(el, 'revealOffset');
  const easeValue = readRevealAttr(el, 'revealEase');

  if (durationValue) el.style.setProperty('--reveal-duration', durationValue);
  if (offsetValue) el.style.setProperty('--reveal-offset', offsetValue);
  if (easeValue) el.style.setProperty('--motion-ease-primary', easeValue);

  return toMs(durationValue, DEFAULT_DURATION_MS);
};

export function init(root = document) {
  if (typeof window === 'undefined' || !root) return () => {};

  const section = qs(byData(ATTR.anim, DATA_ATTRS.hero), root);
  if (!section) return () => {};

  const wraps = qsa('.stacked-windows_wrap', section);
  if (!wraps.length) return () => {};

  const revealEls = qsa(REVEAL_SELECTOR, section);
  if (!revealEls.length) return () => {};
  revealEls.forEach((el) => el.classList.remove(REVEAL_CLASS));

  const revealTimeouts = [];
  let revealStarted = false;
  let revealEndsAt = 0;

  const scheduleReveal = (el, delay) => {
    const timeoutId = window.setTimeout(() => {
      el.classList.add(REVEAL_CLASS);
    }, delay);
    revealTimeouts.push(timeoutId);
  };

  const startRevealSequence = () => {
    const groupStagger = revealEls.length
      ? toMs(readRevealAttr(revealEls[0], 'revealStagger'), DEFAULT_STAGGER_MS)
      : DEFAULT_STAGGER_MS;
    const effectiveStagger = Number.isFinite(groupStagger) ? groupStagger : DEFAULT_STAGGER_MS;
    let longest = 0;

    revealEls.forEach((el, idx) => {
      const extraDelay = toMs(readRevealAttr(el, 'revealDelay'), 0);
      const delay = idx * effectiveStagger + extraDelay;
      const durationMs = applyRevealOverrides(el);
      scheduleReveal(el, delay);
      longest = Math.max(longest, delay + durationMs);
    });

    return longest || effectiveStagger;
  };

  const ensureRevealSequence = () => {
    if (!revealEls.length) return 0;
    const now = performance.now();
    if (!revealStarted) {
      revealStarted = true;
      const duration = startRevealSequence();
      revealEndsAt = now + duration;
      return duration;
    }
    return Math.max(0, revealEndsAt - now);
  };

  const wrapReadyTimeouts = new Map();

  const activateWrap = (wrap, enterDur, stagger, cards, revealDuration) => {
    wrap.classList.add('is-inview');
    const staggerMs = toMs(stagger, DEFAULT_STAGGER_MS);
    const structuralDelay =
      toMs(enterDur, 1500) + Math.max(0, cards.length - 1) * staggerMs;
    const totalDelay = Math.max(structuralDelay, revealDuration) + BUFFER_MS;

    const readyTimeout = window.setTimeout(() => {
      wrap.classList.add('is-ready');
      wrapReadyTimeouts.delete(wrap);
    }, totalDelay);
    wrapReadyTimeouts.set(wrap, readyTimeout);
  };

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const wrap = entry.target;
          const computed = getComputedStyle(wrap);
          const stagger = wrap.dataset.stagger || computed.getPropertyValue('--stagger') || '0.25s';
          const enterDur = wrap.dataset.dur || computed.getPropertyValue('--enter-dur') || '1.5s';

          wrap.style.setProperty('--stagger', stagger.trim());
          wrap.style.setProperty('--enter-dur', enterDur.trim());

          const cards = wrap.querySelectorAll('.stacked-windows_img-wrap');
          cards.forEach((card, idx) => card.style.setProperty('--i', idx));

          observer?.unobserve(wrap);
          const revealDuration = ensureRevealSequence();
          activateWrap(wrap, enterDur, stagger, cards, revealDuration);
        });
      },
      { threshold: THRESHOLD }
    );

    wraps.forEach((wrap) => observer.observe(wrap));
  } else {
    ensureRevealSequence();
    wraps.forEach((wrap) => {
      wrap.classList.add('is-inview', 'is-ready');
    });
  }

  return () => {
    observer?.disconnect();
    wrapReadyTimeouts.forEach((id) => window.clearTimeout(id));
    revealTimeouts.forEach((id) => window.clearTimeout(id));
    wraps.forEach((wrap) => wrap.classList.remove('is-inview', 'is-ready'));
    revealEls.forEach((el) => el.classList.remove(REVEAL_CLASS));
  };
}
