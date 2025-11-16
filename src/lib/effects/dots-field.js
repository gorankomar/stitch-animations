import { clamp } from '../math.js';

const DEFAULT_OPTIONS = {
  bgColor: 'transparent',
  dotColor: 'rgba(196,200,208,.92)',
  baseSize: 1.2,
  scaleBoost: 1,
  baseAlpha: 1,
  minAlpha: 0.12,
  gap: 20,
  radius: 520,
  spring: 0.05,
  damping: 0.5,
  click: {
    speed: 900,
    wavelength: 340,
    timeDecay: 3.4,
    distFalloff: 0.0012,
    amp: 0.12,
    sizeScale: 12,
    alphaScale: 0.45,
    offsetScale: 50,
    centerDipRadius: 7,
    centerDipAmp: 1.2
  },
  retreatMs: 350
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

  const OPT = { ...DEFAULT_OPTIONS, ...options, click: { ...DEFAULT_OPTIONS.click, ...options.click } };
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const motionEase = resolveMotionEase();
  const falloffEase = (t) => 1 - (1 - t) * (1 - t);

  let width = 0;
  let height = 0;
  let points = [];

  const OFF = { x: -9999, y: -9999 };
  const target = { x: OFF.x, y: OFF.y };
  const pointer = { x: OFF.x, y: OFF.y, vx: 0, vy: 0 };

  let retreating = false;
  let retreatStart = 0;
  let retreatFromX = 0;
  let retreatFromY = 0;

  const ripples = [];
  const nowSec = () => performance.now() / 1000;
  const nowMs = () => performance.now();

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const pad = OPT.radius + OPT.gap;
    const startX = -pad;
    const startY = -pad;
    const endX = width + pad;
    const endY = height + pad;
    const cols = Math.ceil((endX - startX) / OPT.gap) + 1;
    const rows = Math.ceil((endY - startY) / OPT.gap) + 1;

    points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({ x: startX + c * OPT.gap, y: startY + r * OPT.gap });
      }
    }
  }

  function pointerInfluence(px, py) {
    const dx = px - pointer.x;
    const dy = py - pointer.y;
    const R = OPT.radius;
    const d2 = dx * dx + dy * dy;
    if (d2 >= R * R) return null;
    const d = Math.sqrt(d2) || 0.0001;
    const t = 1 - d / R;
    const influence = falloffEase(t);
    return { influence, nx: dx / d, ny: dy / d };
  }

  function rippleValueAt(px, py, tNow) {
    if (!ripples.length) return 0;
    const c = OPT.click;
    const k = (2 * Math.PI) / c.wavelength;
    let sum = 0;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      const dt = tNow - ripple.t0;
      if (dt < 0) continue;
      if (dt > 1.7) {
        ripples.splice(i, 1);
        continue;
      }

      const dx = px - ripple.x;
      const dy = py - ripple.y;
      const dist = Math.hypot(dx, dy);
      const phase = k * (dist - c.speed * dt);
      const timeEnv = Math.exp(-c.timeDecay * dt);
      const distEnv = Math.exp(-c.distFalloff * dist);
      sum += c.amp * Math.sin(phase) * timeEnv * distEnv;

      const tC = Math.min(1, dist / c.centerDipRadius);
      const smooth = tC * tC * (3 - 2 * tC);
      sum -= (1 - smooth) * c.centerDipAmp * timeEnv;
    }
    return sum;
  }

  function beginRetreat() {
    retreating = true;
    retreatStart = nowMs();
    retreatFromX = target.x;
    retreatFromY = target.y;
  }

  const localRectTarget = sensor;
  const pointerToLocal = (clientX, clientY) => {
    const rect = localRectTarget.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  let rafId = null;
  function step() {
    if (retreating) {
      const t = Math.min(1, (nowMs() - retreatStart) / OPT.retreatMs);
      const eased = motionEase(t);
      target.x = retreatFromX + (OFF.x - retreatFromX) * eased;
      target.y = retreatFromY + (OFF.y - retreatFromY) * eased;
      if (t >= 1) retreating = false;
    }

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
    const tNow = nowSec();

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let px = point.x;
      let py = point.y;
      let scale = 1;
      let alpha = OPT.baseAlpha;

      const influence = pointerInfluence(point.x, point.y);
      if (influence) {
        const infl = influence.influence;
        scale += infl * OPT.scaleBoost;
        alpha = OPT.baseAlpha - infl * (OPT.baseAlpha - OPT.minAlpha);
      }

      const rippleValue = rippleValueAt(point.x, point.y, tNow);
      if (rippleValue !== 0) {
        let nearest = null;
        let nearestD2 = Infinity;
        for (let j = 0; j < ripples.length; j++) {
          const dx = point.x - ripples[j].x;
          const dy = point.y - ripples[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < nearestD2) {
            nearestD2 = d2;
            nearest = ripples[j];
          }
        }
        if (nearest) {
          const dx = point.x - nearest.x;
          const dy = point.y - nearest.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const nx = dx / dist;
          const ny = dy / dist;
          const push = rippleValue * OPT.click.offsetScale * -1;
          px += nx * push;
          py += ny * push;
        }
        scale += rippleValue * OPT.click.sizeScale;
        alpha -= rippleValue * OPT.click.alphaScale;
      }

      const finalAlpha = clamp(alpha, OPT.minAlpha, OPT.baseAlpha);
      const radius = Math.max(0.12, OPT.baseSize * scale);

      ctx.globalAlpha = finalAlpha;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
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
    target.x = pos.x;
    target.y = pos.y;
  };
  const mouseDown = (event) => {
    const pos = pointerToLocal(event.clientX, event.clientY);
    ripples.push({ x: pos.x, y: pos.y, t0: nowSec() });
  };
  const mouseLeave = () => beginRetreat();

  addGlobal(pointerTarget, 'mousemove', mouseMove, { passive: true });
  addGlobal(pointerTarget, 'mousedown', mouseDown, { passive: true });
  addGlobal(pointerTarget, 'mouseleave', mouseLeave, { passive: true });

  const sensorDown = (event) => {
    retreating = false;
    sensor.setPointerCapture?.(event.pointerId);
    const pos = pointerToLocal(event.clientX, event.clientY);
    target.x = pos.x;
    target.y = pos.y;
  };

  const sensorMove = (event) => {
    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    for (const ev of events) {
      const pos = pointerToLocal(ev.clientX, ev.clientY);
      target.x = pos.x;
      target.y = pos.y;
    }
    if (event.pointerType !== 'mouse') event.preventDefault();
  };

  const sensorUp = (event) => {
    const pos = pointerToLocal(event.clientX, event.clientY);
    ripples.push({ x: pos.x, y: pos.y, t0: nowSec() });
    beginRetreat();
    sensor.releasePointerCapture?.(event.pointerId);
  };

  const sensorLeave = () => beginRetreat();

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
    document.removeEventListener('visibilitychange', onVisibility);
    ro.disconnect();
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  };
}

