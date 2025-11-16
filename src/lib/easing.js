const FALLBACKS = Object.freeze({
  ease: 'cubic-bezier(.11, .61, .27, .99)',
  duration: 770,
  fastDuration: Math.round(770 * 0.6)
});

const CSS_VARS = Object.freeze({
  ease: '--motion-ease-primary',
  duration: '--motion-duration-default',
  fastDuration: '--motion-duration-fast'
});

const toMs = (value, fallback) => {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  const num = Number.parseFloat(trimmed);
  if (!Number.isFinite(num)) return fallback;
  return trimmed.endsWith('ms') ? num : num * 1000;
};

const readCssVar = (varName) => {
  if (typeof window === 'undefined' || !varName) return '';
  const styles = window.getComputedStyle(document.documentElement);
  return styles.getPropertyValue(varName).trim();
};

export const EASE = getPrimaryEase();
export const DURATION_MS = getDefaultDurationMs();
export const FAST_DURATION_MS = getFastDurationMs();
export const EASE_OUT_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const SPRING = Object.freeze({ stiffness: 0.12, damping: 0.1 });

export function getPrimaryEase() {
  return readCssVar(CSS_VARS.ease) || FALLBACKS.ease;
}

export function getDefaultDurationMs() {
  const cssValue = readCssVar(CSS_VARS.duration);
  return toMs(cssValue, FALLBACKS.duration);
}

export function getFastDurationMs() {
  const cssValue = readCssVar(CSS_VARS.fastDuration);
  return toMs(cssValue, FALLBACKS.fastDuration);
}

export function msToSeconds(ms = DURATION_MS) {
  return ms / 1000;
}
