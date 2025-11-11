import { clamp } from '../math.js';

const hasWindow = typeof window !== 'undefined';

const state = {
  container: null,
  bounds: { width: 1, height: 1, left: 0, top: 0 },
  pointer: { x: 0, y: 0 },
  normalized: { x: 0, y: 0 },
  subscribers: new Set(),
  frame: null,
  started: false
};

function readBounds(container) {
  if (!container || !hasWindow) return;
  if (container === window) {
    state.bounds = {
      width: window.innerWidth || 1,
      height: window.innerHeight || 1,
      left: 0,
      top: 0
    };
    return;
  }
  const rect = container.getBoundingClientRect();
  state.bounds = {
    width: rect.width || 1,
    height: rect.height || 1,
    left: rect.left,
    top: rect.top
  };
}

function updatePointer(event) {
  const { width, height, left, top } = state.bounds;
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;

  const relX = clamp((event.clientX - left) / width, 0, 1);
  const relY = clamp((event.clientY - top) / height, 0, 1);

  state.normalized.x = relX * 2 - 1;
  state.normalized.y = relY * 2 - 1;
}

function applySubscribers() {
  state.subscribers.forEach((subscriber) => subscriber(state));
  state.frame = window.requestAnimationFrame(applySubscribers);
}

function startLoop() {
  if (state.frame || !hasWindow) return;
  state.frame = window.requestAnimationFrame(applySubscribers);
}

function stopLoop() {
  if (!state.frame || !hasWindow) return;
  window.cancelAnimationFrame(state.frame);
  state.frame = null;
}

export function ensurePointerEngine({ container = hasWindow ? window : null } = {}) {
  if (!container || !hasWindow) return () => {};
  if (state.started) return state.cleanup ?? (() => {});

  state.container = container;
  readBounds(container);

  const handler = (event) => updatePointer(event);
  const resizeHandler = () => readBounds(container);

  container.addEventListener('pointermove', handler, { passive: true });
  container.addEventListener('mousemove', handler, { passive: true });
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('scroll', resizeHandler, { passive: true });

  startLoop();
  state.started = true;

  const cleanup = () => {
    if (!state.started) return;
    container.removeEventListener('pointermove', handler);
    container.removeEventListener('mousemove', handler);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('scroll', resizeHandler);
    stopLoop();
    state.started = false;
    state.container = null;
    state.subscribers.clear();
    state.cleanup = null;
  };

  state.cleanup = cleanup;
  return cleanup;
}

export function subscribePointer(fn) {
  if (!hasWindow) return () => {};
  state.subscribers.add(fn);
  startLoop();
  return () => {
    state.subscribers.delete(fn);
    if (!state.subscribers.size) {
      stopLoop();
    }
  };
}

export function getPointerState() {
  return {
    ...state,
    bounds: { ...state.bounds },
    pointer: { ...state.pointer },
    normalized: { ...state.normalized }
  };
}
