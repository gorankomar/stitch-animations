import { whenVisible } from './threshold.js';

const RAD_TO_DEG = 180 / Math.PI;
const DEFAULT_OPTIONS = Object.freeze({
  sweepDuration: 2200,
  loopDelay: 700,
  rotationSnap: 45,
  threshold: 0.5
});

export function createGlowSweep(options = {}) {
  if (typeof window === 'undefined') return () => {};

  const {
    wrap,
    template,
    host = template?.parentElement ?? wrap,
    pointerTarget = wrap,
    sweepDuration = DEFAULT_OPTIONS.sweepDuration,
    loopDelay = DEFAULT_OPTIONS.loopDelay,
    rotationSnap = DEFAULT_OPTIONS.rotationSnap,
    threshold = DEFAULT_OPTIONS.threshold
  } = options;

  if (!wrap || !template || !host) return () => {};

  template.remove();

  let loopId = null;
  let pointerInside = false;
  let isVisible = false;
  let hasPlayedInitial = false;
  let currentRotation = 0;
  const activeGlows = new Set();
  const loopInterval = sweepDuration + loopDelay;

  const setRotation = (deg) => {
    currentRotation = deg;
  };

  const spawnGlow = (force = false) => {
    if (!force && !pointerInside) return;
    const clone = template.cloneNode(true);
    clone.classList.remove('is-glow-active');
    clone.style.setProperty('--api-glow-rotation', `${currentRotation}deg`);
    host.appendChild(clone);
    void clone.offsetWidth;
    clone.classList.add('is-glow-active');

    const entry = { node: clone, timeout: null, removal: null };
    entry.timeout = window.setTimeout(() => {
      clone.classList.remove('is-glow-active');
      entry.removal = window.setTimeout(() => clone.remove(), 200);
      activeGlows.delete(entry);
    }, sweepDuration);

    activeGlows.add(entry);
    return entry;
  };

  const startLoop = () => {
    if (loopId != null) return;
    spawnGlow(true);
    loopId = window.setInterval(() => spawnGlow(true), loopInterval);
  };

  const stopLoop = () => {
    if (loopId != null) {
      window.clearInterval(loopId);
      loopId = null;
    }
  };

  const cleanupGlows = () => {
    activeGlows.forEach((entry) => {
      window.clearTimeout(entry.timeout);
      if (entry.removal != null) {
        window.clearTimeout(entry.removal);
      }
      entry.node.classList.remove('is-glow-active');
      window.setTimeout(() => entry.node.remove(), 150);
    });
    activeGlows.clear();
  };

  const updateRotationFromEvent = (event) => {
    const point = getPointFromEvent(event);
    if (!point) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(point.clientY - cy, point.clientX - cx) * RAD_TO_DEG;
    const travel = normalizeAngle(angle + 180);
    const snapped = snapAngle(travel, rotationSnap);
    setRotation(snapped);
  };

  const handleEnter = (event) => {
    pointerInside = true;
    updateRotationFromEvent(event);
    if (isVisible) {
      startLoop();
    }
  };

  const handleLeave = () => {
    pointerInside = false;
    stopLoop();
  };

  const handlePointerDown = () => {
    if (isVisible) {
      spawnGlow(true);
    }
  };

  const handleTouchStart = (event) => {
    pointerInside = true;
    updateRotationFromEvent(event);
    if (isVisible) {
      startLoop();
    }
  };

  pointerTarget?.addEventListener('pointerenter', handleEnter, { passive: true });
  pointerTarget?.addEventListener('pointerleave', handleLeave, { passive: true });
  pointerTarget?.addEventListener('pointerdown', handlePointerDown);
  pointerTarget?.addEventListener('touchstart', handleTouchStart, { passive: true });
  pointerTarget?.addEventListener('touchend', handleLeave, { passive: true });
  pointerTarget?.addEventListener('touchcancel', handleLeave, { passive: true });

  const visibilityCleanup = whenVisible(
    wrap,
    () => {
      isVisible = true;
      if (!hasPlayedInitial) {
        hasPlayedInitial = true;
        spawnGlow(true);
      }
      if (pointerInside) {
        startLoop();
      }
      return () => {
        isVisible = false;
        stopLoop();
        cleanupGlows();
      };
    },
    { threshold }
  );

  return () => {
    pointerTarget?.removeEventListener('pointerenter', handleEnter);
    pointerTarget?.removeEventListener('pointerleave', handleLeave);
    pointerTarget?.removeEventListener('pointerdown', handlePointerDown);
    pointerTarget?.removeEventListener('touchstart', handleTouchStart);
    pointerTarget?.removeEventListener('touchend', handleLeave);
    pointerTarget?.removeEventListener('touchcancel', handleLeave);
    stopLoop();
    cleanupGlows();
    visibilityCleanup?.();
  };
}

function getPointFromEvent(event) {
  if ('clientX' in event && 'clientY' in event) {
    return { clientX: event.clientX, clientY: event.clientY };
  }
  if (event.touches && event.touches[0]) {
    return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
  }
  return null;
}

function snapAngle(angle, snap = DEFAULT_OPTIONS.rotationSnap) {
  if (!snap) return angle;
  return Math.round(angle / snap) * snap;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}
