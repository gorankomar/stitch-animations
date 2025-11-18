import { byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible, resolveVisibilityThreshold } from '../../lib/effects/threshold.js';
import './styles.css';

const BASE_SIZE = 768;
const DEFAULT_VISIBILITY = 0.35;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const section = root?.querySelector?.(byData(ATTR.anim, DATA_ATTRS.radial));
  if (!section) return () => {};

  const threshold = resolveVisibilityThreshold(section, DEFAULT_VISIBILITY);
  return whenVisible(section, () => setupRadialSection(section, threshold), { threshold });
}

function setupRadialSection(section, sectionThreshold) {
  const canvas = section.querySelector('#radial_canvas');
  const wrap = section.querySelector('.radial_wrap');
  if (!canvas || !wrap) return () => {};

  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const computed = getComputedStyle(section);
  const themeColor = computed.getPropertyValue('--radial-border')?.trim() || '#ffffff';
  const markerColor = computed.getPropertyValue('--radial-marker')?.trim() || themeColor;
  const config = buildConfig(themeColor, markerColor);

  const renderer = createRadialRenderer(canvas, config);
  if (!renderer) {
    revealController.cancel();
    return () => {};
  }

  let angle = 0;
  const applyAngle = (next) => {
    angle = next;
    renderer.render(angle);
  };

  renderer.render(angle);

  // Interaction + kinetics
  const STEP_MICRO = 1 / config.micro1.density;
  const STEP_MAJOR = 360 / config.major.count;

  const DRAG_SENSITIVITY = 0.3;
  const DRAG_DIRECTION = -1;
  const SNAP_DURING_DRAG_TO_MICRO = false;

  const INERTIA_ENABLED = true;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const INERTIA_GAIN = isCoarse ? 0.9 : 0.55;
  const FRICTION_PER_MS = isCoarse ? 0.998 : 0.996;
  const MAX_VELOCITY = 0.8;
  const VELOCITY_MIN = 0.003;
  const RELEASE_MIN_MS = 400;
  const RELEASE_MAX_MS = 3200;
  const RELEASE_SLOWNESS = 2.3;
  const SMALL_DRAG_PX = 6;
  const DIRECTIONAL_FINAL = true;

  const INTRO_DEG = 48;
  const INTRO_MS = 2500;
  const INTRO_EASE = easeOutQuint;
  const RELEASE_EASE = easeOutExpo;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startAngle = 0;
  let lastTS = 0;
  let lastAng = 0;
  let velocity = 0;
  let accumDX = 0;
  let lockedDir = null;
  let raf = null;

  function down(event) {
    dragging = true;
    const touch = event.touches?.[0] ?? event;
    startX = touch.clientX;
    startY = touch.clientY;
    accumDX = 0;
    lockedDir = null;
    startAngle = angle;
    lastTS = performance.now();
    lastAng = angle;
    velocity = 0;
    cancelAnimationFrame(raf ?? undefined);
    canvas.setPointerCapture?.(event.pointerId ?? 1);
    wrap.classList.add('is-dragging');
    event.preventDefault?.();
  }

  function move(event) {
    if (!dragging) return;
    const touch = event.touches?.[0] ?? event;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!lockedDir) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) lockedDir = 'x';
      else if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        dragging = false;
        wrap.classList.remove('is-dragging');
        return;
      } else {
        return;
      }
    }

    if (lockedDir !== 'x') return;

    accumDX = dx;
    const raw = startAngle + dx * DRAG_SENSITIVITY * DRAG_DIRECTION;
    const liveAngle = SNAP_DURING_DRAG_TO_MICRO ? quantize(raw, STEP_MICRO) : raw;

    const now = performance.now();
    const dt = now - lastTS || 16;
    velocity = (liveAngle - lastAng) / dt;
    velocity = clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY);
    lastTS = now;
    lastAng = liveAngle;

    applyAngle(liveAngle);
  }

  function up(event) {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
    canvas.releasePointerCapture?.(event.pointerId ?? 1);

    if (!INERTIA_ENABLED || Math.abs(accumDX) < SMALL_DRAG_PX || Math.abs(velocity) < VELOCITY_MIN) {
      tweenTo(quantize(angle, STEP_MAJOR), RELEASE_MIN_MS, easeOutQuad);
      return;
    }

    const v0 = clamp(velocity * INERTIA_GAIN, -MAX_VELOCITY, MAX_VELOCITY);
    const dir = Math.sign(v0) || 1;
    const k = -Math.log(FRICTION_PER_MS);
    const extra = v0 / (k || 1e-6);
    const predictiveStop = angle + extra;

    let target = quantize(predictiveStop, STEP_MAJOR);
    if (DIRECTIONAL_FINAL) {
      if (dir > 0) {
        target = Math.max(ceilTo(angle, STEP_MAJOR), Math.floor(predictiveStop / STEP_MAJOR) * STEP_MAJOR);
      } else {
        target = Math.min(floorTo(angle, STEP_MAJOR), Math.ceil(predictiveStop / STEP_MAJOR) * STEP_MAJOR);
      }
    }

    const delta = Math.abs(target - angle);
    let duration;
    if (delta < 1e-3 || Math.abs(v0) < 1e-6) duration = RELEASE_MIN_MS;
    else {
      const x = Math.min(0.98, (k * delta) / Math.abs(v0));
      duration = -Math.log(1 - x) / (k || 1e-6);
      duration = clamp(duration, RELEASE_MIN_MS, RELEASE_MAX_MS);
    }
    duration = Math.min(RELEASE_MAX_MS, duration * RELEASE_SLOWNESS);

    tweenTo(target, duration, RELEASE_EASE);
  }

  function tweenTo(target, ms, easing = easeOutQuad) {
    const start = angle;
    const t0 = performance.now();
    if (ms <= 0) {
      applyAngle(target);
      return;
    }
    cancelAnimationFrame(raf ?? undefined);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      applyAngle(start + (target - start) * easing(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else raf = null;
    };
    raf = requestAnimationFrame(step);
  }

  function playIntro(force = false) {
    if (playIntro.played && !force) return;
    playIntro.played = true;
    const start = angle;
    const end = quantize(start + INTRO_DEG, STEP_MAJOR);
    tweenTo(end, INTRO_MS, INTRO_EASE);
  }
  playIntro.played = false;

  const observerThreshold = resolveVisibilityThreshold(wrap, sectionThreshold ?? DEFAULT_VISIBILITY);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= observerThreshold) {
          playIntro();
        }
      });
    },
    { threshold: [observerThreshold] }
  );
  observer.observe(wrap);

  const preventDrag = (event) => event.preventDefault();
  canvas.addEventListener('pointerdown', down, { passive: false });
  canvas.addEventListener('pointermove', move, { passive: false });
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('touchstart', down, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', up, { passive: false });
  canvas.addEventListener('dragstart', preventDrag);

  const handleResize = () => {
    renderer.resize();
    renderer.render(angle);
  };
  window.addEventListener('resize', handleResize);
  const resizeObserver = new ResizeObserver(() => handleResize());
  resizeObserver.observe(canvas);

  return () => {
    observer.disconnect();
    wrap.classList.remove('is-dragging');
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
    canvas.removeEventListener('touchstart', down);
    canvas.removeEventListener('touchmove', move);
    canvas.removeEventListener('touchend', up);
    canvas.removeEventListener('dragstart', preventDrag);
    window.removeEventListener('resize', handleResize);
    resizeObserver.disconnect();
    if (raf) cancelAnimationFrame(raf);
    revealController.cancel();
  };
}

