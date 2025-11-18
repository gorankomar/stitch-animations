const hasWindow = typeof window !== 'undefined';
let cachedPrefersReduce = null;
const DEFAULT_EASE_FN = (t) => 1 - Math.pow(1 - t, 3);
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const SPLINE_TABLE_SIZE = 11;
const SPLINE_STEP = 1.0 / (SPLINE_TABLE_SIZE - 1);

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

export function readMotionEaseValue(element, varName = '--motion-ease-primary', fallback = '') {
  if (!hasWindow) return fallback;
  const target = element || document.documentElement;
  const styles = window.getComputedStyle(target);
  return styles.getPropertyValue(varName)?.trim() || fallback;
}

export function readMotionEasingCurve(varName = '--motion-ease-primary', fallback = DEFAULT_EASE_FN) {
  if (!hasWindow) return fallback;
  try {
    const styles = window.getComputedStyle(document.documentElement);
    const raw = styles.getPropertyValue(varName)?.trim();
    if (!raw) return fallback;
    const easing = parseCubicBezier(raw);
    return easing || fallback;
  } catch {
    return fallback;
  }
}

export function cubicBezier(p1x, p1y, p2x, p2y) {
  if (
    !Number.isFinite(p1x) ||
    !Number.isFinite(p1y) ||
    !Number.isFinite(p2x) ||
    !Number.isFinite(p2y)
  ) {
    return null;
  }

  const sampleValues = new Float32Array(SPLINE_TABLE_SIZE);
  for (let i = 0; i < SPLINE_TABLE_SIZE; i++) {
    sampleValues[i] = calcBezier(i * SPLINE_STEP, p1x, p2x);
  }

  const getTForX = (x) => {
    let intervalStart = 0;
    let currentSample = 1;
    const lastSample = SPLINE_TABLE_SIZE - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= x; ++currentSample) {
      intervalStart += SPLINE_STEP;
    }
    --currentSample;

    const dist = (x - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * SPLINE_STEP;

    const initialSlope = getSlope(guessForT, p1x, p2x);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(x, guessForT, p1x, p2x);
    }
    if (initialSlope === 0) {
      return guessForT;
    }
    return binarySubdivide(x, intervalStart, intervalStart + kSampleStepSize, p1x, p2x);
  };

  return (x) => {
    if (p1x === p1y && p2x === p2y) return x;
    return calcBezier(getTForX(x), p1y, p2y);
  };
}

function parseCubicBezier(raw) {
  const match = raw?.match(/cubic-bezier\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1]
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((num) => Number.isFinite(num));
  if (parts.length !== 4) return null;
  return cubicBezier(parts[0], parts[1], parts[2], parts[3]);
}

function calcBezier(t, a1, a2) {
  return ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1;
}

function getSlope(t, a1, a2) {
  return 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
}

function binarySubdivide(x, a, b, mX1, mX2) {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = a + (b - a) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0) b = currentT;
    else a = currentT;
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(x, guessT, mX1, mX2) {
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const currentSlope = getSlope(guessT, mX1, mX2);
    if (currentSlope === 0) return guessT;
    const currentX = calcBezier(guessT, mX1, mX2) - x;
    guessT -= currentX / currentSlope;
  }
  return guessT;
}
