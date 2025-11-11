export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_OUT_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const DURATION_MS = 900;
export const FAST_DURATION_MS = 450;
export const SPRING = Object.freeze({ stiffness: 0.12, damping: 0.1 });

export function msToSeconds(ms = DURATION_MS) {
  return ms / 1000;
}
