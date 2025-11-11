const defaultOptions = {
  axis: 'both',
  strength: 0.08,
  maxOffset: 24,
  lerp: true
};

const state = {
  container: null,
  containerBounds: { width: 1, height: 1, left: 0, top: 0 },
  pointer: { x: 0, y: 0 },
  normalized: { x: 0, y: 0 },
  frame: null,
  started: false,
  subscribers: new Set(),
  cleanup: null
};

const hasWindow = typeof window !== 'undefined';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateBounds() {
  if (!state.container) return;
  if (state.container === window) {
    state.containerBounds = {
      width: window.innerWidth || 1,
      height: window.innerHeight || 1,
      left: 0,
      top: 0
    };
    return;
  }
  const rect = state.container.getBoundingClientRect();
  state.containerBounds = {
    width: rect.width || 1,
    height: rect.height || 1,
    left: rect.left,
    top: rect.top
  };
}

function updatePointer(event) {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  const { width, height, left, top } = state.containerBounds;
  const relX = clamp((event.clientX - left) / width, 0, 1);
  const relY = clamp((event.clientY - top) / height, 0, 1);
  state.normalized.x = (relX - 0.5) * 2;
  state.normalized.y = (relY - 0.5) * 2;
}

function applyTransforms() {
  state.subscribers.forEach((sub) => {
    const targetX = clamp(state.normalized.x * sub.maxOffset, -sub.maxOffset, sub.maxOffset);
    const targetY = clamp(state.normalized.y * sub.maxOffset, -sub.maxOffset, sub.maxOffset);

    const nextX = sub.axis === 'y' ? 0 : sub.lerp ? sub.currentX + (targetX - sub.currentX) * sub.strength : targetX;
    const nextY = sub.axis === 'x' ? 0 : sub.lerp ? sub.currentY + (targetY - sub.currentY) * sub.strength : targetY;

    sub.currentX = nextX;
    sub.currentY = nextY;

    sub.el.style.setProperty('--mouse-follow-x', `${nextX.toFixed(2)}px`);
    sub.el.style.setProperty('--mouse-follow-y', `${nextY.toFixed(2)}px`);
    sub.el.style.transform = `translate3d(${nextX.toFixed(2)}px, ${nextY.toFixed(2)}px, 0)`;
  });

  state.frame = window.requestAnimationFrame(applyTransforms);
}

function startLoop() {
  if (!hasWindow) return;
  if (state.frame) {
    window.cancelAnimationFrame(state.frame);
  }
  state.frame = window.requestAnimationFrame(applyTransforms);
}

export function ensureMouseEngine({ container = hasWindow ? window : null } = {}) {
  if (!hasWindow || !container) return () => {};
  if (state.started) return state.cleanup ?? (() => {});

  state.container = container;
  updateBounds();

  const pointerHandler = (event) => updatePointer(event);
  const resizeHandler = () => updateBounds();

  container.addEventListener('pointermove', pointerHandler, { passive: true });
  container.addEventListener('mousemove', pointerHandler, { passive: true });
  if (container === window) {
    window.addEventListener('resize', resizeHandler);
  } else {
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', resizeHandler, { passive: true });
  }

  startLoop();
  state.started = true;

  const cleanup = () => {
    if (!state.started) return;
    container.removeEventListener('pointermove', pointerHandler);
    container.removeEventListener('mousemove', pointerHandler);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('scroll', resizeHandler);
    if (state.frame) {
      window.cancelAnimationFrame(state.frame);
      state.frame = null;
    }
    state.started = false;
    state.container = null;
    state.cleanup = null;
  };

  state.cleanup = cleanup;
  return cleanup;
}

export function followMouse(el, options = {}) {
  if (!el) return () => {};
  const settings = {
    ...defaultOptions,
    ...options
  };

  const subscriber = {
    el,
    axis: ['x', 'y', 'both'].includes(settings.axis) ? settings.axis : 'both',
    strength: settings.strength,
    maxOffset: settings.maxOffset,
    lerp: settings.lerp,
    currentX: 0,
    currentY: 0
  };

  state.subscribers.add(subscriber);
  el.style.willChange = 'transform';

  return () => {
    if (!state.subscribers.has(subscriber)) return;
    state.subscribers.delete(subscriber);
    el.style.removeProperty('--mouse-follow-x');
    el.style.removeProperty('--mouse-follow-y');
    el.style.removeProperty('will-change');
    el.style.removeProperty('transform');
    if (!state.subscribers.size && state.cleanup) {
      state.cleanup();
    }
  };
}
