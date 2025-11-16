import { qsa, byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { createFollowGroup } from '../../lib/effects/follow-group.js';
import { resolveRevealTimings, ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import './styles.css';

const GLOW_SWEEP_MS = 2200;
const GLOW_LOOP_DELAY_MS = 700;
const GLOW_LOOP_INTERVAL = GLOW_SWEEP_MS + GLOW_LOOP_DELAY_MS;
const GLOW_DIRECTION_SNAP = 45;
const RAD_TO_DEG = 180 / Math.PI;

export function init(root = document) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.api), root);
  if (!sections.length) return () => {};

  const disposers = sections.map((section) => whenVisible(section, () => setupApiSection(section)));

  return () => disposers.forEach((fn) => fn && fn());
}

function setupApiSection(section) {
  const timings = resolveRevealTimings();
  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const cleanups = [() => revealController.cancel()];

  qsa('.api-graphic_wrap', section).forEach((wrap) => {
    const track = wrap.querySelector('[data-follow-mouse]');
    const block = wrap.querySelector('.api-graphic_block');
    const ripple = wrap.querySelector('.api-graphic_ripple');
    if (!track || !block) return;

    cleanups.push(createFollowGroup({ root: wrap }));
    cleanups.push(createApiPressInteractions({ wrap, block, ripple }));
    cleanups.push(createGlowSweep(wrap));
  });

  return () => cleanups.forEach((fn) => fn && fn());
}

function createApiPressInteractions({ wrap, block, ripple }) {
  const press = () => {
    block.classList.remove('is-pressing');
    void block.offsetWidth;
    block.classList.add('is-pressing');
    if (ripple) {
      ripple.classList.remove('is-ripple');
      void ripple.offsetWidth;
      ripple.classList.add('is-ripple');
    }
  };

  const onRippleEnd = () => ripple?.classList.remove('is-ripple');
  const onBlockEnd = () => block?.classList.remove('is-pressing');

  wrap.addEventListener('pointerdown', press);
  ripple?.addEventListener('animationend', onRippleEnd);
  block.addEventListener('animationend', onBlockEnd);

  return () => {
    wrap.removeEventListener('pointerdown', press);
    ripple?.removeEventListener('animationend', onRippleEnd);
    block.removeEventListener('animationend', onBlockEnd);
  };
}

function createGlowSweep(wrap) {
  if (typeof window === 'undefined') return () => {};
  const template = wrap.querySelector('.api-graphic_glow');
  if (!template) return () => {};
  const host = template.parentElement || wrap;
  template.remove();

  let loopId = null;
  let pointerInside = false;
  let isVisible = false;
  let hasPlayedInitial = false;
  let currentRotation = 0;
  const activeGlows = new Set();
  const threshold = parseNumber(wrap.dataset.visibilityThreshold, 0.5);

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
    }, GLOW_SWEEP_MS);

    activeGlows.add(entry);
    return entry;
  };

  const startLoop = () => {
    if (loopId != null) return;
    spawnGlow(true);
    loopId = window.setInterval(() => spawnGlow(true), GLOW_LOOP_INTERVAL);
  };

  const stopLoop = () => {
    if (loopId != null) {
      window.clearInterval(loopId);
      loopId = null;
    }
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

  wrap.addEventListener('pointerenter', handleEnter, { passive: true });
  wrap.addEventListener('pointerleave', handleLeave, { passive: true });
  wrap.addEventListener('pointerdown', handlePointerDown);
  wrap.addEventListener('touchstart', handleTouchStart, { passive: true });
  wrap.addEventListener('touchend', handleLeave, { passive: true });
  wrap.addEventListener('touchcancel', handleLeave, { passive: true });

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

  function cleanupGlows() {
    activeGlows.forEach((entry) => {
      window.clearTimeout(entry.timeout);
      if (entry.removal != null) {
        window.clearTimeout(entry.removal);
      }
      entry.node.classList.remove('is-glow-active');
      window.setTimeout(() => entry.node.remove(), 150);
    });
    activeGlows.clear();
  }

  function updateRotationFromEvent(event) {
    const point = getPointFromEvent(event);
    if (!point) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(point.clientY - cy, point.clientX - cx) * RAD_TO_DEG;
    const travel = normalizeAngle(angle + 180);
    const snapped = snapAngle(travel);
    setRotation(snapped);
  }

  return () => {
    wrap.removeEventListener('pointerenter', handleEnter);
    wrap.removeEventListener('pointerleave', handleLeave);
    wrap.removeEventListener('pointerdown', handlePointerDown);
    wrap.removeEventListener('touchstart', handleTouchStart);
    wrap.removeEventListener('touchend', handleLeave);
    wrap.removeEventListener('touchcancel', handleLeave);
    stopLoop();
    cleanupGlows();
    visibilityCleanup?.();
  };
}

function parseNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getPointFromEvent(event) {
  if (!event) return null;
  if ('touches' in event && event.touches.length) {
    return event.touches[0];
  }
  return event;
}

function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function snapAngle(angle) {
  const snapped = Math.round(angle / GLOW_DIRECTION_SNAP) * GLOW_DIRECTION_SNAP;
  return normalizeAngle(snapped);
}
