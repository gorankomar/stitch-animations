const hasWindow = typeof window !== 'undefined';
let cachedPrefersReduce = null;

export function prefersReducedMotion() {
  if (!hasWindow || typeof window.matchMedia !== 'function') return false;
  if (cachedPrefersReduce !== null) return cachedPrefersReduce;
  cachedPrefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return cachedPrefersReduce;
}

export function remToPx(multiplier = 1) {
  if (!hasWindow) return 16 * multiplier;
  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return rootSize * multiplier;
}