function createRadialRenderer(canvas, config) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    scale: 1,
    cx: 0,
    cy: 0,
    baseLayer: null,
    rotorLayer: null
  };

  const rebuildLayers = () => {
    const layoutWidth = canvas.offsetWidth;
    const layoutHeight = canvas.offsetHeight;
    const rect = canvas.getBoundingClientRect();
    const fallbackWidth = canvas.parentElement?.clientWidth || BASE_SIZE;
    const fallbackHeight = canvas.parentElement?.clientHeight || fallbackWidth || BASE_SIZE;
    const width = Math.max(1, layoutWidth || rect.width || fallbackWidth || BASE_SIZE);
    const height = Math.max(1, layoutHeight || rect.height || fallbackHeight || BASE_SIZE);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    state.width = width;
    state.height = height;
    state.dpr = dpr;
    state.scale = Math.min(width, height) / BASE_SIZE;
    state.cx = width / 2;
    state.cy = height / 2;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const baseLayer = createLayer(width, height, dpr);
    drawBase(baseLayer.ctx, config, state);

    const rotorLayer = createLayer(width, height, dpr);
    drawRotor(rotorLayer.ctx, config, state);

    state.baseLayer = baseLayer.canvas;
    state.rotorLayer = rotorLayer.canvas;
  };

  const render = (deg) => {
    ctx.clearRect(0, 0, state.width, state.height);
    if (state.baseLayer) {
      ctx.drawImage(state.baseLayer, 0, 0, state.width, state.height);
    }
    if (state.rotorLayer) {
      ctx.save();
      ctx.translate(state.cx, state.cy);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(state.rotorLayer, -state.cx, -state.cy, state.width, state.height);
      ctx.restore();
    }
  };

  const resize = () => {
    rebuildLayers();
  };

  resize();

  return { render, resize };
}

