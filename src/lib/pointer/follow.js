import { subscribePointer, ensurePointerEngine } from './engine.js';

const defaultOptions = {
  axis: 'both',
  strength: 0.08,
  maxOffset: 24,
  lerp: true
};

export function followMouse(el, options = {}) {
  if (!el) return () => {};
  ensurePointerEngine();

  const settings = { ...defaultOptions, ...options };
  let currentX = 0;
  let currentY = 0;

  const unsubscribe = subscribePointer((state) => {
    const { normalized } = state;
    const targetX = normalized.x * settings.maxOffset;
    const targetY = normalized.y * settings.maxOffset;

    const nextX =
      settings.axis === 'y'
        ? 0
        : settings.lerp
        ? currentX + (targetX - currentX) * settings.strength
        : targetX;
    const nextY =
      settings.axis === 'x'
        ? 0
        : settings.lerp
        ? currentY + (targetY - currentY) * settings.strength
        : targetY;

    currentX = nextX;
    currentY = nextY;
    el.style.setProperty('--mouse-follow-x', `${nextX.toFixed(2)}px`);
    el.style.setProperty('--mouse-follow-y', `${nextY.toFixed(2)}px`);
    el.style.transform = `translate3d(${nextX.toFixed(2)}px, ${nextY.toFixed(2)}px, 0)`;
  });

  el.style.willChange = 'transform';

  return () => {
    unsubscribe();
    el.style.removeProperty('--mouse-follow-x');
    el.style.removeProperty('--mouse-follow-y');
    el.style.removeProperty('transform');
    el.style.removeProperty('will-change');
  };
}

export { ensurePointerEngine } from './engine.js';
