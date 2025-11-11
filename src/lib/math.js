export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const lerp = (from, to, alpha) => from + (to - from) * alpha;

export const approxZero = (value, epsilon = 0.0001) => Math.abs(value) <= epsilon;

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
};