function createLayer(width, height, dpr) {
  const layer = document.createElement('canvas');
  layer.width = Math.max(1, Math.round(width * dpr));
  layer.height = Math.max(1, Math.round(height * dpr));
  const ctx = layer.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas: layer, ctx };
}

function buildConfig(color, markerColor) {
  return {
    theme: { color, markerColor, baseThickness: .5, solidMultiplier: 4 },
    tiny: { radius: 290, length: 2, density: 1.4, opacity: 0.7 },
    solid: { radius: 300, opacity: 0.25 },
    micro1: { radius: 330, length: 6, density: 1.4, opacity: 0.6 },
    micro2: { radius: 360, length: 16, density: 0.7, opacity: 0.5 },
    major: { radius: 368, length: 61, count: 36, opacity: 1 },
    marker: { enabled: true, atDeg: 180, radius: 287, base: 3, height: 5, radialOffset: 0 }
  };
}

function drawBase(ctx, config, state) {
  const { theme, tiny, solid, marker } = config;
  drawRingByDensity(ctx, tiny, theme, state);
  if (marker?.enabled) {
    drawMarker(ctx, marker, theme, state);
  }
  drawCircle(
    ctx,
    solid.radius * state.scale,
    theme.baseThickness * theme.solidMultiplier,
    solid.opacity,
    solid.color ?? theme.color,
    state
  );
}

function drawRotor(ctx, config, state) {
  const { theme, micro1, micro2, major } = config;
  drawRingByDensity(ctx, micro1, theme, state);
  drawRingByDensity(ctx, micro2, theme, state);
  drawRingByCount(ctx, major, theme, state);
}

function drawRingByDensity(ctx, ring, theme, state) {
  const total = Math.max(1, Math.round(360 * ring.density));
  const thickness = resolveThickness(theme.baseThickness, state.scale);
  const radius = ring.radius * state.scale;
  const length = ring.length * state.scale;
  const color = ring.color ?? theme.color;
  for (let i = 0; i < total; i++) {
    const deg = (i / total) * 360;
    drawPolarLine(ctx, radius, length, deg, thickness, ring.opacity, color, state);
  }
}

function drawRingByCount(ctx, ring, theme, state) {
  const step = 360 / ring.count;
  const thickness = resolveThickness(theme.baseThickness, state.scale);
  const radius = ring.radius * state.scale;
  const length = ring.length * state.scale;
  const color = ring.color ?? theme.color;
  for (let i = 0; i < ring.count; i++) {
    drawPolarLine(ctx, radius, length, i * step, thickness, ring.opacity, color, state);
  }
}

function drawPolarLine(ctx, radius, length, deg, thickness, opacity, color, state) {
  const a = ((deg - 90) * Math.PI) / 180;
  const r1 = radius - length;
  const r2 = radius;
  const x1 = state.cx + r1 * Math.cos(a);
  const y1 = state.cy + r1 * Math.sin(a);
  const x2 = state.cx + r2 * Math.cos(a);
  const y2 = state.cy + r2 * Math.sin(a);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.globalAlpha = opacity ?? 1;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function drawCircle(ctx, radius, thickness, opacity, color, state) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(state.cx, state.cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = resolveThickness(thickness, state.scale);
  ctx.globalAlpha = opacity ?? 1;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function drawMarker(ctx, marker, theme, state) {
  const { atDeg, radius, base, height, radialOffset = 0 } = marker;
  const color = marker.color ?? theme.markerColor ?? theme.color;
  const opacity = marker.opacity ?? 1;
  const a = ((atDeg - 90) * Math.PI) / 180;
  const rad = (radius + radialOffset) * state.scale;
  const cx = state.cx + rad * Math.cos(a);
  const cy = state.cy + rad * Math.sin(a);
  const tx = -Math.sin(a);
  const ty = Math.cos(a);
  const rx = Math.cos(a);
  const ry = Math.sin(a);
  const half = (base * state.scale) / 2;
  const px1 = cx + tx * -half;
  const py1 = cy + ty * -half;
  const px2 = cx + tx * half;
  const py2 = cy + ty * half;
  const px3 = cx + rx * (height * state.scale);
  const py3 = cy + ry * (height * state.scale);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.lineTo(px3, py3);
  ctx.closePath();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function resolveThickness(base, scale) {
  return Math.max(0.5, (base ?? 1) * scale);
}


const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const quantize = (value, step) => Math.round(value / step) * step;
const ceilTo = (value, step) => Math.ceil(value / step) * step;
const floorTo = (value, step) => Math.floor(value / step) * step;

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}
function easeOutExpo(t) {
  return 1 - Math.pow(2, -10 * t);
}
