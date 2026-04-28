import { clamp } from '../math.js';
const DEFAULT_OPTIONS = {
  bgColor: 'transparent',
  dotColor: 'rgba(196,200,208,.5)',
  baseSize: 1.2,
  baseAlpha: 0.52,
  highlightAlpha: 0.92,
  minAlpha: 0.25,
  gap: 20,
  radius: 200,
  outsideFade: 500,
  blurWidth: 0.5,
  spring: 0.015,
  damping: 0.78,
  transitionMs: 700
};

export function createDotsField({
  canvas,
  sensor,
  pointerTarget = window,
  options = {}
} = {}) {
  if (typeof window === 'undefined' || !canvas || !sensor) return () => {};

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const OPT = { ...DEFAULT_OPTIONS, ...options };
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const falloffEase = (t) => 1 - (1 - t) * (1 - t);

  let width = 0;
  let height = 0;
  let points = [];

  const OFF = { x: -9999, y: -9999 };
  const target = { x: OFF.x, y: OFF.y };
  const pointer = { x: OFF.x, y: OFF.y, vx: 0, vy: 0 };
  let pointerActive = false;
  let retreatCenter = { x: OFF.x, y: OFF.y };
  let effectProgress = 0;
  let effectTarget = 0;

  const nowMs = () => performance.now();
  let lastStepMs = nowMs();

  function resize() {
    const prevPixelWidth = canvas.width || 0;
    const prevPixelHeight = canvas.height || 0;
    let snapshot = null;
    if (prevPixelWidth && prevPixelHeight) {
      const buffer = document.createElement('canvas');
      buffer.width = prevPixelWidth;
      buffer.height = prevPixelHeight;
      const bufferCtx = buffer.getContext('2d');
      if (bufferCtx) {
        bufferCtx.drawImage(canvas, 0, 0);
        snapshot = buffer;
      }
    }

    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    if (snapshot) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(
        snapshot,
        0,
        0,
        prevPixelWidth,
        prevPixelHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();
    }
    const pad = OPT.radius + OPT.gap;
    const spanX = width + pad * 2;
    const spanY = height + pad * 2;
    const cols = Math.ceil(spanX / OPT.gap) + 1;
    const rows = Math.ceil(spanY / OPT.gap) + 1;
    const gridWidth = (cols - 1) * OPT.gap;
    const gridHeight = (rows - 1) * OPT.gap;
    const startX = -pad + (spanX - gridWidth) / 2;
    const startY = -pad + (spanY - gridHeight) / 2;

    points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({ x: startX + c * OPT.gap, y: startY + r * OPT.gap });
      }
    }
  }

  function hoverAlphaAt(px, py) {
    if (effectProgress <= 0.0001) return OPT.baseAlpha;
    const center = pointerActive ? pointer : retreatCenter;
    const dx = px - center.x;
    const dy = py - center.y;
    const dist = Math.hypot(dx, dy);
    const innerRadius = Math.max(0, OPT.radius);
    const radius = innerRadius > 0 ? innerRadius : 0.0001;
    let alpha = OPT.baseAlpha;

    if (innerRadius > 0 && dist <= radius) {
      const t = clamp(1 - dist / radius, 0, 1);
      const eased = falloffEase(t) * effectProgress;
      alpha = OPT.baseAlpha + (OPT.highlightAlpha - OPT.baseAlpha) * eased;
    }

    const outsideRange = OPT.outsideFade;
    if (outsideRange <= 0) return clamp(alpha, OPT.minAlpha, OPT.highlightAlpha);
    const extra = dist - radius;
    if (extra <= 0) return clamp(alpha, OPT.minAlpha, OPT.highlightAlpha);

    const normalized = clamp(extra / outsideRange, 0, 1);
    const front = clamp(1 - effectProgress, 0, 1);
    if (normalized <= front) return clamp(alpha, OPT.minAlpha, OPT.highlightAlpha);

    const bandWidth = Math.max(0.01, Math.min(1, OPT.blurWidth ?? 0.35));
    const end = Math.min(1, front + bandWidth);
    if (normalized >= end) return OPT.minAlpha;
    const t = (normalized - front) / Math.max(1e-4, end - front);
    const eased = t * t * (3 - 2 * t);
    const faded = OPT.minAlpha + (alpha - OPT.minAlpha) * (1 - eased);
    return clamp(faded, OPT.minAlpha, OPT.highlightAlpha);
  }

  function beginRetreat() {
    if (!pointerActive && effectTarget === 0) return;
    retreatCenter = { x: pointer.x, y: pointer.y };
    pointerActive = false;
    setHoverTargets(false);
  }

  const localRectTarget = sensor;
  const pointerToLocal = (clientX, clientY) => {
    const rect = localRectTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      x,
      y,
      inside: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
    };
  };

  const syncPointer = (pos) => {
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.vx = 0;
    pointer.vy = 0;
  };

  const setHoverTargets = (active) => {
    effectTarget = active ? 1 : 0;
  };
  setHoverTargets(false);

  const engagePointer = (pos) => {
    if (!pos) return;
    if (!pointerActive) {
      syncPointer(pos);
      pointerActive = true;
      setHoverTargets(true);
    }
    retreatCenter = { x: pos.x, y: pos.y };
    target.x = pos.x;
    target.y = pos.y;
  };

  const smoothToward = (value, targetValue, durationMs, dtSeconds) => {
    if (!isFinite(durationMs) || durationMs <= 0) return targetValue;
    const tau = Math.max(1e-4, durationMs / 1000);
    const alpha = 1 - Math.exp(-dtSeconds / tau);
    return value + (targetValue - value) * alpha;
  };

  let rafId = null;
  function step() {
    const frameMs = nowMs();
    const dt = Math.min(0.1, Math.max(0, (frameMs - lastStepMs) / 1000));
    lastStepMs = frameMs;
    effectProgress = smoothToward(effectProgress, effectTarget, OPT.transitionMs, dt);

    const ax = (target.x - pointer.x) * OPT.spring;
    const ay = (target.y - pointer.y) * OPT.spring;
    pointer.vx = (pointer.vx + ax) * OPT.damping;
    pointer.vy = (pointer.vy + ay) * OPT.damping;
    pointer.x += pointer.vx;
    pointer.y += pointer.vy;

    if (OPT.bgColor !== 'transparent') {
      ctx.fillStyle = OPT.bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.fillStyle = OPT.dotColor;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const hoverAlpha = hoverAlphaAt(point.x, point.y);
      const finalAlpha = clamp(hoverAlpha, OPT.minAlpha, OPT.highlightAlpha);
      if (finalAlpha <= 0) continue;

      ctx.globalAlpha = finalAlpha;
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(0.12, OPT.baseSize), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId = window.requestAnimationFrame(step);
  }

  const globalHandlers = [];
  const addGlobal = (targetNode, type, handler, opts) => {
    if (!targetNode?.addEventListener) return;
    targetNode.addEventListener(type, handler, opts);
    globalHandlers.push(() => targetNode.removeEventListener(type, handler, opts));
  };

  const mouseMove = (event) => {
    const pos = pointerToLocal(event.clientX, event.clientY);
    if (!pos.inside) {
      if (pointerActive) beginRetreat();
      return;
    }
    engagePointer(pos);
  };
  const mousePointerDown = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (event.button !== undefined && event.button !== 0) return;
    const pos = pointerToLocal(event.clientX, event.clientY);
    if (!pos.inside) return;
    engagePointer(pos);
  };
  const mouseLeave = () => beginRetreat();

  addGlobal(pointerTarget, 'mousemove', mouseMove, { passive: true });
  addGlobal(pointerTarget, 'pointerdown', mousePointerDown, { passive: true });
  addGlobal(pointerTarget, 'mouseleave', mouseLeave, { passive: true });

  const sensorDown = (event) => {
    sensor.setPointerCapture?.(event.pointerId);
    const pos = pointerToLocal(event.clientX, event.clientY);
    if (!pos.inside) {
      beginRetreat();
      return;
    }
    engagePointer(pos);
  };

  const sensorMove = (event) => {
    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    for (const ev of events) {
      const pos = pointerToLocal(ev.clientX, ev.clientY);
      engagePointer(pos);
    }
    if (event.pointerType !== 'mouse') event.preventDefault();
  };

  const sensorUp = (event) => {
    if (event.pointerType !== 'mouse') {
      beginRetreat();
    }
    sensor.releasePointerCapture?.(event.pointerId);
  };

  const sensorLeave = () => beginRetreat();
  const sensorEnter = (event) => {
    const pos = pointerToLocal(event.clientX, event.clientY);
    if (!pos.inside) return;
    engagePointer(pos);
  };

  sensor.addEventListener('pointerenter', sensorEnter, { passive: true });
  sensor.addEventListener('pointerdown', sensorDown, { passive: true });
  sensor.addEventListener('pointermove', sensorMove, { passive: false });
  sensor.addEventListener('pointerup', sensorUp, { passive: false });
  sensor.addEventListener('pointercancel', sensorLeave, { passive: false });
  sensor.addEventListener('pointerleave', sensorLeave, { passive: false });

  const onBlur = () => beginRetreat();
  const onVisibility = () => {
    if (document.hidden) beginRetreat();
  };

  addGlobal(window, 'blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  resize();
  step();

  return () => {
    globalHandlers.forEach((off) => off());
    sensor.removeEventListener('pointerdown', sensorDown);
    sensor.removeEventListener('pointermove', sensorMove);
    sensor.removeEventListener('pointerup', sensorUp);
    sensor.removeEventListener('pointercancel', sensorLeave);
    sensor.removeEventListener('pointerleave', sensorLeave);
    sensor.removeEventListener('pointerenter', sensorEnter);
    document.removeEventListener('visibilitychange', onVisibility);
    ro.disconnect();
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  };

}
