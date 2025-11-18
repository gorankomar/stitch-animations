const DEFAULT_THRESHOLD = 0.25;
const DATA_ATTR = 'visibilityThreshold';

const clamp01 = (value, fallback = DEFAULT_THRESHOLD) => {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) return fallback;
  if (num <= 0) return 0;
  if (num >= 1) return 1;
  return num;
};

export function whenVisible(target, callback, options = {}) {
  if (!target || typeof callback !== 'function') return () => {};

  const threshold = resolveThreshold(target, options.threshold);
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    const cleanup = callback() || null;
    return () => (typeof cleanup === 'function' ? cleanup() : undefined);
  }

  let cleanupFn = null;
  const run = () => {
    if (cleanupFn) return;
    cleanupFn = callback() || null;
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.intersectionRatio >= threshold) {
          io.disconnect();
          run();
        }
      });
    },
    {
      threshold: buildThresholdList(threshold),
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? '0px'
    }
  );

  io.observe(target);

  return () => {
    io.disconnect();
    if (typeof cleanupFn === 'function') {
      cleanupFn();
    }
  };
}

export function resolveVisibilityThreshold(target, fallback = DEFAULT_THRESHOLD) {
  if (typeof fallback !== 'number') {
    fallback = DEFAULT_THRESHOLD;
  }
  const attrValue = target?.dataset?.[DATA_ATTR];
  if (attrValue != null && attrValue !== '') {
    return clamp01(attrValue, clamp01(fallback));
  }
  return clamp01(fallback);
}

function resolveThreshold(target, override) {
  if (typeof override === 'number') {
    return clamp01(override);
  }
  return resolveVisibilityThreshold(target, DEFAULT_THRESHOLD);
}

function buildThresholdList(value) {
  if (value <= 0) return [0];
  if (value >= 1) return [1];
  return [value];
}

export { DEFAULT_THRESHOLD as DEFAULT_VISIBILITY_THRESHOLD };
