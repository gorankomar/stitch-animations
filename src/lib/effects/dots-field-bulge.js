import { readMotionEasingCurve } from '../motion.js';

const DEFAULT_OPTIONS = {
  bgColor: 'transparent',
  dotColor: 'rgba(196,200,208,.92)',
  baseSize: 1.2,
  sizeBoost: -0.2,
  gap: 20,
  radius: 210,
  offsetMax: 34,
  spring: 0.07,
  damping: 0.52,
  click: {
    speed: 900,
    wavelength: 340,
    timeDecay: 3.4,
    distFalloff: 0.0012,
    amp: 0.12,
    sizeScale: 12,
    offsetScale: 60,
    centerDipRadius: 7,
    centerDipAmp: 1.2
  },
  retreatMs: 350
};

export function createDotsFieldBulge({
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
  const motionEase = readMotionEasingCurve();
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

    const pad = OPT.radius + OPT.offsetMax + OPT.gap;
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
      let r = OPT.baseSize;

      const influence = pointerInfluence(point.x, point.y);
      if (influence) {
        const { influence: infl, nx, ny } = influence;
        const push = infl * OPT.offsetMax;
        px = point.x + nx * push;
        py = point.y + ny * push;
        r = OPT.baseSize + OPT.sizeBoost * infl;
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
          px += nx * (-rippleValue * OPT.click.offsetScale);
          py += ny * (-rippleValue * OPT.click.offsetScale);
        }
        r += rippleValue * OPT.click.sizeScale;
      }

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.1, r), 0, Math.PI * 2);
      ctx.fill();
    }

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
