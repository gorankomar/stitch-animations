import { byData } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { resolveRevealTimings, ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import './styles.css';
import { createValueCounter } from '../../lib/effects/value-counter.js';

const DEFAULT_VISIBILITY = 0.5;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const section = root?.querySelector?.(byData(ATTR.anim, DATA_ATTRS.chart));
  if (!section) return () => {};

  const threshold = resolveVisibilityThreshold(section, DEFAULT_VISIBILITY);
  return whenVisible(section, () => setupChartSection(section, threshold), { threshold });
}

function setupChartSection(section, sectionThreshold) {
  const wrap = section.querySelector('.scale-graph_svg-block');
  const svg = wrap?.querySelector('svg');
  if (!wrap || !svg) return () => {};

  const timings = resolveRevealTimings();
  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  // ===== Config =====
  const LAG = 0.07;
  const DAYS = 21;
  const MIN_VAL = 60000;
  const MAX_VAL = 270000;
  const INTRO_VALUE = 170000;
  const INTRO_DURATION = 1000;
  const observeRatio = resolveVisibilityThreshold(wrap, sectionThreshold ?? DEFAULT_VISIBILITY);

  // Tooltip tuning (PIXELS)
  const IDLE_EPSILON_PX = 0.6;
  const IDLE_FRAMES = 10;
  const EDGE_PAD = 52;
  const FLIP_ZONE = 70;
  const GAP_PX = 25;
  const ENTER_PX = 10;
  const DAILY_MIN = 4000;
  const DAILY_MAX = 27000;

  // Input gating
  const MOVE_THRESHOLD_PX = 18;
  const X_PAD = 16;

  // ===== Elements =====
  const guidePath = svg.querySelector('#scale-graph_path');
  const dotGroup = svg.querySelector('#scale-graph_dot');
  const dashed = svg.querySelector('#scale-graph_dashed-line');
  const numEl = section.querySelector('.scale-graph_number');
  const pastEl = section.querySelector('[data-date="past"]');
  const todayEl = section.querySelector('[data-date="today"]');

  // Tooltip
  const tipEl = section.querySelector('.scale-graph_tooltip');
  const tipDateEl = section.querySelector('.scale-graph_tooltip-date');
  const tipCountEl = section.querySelector('.scale-graph_tooltip-count');
  const hasTooltip = Boolean(tipEl && tipDateEl && tipCountEl);

  if (!guidePath || !dotGroup || !dashed || !numEl || !pastEl || !todayEl) {
    return () => {};
  }

  // ===== Dates & formatting =====
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - DAYS);
  const fmtShort = (d) => d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  const fmtLong = (d) =>
    d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  const fmtNumber = (n) => n.toLocaleString('en-US');

  pastEl.textContent = fmtShort(startDate);
  todayEl.textContent = fmtShort(today);

  // ===== Helpers =====
  function clientToSVG(xClient, yClient) {
    const pt = svg.createSVGPoint();
    pt.x = xClient;
    pt.y = yClient;
    const ctm = svg.getScreenCTM();
    return ctm ? pt.matrixTransform(ctm.inverse()) : { x: xClient, y: yClient };
  }
  function pointAtSVGX(path, xTarget) {
    let lo = 0,
      hi = path.getTotalLength();
    for (let i = 0; i < 25; i++) {
      const mid = (lo + hi) / 2;
      const p = path.getPointAtLength(mid);
      if (p.x < xTarget) lo = mid;
      else hi = mid;
    }
    const len = (lo + hi) / 2;
    const p = path.getPointAtLength(len);
    return { p, len };
  }
  function xr() {
    const bb = guidePath.getBBox();
    return {
      xMin: bb.x + X_PAD,
      xMax: bb.x + bb.width - X_PAD,
      yMin: bb.y,
      yMax: bb.y + bb.height
    };
  }
  function valueFromX(x) {
    const { xMin, xMax } = xr();
    const t = Math.max(0, Math.min(1, (x - xMin) / (xMax - xMin)));
    return Math.round(MIN_VAL + t * (MAX_VAL - MIN_VAL));
  }
  function dateFromX(x) {
    const { xMin, xMax } = xr();
    const t = Math.max(0, Math.min(1, (x - xMin) / (xMax - xMin)));
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.round(t * DAYS));
    return d;
  }
  function dailyFromY(y) {
    const { yMin, yMax } = xr();
    const t = (y - yMin) / (yMax - yMin);
    const inv = 1 - Math.max(0, Math.min(1, t));
    return Math.max(DAILY_MIN, Math.round(DAILY_MIN + inv * (DAILY_MAX - DAILY_MIN)));
  }
  function svgPointToWrapXY(x, y) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const screen = pt.matrixTransform(svg.getScreenCTM());
    const rect = wrap.getBoundingClientRect();
    return { left: screen.x - rect.left, top: screen.y - rect.top, wrapRect: rect };
  }
  function xAtValue(val) {
    const { xMin, xMax } = xr();
    const t = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
    return xMin + Math.max(0, Math.min(1, t)) * (xMax - xMin);
  }

  // Dot base
  const dotBB = dotGroup.getBBox();
  const dotBaseX = dotBB.x + dotBB.width / 2;
  const dotBaseY = dotBB.y + dotBB.height / 2;

  let targetX = xAtValue(MIN_VAL);
  let currentX = targetX;

  const numCounter = createValueCounter({
    element: numEl,
    initialValue: MIN_VAL
  });

  let introPlayed = false,
    introDriving = false;

  // Tooltip state
  let idleFrames = 0;
  let tipVisible = false;

  // Hide before first render
  dotGroup.style.visibility = 'hidden';
  dashed.style.visibility = 'hidden';
  if (hasTooltip) {
    tipEl.setAttribute('aria-hidden', 'true');
    tipEl.style.setProperty('--x-shift', '0px');
    tipEl.style.setProperty('--y-shift', '-10px');
  }

  // Entrance offset per side (directions)
  function setStartOffsetForSide(side) {
    if (!hasTooltip) return;
    if (side === 'center') {
      tipEl.style.setProperty('--x-shift', '0px');
      tipEl.style.setProperty('--y-shift', `-${ENTER_PX}px`);
    } else if (side === 'left') {
      tipEl.style.setProperty('--x-shift', `${ENTER_PX}px`);
      tipEl.style.setProperty('--y-shift', '0px');
    } else {
      tipEl.style.setProperty('--x-shift', `-${ENTER_PX}px`);
      tipEl.style.setProperty('--y-shift', '0px');
    }
  }

  let rafId = null;
  function tick() {
    currentX += (targetX - currentX) * LAG;
    const { p } = pointAtSVGX(guidePath, currentX);

    const dx = p.x - dotBaseX;
    const dy = p.y - dotBaseY;
    dotGroup.setAttribute('transform', `translate(${dx},${dy})`);

    const vb = svg.viewBox.baseVal;
    const bottomY = vb.y + vb.height;
    dashed.setAttribute('d', `M ${p.x} ${p.y} V ${bottomY}`);

    const targetV = valueFromX(targetX);
    numCounter.setTarget(targetV);

    const dynDate = dateFromX(currentX);
    todayEl.setAttribute('data-dynamic-date', fmtLong(dynDate));

    if (dotGroup.style.visibility !== 'visible') {
      dotGroup.style.visibility = 'visible';
      dashed.style.visibility = 'visible';
    }

    const isIdle = Math.abs(targetX - currentX) < IDLE_EPSILON_PX;
    idleFrames = isIdle ? Math.min(IDLE_FRAMES, idleFrames + 1) : 0;

    if (hasTooltip) {
      if (idleFrames >= IDLE_FRAMES) {
        const { left: dotL, top: dotT, wrapRect } = svgPointToWrapXY(p.x, p.y);
        const wrapW = wrapRect.width;

        const wasHidden = tipEl.getAttribute('aria-hidden') === 'true';
        if (wasHidden) {
          tipEl.style.visibility = 'hidden';
          tipEl.setAttribute('aria-hidden', 'false');
        }
        const tipRect = tipEl.getBoundingClientRect();
        if (wasHidden) {
          tipEl.setAttribute('aria-hidden', 'true');
          tipEl.style.visibility = '';
        }
        const tipW = tipRect.width;

        let side = 'center';
        if (dotL <= FLIP_ZONE) side = 'left';
        else if (dotL >= wrapW - FLIP_ZONE) side = 'right';
        else {
          const overflowRight = dotL + tipW / 2 + EDGE_PAD > wrapW;
          const overflowLeft = dotL - tipW / 2 - EDGE_PAD < 0;
          if (overflowRight && !overflowLeft) side = 'right';
          else if (overflowLeft && !overflowRight) side = 'left';
        }
        tipEl.dataset.side = side;

        if (side === 'center') {
          tipEl.style.left = `${dotL}px`;
          tipEl.style.top = `${dotT - GAP_PX}px`;
          const tipLeftAbs = dotL - tipW / 2;
          const anchorPct = ((dotL - tipLeftAbs) / tipW) * 100;
          tipEl.style.setProperty('--anchor-x', `${Math.max(8, Math.min(92, anchorPct))}%`);
        } else if (side === 'left') {
          tipEl.style.left = `${dotL + GAP_PX}px`;
          tipEl.style.top = `${dotT}px`;
        } else {
          tipEl.style.left = `${dotL - GAP_PX}px`;
          tipEl.style.top = `${dotT}px`;
        }

        if (!tipVisible) {
          const tipDate = dateFromX(targetX);
          tipDateEl.textContent = fmtLong(tipDate);
          tipCountEl.textContent = fmtNumber(dailyFromY(p.y));

          const prevTransition = tipEl.style.transition;
          tipEl.style.transition = 'none';
          setStartOffsetForSide(side);
          void tipEl.offsetWidth;
          tipEl.style.transition = prevTransition || '';

          tipEl.style.setProperty('--x-shift', '0px');
          tipEl.style.setProperty('--y-shift', '0px');
          tipEl.setAttribute('aria-hidden', 'false');
          tipVisible = true;
        }
      } else if (tipVisible) {
        tipEl.setAttribute('aria-hidden', 'true');
        tipVisible = false;
      }
    }

    rafId = window.requestAnimationFrame(tick);
  }

  rafId = window.requestAnimationFrame(tick);

  let lastInputClientX = null;

  function shouldAcceptMove(clientX) {
    if (lastInputClientX === null) {
      lastInputClientX = clientX;
      return false;
    }
    const dx = Math.abs(clientX - lastInputClientX);
    if (dx >= MOVE_THRESHOLD_PX) {
      lastInputClientX = clientX;
      return true;
    }
    return false;
  }

  function setTargetFromEvent(e) {
    if (introDriving) return;
    const t = (e.touches && e.touches[0]) || e;
    const clientX = t.clientX;
    if (!shouldAcceptMove(clientX)) return;

    const svgPt = clientToSVG(clientX, t.clientY);
    const { xMin, xMax } = xr();
    targetX = Math.max(xMin, Math.min(xMax, svgPt.x));
  }

  function primeBaseline(e) {
    const t = (e.touches && e.touches[0]) || e;
    lastInputClientX = t.clientX;
  }

  wrap.addEventListener('pointerenter', primeBaseline);
  wrap.addEventListener('pointerdown', primeBaseline);
  wrap.addEventListener('touchstart', primeBaseline, { passive: true });

  wrap.addEventListener('pointermove', setTargetFromEvent);
  wrap.addEventListener('touchmove', setTargetFromEvent, { passive: true });

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function runIntro() {
    if (introPlayed) return;
    introPlayed = true;

    const startX = xAtValue(MIN_VAL);
    const endX = xAtValue(INTRO_VALUE);

    currentX = startX;
    targetX = startX;

    const t0 = performance.now();
    introDriving = true;

    function step(now) {
      const t = Math.min(1, (now - t0) / INTRO_DURATION);
      const k = easeOutCubic(t);
      targetX = startX + (endX - startX) * k;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        introDriving = false;
        targetX = endX;
      }
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= observeRatio) runIntro();
      });
    },
    { threshold: [observeRatio] }
  );
  io.observe(wrap);

  return () => {
    wrap.removeEventListener('pointerenter', primeBaseline);
    wrap.removeEventListener('pointerdown', primeBaseline);
    wrap.removeEventListener('touchstart', primeBaseline);
    wrap.removeEventListener('pointermove', setTargetFromEvent);
    wrap.removeEventListener('touchmove', setTargetFromEvent);
    io.disconnect();
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    numCounter.dispose();
    revealController.cancel();
  };
}

function resolveVisibilityThreshold(el, fallback) {
  if (!el) return fallback;
  const parsed = Number.parseFloat(el.dataset?.visibilityThreshold ?? '');
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed <= 0) return 0;
  if (parsed >= 1) return 1;
  return parsed;
}