function resolveMotionEase() {
  const fallback = (t) => 1 - Math.pow(1 - t, 3);
  if (typeof window === 'undefined') return fallback;
  try {
    const computed = getComputedStyle(document.documentElement);
    const raw = computed.getPropertyValue('--motion-ease-primary')?.trim();
    if (!raw) return fallback;
    const match = raw.match(/cubic-bezier\(([^)]+)\)/i);
    if (!match) return fallback;
    const parts = match[1]
      .split(',')
      .map((part) => Number.parseFloat(part.trim()))
      .filter((num) => Number.isFinite(num));
    if (parts.length !== 4) return fallback;
    const easing = cubicBezier(parts[0], parts[1], parts[2], parts[3]);
    return typeof easing === 'function' ? easing : fallback;
  } catch {
    return fallback;
  }
}

function cubicBezier(p1x, p1y, p2x, p2y) {
  if (
    !Number.isFinite(p1x) ||
    !Number.isFinite(p1y) ||
    !Number.isFinite(p2x) ||
    !Number.isFinite(p2y)
  ) {
    return null;
  }

  // From https://github.com/gre/bezier-easing (MIT)
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;
  const SUBDIVISION_MAX_ITERATIONS = 10;
  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1);

  const sampleValues = new Float32Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; i++) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, p1x, p2x);
  }

  function A(a1, a2) {
    return 1.0 - 3.0 * a2 + 3.0 * a1;
  }
  function B(a1, a2) {
    return 3.0 * a2 - 6.0 * a1;
  }
  function C(a1) {
    return 3.0 * a1;
  }

  function calcBezier(t, a1, a2) {
    return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  }
  function getSlope(t, a1, a2) {
    return 3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1);
  }

  function getTForX(x) {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= x;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    const dist =
      (x - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    const initialSlope = getSlope(guessForT, p1x, p2x);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(x, guessForT);
    }
    if (initialSlope === 0) {
      return guessForT;
    }
    return binarySubdivide(x, intervalStart, intervalStart + kSampleStepSize);
  }

  function newtonRaphsonIterate(x, guessT) {
    for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
      const currentSlope = getSlope(guessT, p1x, p2x);
      if (currentSlope === 0) return guessT;
      const currentX = calcBezier(guessT, p1x, p2x) - x;
      guessT -= currentX / currentSlope;
    }
    return guessT;
  }

  function binarySubdivide(x, a, b) {
    let currentX;
    let currentT;
    let i = 0;
    do {
      currentT = a + (b - a) / 2;
      currentX = calcBezier(currentT, p1x, p2x) - x;
      if (currentX > 0) {
        b = currentT;
      } else {
        a = currentT;
      }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
  }

  return function BezierEasing(x) {
    if (p1x === p1y && p2x === p2y) return x;
    return calcBezier(getTForX(x), p1y, p2y);
  };
}
