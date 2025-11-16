import { qsa } from '../dom.js';
import { clamp, lerp, mapRange } from '../math.js';

const FOLLOW_SELECTOR = '[data-follow-mouse]';
const FOLLOW_DEPTH_ATTR = 'followDepth';
const DEFAULT_STRENGTH_RANGE = [0.03, 0.1];
const DEFAULT_OFFSET_RANGE = [8, 32];
const SINGLE_STRENGTH_MULTIPLIER = 0.5;
const SINGLE_OFFSET_MULTIPLIER = 0.55;
const RETURN_FACTOR = 0.45;
const STOP_EPSILON = 0.02;

export function createFollowGroup({ root, selector = FOLLOW_SELECTOR } = {}) {
  if (typeof window === 'undefined' || !root) return () => {};

  const elements = qsa(selector, root).filter((node) => node instanceof HTMLElement);
  if (!elements.length) return () => {};

  const layers = elements.map((el) => ({
    el,
    depth: resolveDepth(el),
    strengthOverride: resolveNumber(el.dataset.strength),
    offsetOverride: resolveNumber(el.dataset.maxOffset),
    axis: el.dataset.axis ?? 'both',
    baseTransform: captureBaseTransform(el),
    currentX: 0,
    currentY: 0
  }));

  const depths = layers.map((layer) => layer.depth);
  const minDepth = Math.min(...depths);
  const maxDepth = Math.max(...depths);
  const isSingleFollower = layers.length === 1;

  layers.forEach((layer) => {
    const ratio = maxDepth === minDepth ? 1 : (layer.depth - minDepth) / (maxDepth - minDepth);
    const baseStrength = mapRange(ratio, 0, 1, DEFAULT_STRENGTH_RANGE[0], DEFAULT_STRENGTH_RANGE[1]);
    const baseOffset = mapRange(ratio, 0, 1, DEFAULT_OFFSET_RANGE[0], DEFAULT_OFFSET_RANGE[1]);
    const strengthMultiplier = isSingleFollower ? SINGLE_STRENGTH_MULTIPLIER : 1;
    const offsetMultiplier = isSingleFollower ? SINGLE_OFFSET_MULTIPLIER : 1;
    layer.strength = layer.strengthOverride ?? baseStrength * strengthMultiplier;
    layer.maxOffset = layer.offsetOverride ?? baseOffset * offsetMultiplier;
    layer.returnStrength =
      layer.strengthOverride != null
        ? layer.strengthOverride * RETURN_FACTOR
        : layer.strength * RETURN_FACTOR;
    layer.el.style.willChange = 'transform';
  });

  let targetX = 0;
  let targetY = 0;
  let rafId = null;
  let pointerActive = false;
  let bounds = root.getBoundingClientRect();

  const updateBounds = () => {
    bounds = root.getBoundingClientRect();
  };

  const resizeObserver =
    'ResizeObserver' in window ? new ResizeObserver(updateBounds) : null;
  resizeObserver?.observe(root);

  const startLoop = () => {
    if (rafId != null) return;
    rafId = window.requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafId == null) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  };

  const tick = () => {
    let shouldContinue = pointerActive;
    layers.forEach((layer) => {
      const targetTranslateX = layer.axis === 'y' ? 0 : targetX * layer.maxOffset;
      const targetTranslateY = layer.axis === 'x' ? 0 : targetY * layer.maxOffset;
      const mix = pointerActive ? layer.strength : layer.returnStrength;
      layer.currentX = lerp(layer.currentX, targetTranslateX, mix);
      layer.currentY = lerp(layer.currentY, targetTranslateY, mix);

      if (
        Math.abs(layer.currentX - targetTranslateX) > STOP_EPSILON ||
        Math.abs(layer.currentY - targetTranslateY) > STOP_EPSILON
      ) {
        shouldContinue = true;
      }

      const translate = `translate3d(${layer.currentX.toFixed(2)}px, ${layer.currentY.toFixed(2)}px, 0)`;
      layer.el.style.transform =
        layer.baseTransform && layer.baseTransform !== 'none'
          ? `${layer.baseTransform} ${translate}`
          : translate;
    });

    if (shouldContinue) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      stopLoop();
    }
  };

  const setTargetFromEvent = (event) => {
    const point = getPointerPoint(event);
    if (!point) return;
    const width = bounds.width || 1;
    const height = bounds.height || 1;
    const relX = clamp((point.x - bounds.left) / width, 0, 1);
    const relY = clamp((point.y - bounds.top) / height, 0, 1);
    targetX = relX * 2 - 1;
    targetY = relY * 2 - 1;
    startLoop();
  };

  const resetTarget = () => {
    pointerActive = false;
    targetX = 0;
    targetY = 0;
    startLoop();
  };

  const handlePointerEnter = () => {
    pointerActive = true;
    updateBounds();
    startLoop();
  };

  const handlePointerMove = (event) => {
    pointerActive = true;
    setTargetFromEvent(event);
  };

  const handleTouchMove = (event) => {
    pointerActive = true;
    setTargetFromEvent(event);
  };

  root.addEventListener('pointerenter', handlePointerEnter, { passive: true });
  root.addEventListener('pointermove', handlePointerMove);
  root.addEventListener('pointerleave', resetTarget, { passive: true });
  root.addEventListener('touchstart', handlePointerEnter, { passive: true });
  root.addEventListener('touchmove', handleTouchMove, { passive: true });
  root.addEventListener('touchend', resetTarget, { passive: true });
  root.addEventListener('touchcancel', resetTarget, { passive: true });

  return () => {
    stopLoop();
    resizeObserver?.disconnect();
    root.removeEventListener('pointerenter', handlePointerEnter);
    root.removeEventListener('pointermove', handlePointerMove);
    root.removeEventListener('pointerleave', resetTarget);
    root.removeEventListener('touchstart', handlePointerEnter);
    root.removeEventListener('touchmove', handleTouchMove);
    root.removeEventListener('touchend', resetTarget);
    root.removeEventListener('touchcancel', resetTarget);
    layers.forEach((layer) => {
      layer.el.style.removeProperty('transform');
      layer.el.style.removeProperty('will-change');
    });
  };
}

function resolveDepth(element) {
  const depthAttr = resolveNumber(element.dataset[FOLLOW_DEPTH_ATTR]);
  if (depthAttr != null) return depthAttr;
  const style = window.getComputedStyle(element);
  const parsed = Number.parseFloat(style.zIndex);
  if (Number.isFinite(parsed)) return parsed;
  return 0;
}

function resolveNumber(value) {
  if (value == null || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function captureBaseTransform(element) {
  if (typeof window === 'undefined' || !element) return '';
  const computed = window.getComputedStyle(element);
  return computed?.transform ?? '';
}

function getPointerPoint(event) {
  if ('clientX' in event && 'clientY' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  if (event.touches && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  return null;
}
