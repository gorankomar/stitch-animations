import { byData, qsa } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible, resolveVisibilityThreshold } from '../../lib/effects/threshold.js';
import { createFollowGroup } from '../../lib/effects/follow-group.js';
import { readMotionEaseValue } from '../../lib/motion.js';
import { observeResize } from '../../lib/observer.js';
import './styles.css';

const hasWindow = typeof window !== 'undefined';
const requestFrame =
  hasWindow && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (cb) => setTimeout(cb, 16);
const cancelFrame =
  hasWindow && typeof window.cancelAnimationFrame === 'function'
    ? window.cancelAnimationFrame.bind(window)
    : (id) => clearTimeout(id);

const DEFAULT_VISIBILITY = 0.35;
const FALLBACK_EASE = 'cubic-bezier(.11, .61, .27, .99)';
const ANIM = Object.freeze({
  wrapStagger: 220,
  ringDuration: 900,
  ringStagger: 210,
  ringStartScale: 0.1,
  dotPathDuration: 1100,
  dotScaleDuration: 900,
  dotStagger: 90,
  dotRingLag: 120,
  dotPathSteps: 5
});
const RIPPLE = Object.freeze({
  duration: 2100,
  easing: 'cubic-bezier(.21, .61, .35, 1)',
  ringStrengthInner: 0.025,
  ringStrengthOuter: 0.007,
  dotStrengthMultiplier: 1,
  waveDelay: 90,
  pedestalStrengthInner: 0.18,
  pedestalStrengthOuter: 0.05,
  pedestalWaveDelayFactor: 0.8
});

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const section = root?.querySelector?.(byData(ATTR.anim, DATA_ATTRS.orbit));
  if (!section) return () => {};

  const threshold = resolveVisibilityThreshold(section, DEFAULT_VISIBILITY);
  return whenVisible(
    section,
    () => {
      const disposeOrbit = setupOrbit(section);
      return () => disposeOrbit();
    },
    { threshold }
  );
}

function setupOrbit(section) {
  const wraps = Array.from(section.querySelectorAll('.orbit_wrap'));
  if (!wraps.length) return () => {};

  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const ease = readMotionEaseValue(section, '--motion-ease-primary', FALLBACK_EASE);
  const controllers = wraps.map((wrap) => createOrbitWrapController(wrap));
  controllers.forEach((controller) => controller.observe());

  const rippleTarget = section.closest('[data-anim]') ?? section;
  const handlePointerDown = () => {
    controllers.forEach((controller) => controller.ripple?.());
  };
  rippleTarget?.addEventListener('pointerdown', handlePointerDown);

  const startAnimations = () => {
    controllers.forEach((controller, index) => {
      controller.play({ baseDelay: index * ANIM.wrapStagger, ease });
    });
  };

  const runInitialLayouts = (iterations = 0) => {
    controllers.forEach((controller) => controller.layout());
    if (iterations >= 1) {
      startAnimations();
      return;
    }
    requestFrame(() => runInitialLayouts(iterations + 1));
  };

  requestFrame(() => runInitialLayouts());

  return () => {
    controllers.forEach((controller) => controller.dispose());
    revealController.cancel();
    rippleTarget?.removeEventListener('pointerdown', handlePointerDown);
  };
}

function createOrbitWrapController(wrap) {
  const state = {
    wrap,
    layout: null,
    hasAnimated: false,
    disposeResize: null,
    animations: new Set(),
    isAnimating: false,
    followDispose: null,
    followReady: false,
    rippleTimer: null,
    rippleAnimations: new Set(),
    pendingLayout: false,
    pendingLayoutReason: null,
    layoutRaf: null,
    requestLayout: null
  };
  wrap.dataset.orbitPending = wrap.dataset.orbitPending ?? 'true';

  const runLayout = () => {
    cancelRippleAnimations(state, { trigger: false });
    if (state.followDispose) {
      state.followDispose();
      state.followDispose = null;
      state.followReady = false;
    }
    const computed = computeOrbitLayout(wrap);
    if (!computed) return null;
    state.layout = computed;
    if (!state.hasAnimated) {
      primeInitialStates(computed);
    } else {
      cancelTrackedAnimations(state, { skipFollowers: true });
      settleAnimatedStates(computed);
      state.followDispose = setupParallaxFollowers(state.wrap);
      state.followReady = true;
    }
    state.pendingLayout = false;
    return computed;
  };

  const requestLayout = ({ force = false, immediate = false } = {}) => {
    if (!force && (state.isAnimating || state.rippleAnimations.size)) {
      state.pendingLayout = true;
      state.pendingLayoutReason = 'animation';
      return;
    }
    const hadRipple = force && state.rippleAnimations.size > 0;
    const run = () => {
      state.pendingLayout = false;
      state.pendingLayoutReason = null;
      state.layoutRaf = null;
      runLayout();
    };
    const schedule = () => {
      state.pendingLayout = false;
      if (state.layoutRaf) {
        cancelFrame(state.layoutRaf);
        state.layoutRaf = null;
      }
      state.layoutRaf = requestFrame(run);
    };

    if (hadRipple) {
      state.pendingLayout = true;
      state.pendingLayoutReason = 'ripple';
      cancelRippleAnimations(state);
      return;
    }

    if (immediate) {
      if (state.layoutRaf) {
        cancelFrame(state.layoutRaf);
        state.layoutRaf = null;
      }
      run();
      return;
    }

    if (state.layoutRaf) return;
    schedule();
  };

  state.requestLayout = requestLayout;

  const observe = () => {
    const elementTrigger = () => {
      if (state.isAnimating) {
        state.pendingLayout = true;
        return;
      }
      cancelRippleAnimations(state, { trigger: false });
      requestLayout({ force: true, immediate: true });
    };
    const baseDispose = observeResize(wrap, elementTrigger);
    const windowHandler = () => {
      if (state.isAnimating) {
        state.pendingLayout = true;
        return;
      }
      cancelRippleAnimations(state, { trigger: false });
      requestLayout({ force: true, immediate: true });
    };
    window.addEventListener('resize', windowHandler);
    const disposeAll = () => {
      baseDispose?.();
      window.removeEventListener('resize', windowHandler);
    };
    state.disposeResize = disposeAll;
    return disposeAll;
  };

  const play = ({ baseDelay = 0, ease }) => {
    if (state.hasAnimated) return;
    const current = state.layout ?? runLayout();
    if (!current) return;
    state.hasAnimated = true;
    state.isAnimating = true;
    requestFrame(() => {
      delete wrap.dataset.orbitPending;
    });
    const easing = ease || FALLBACK_EASE;
    animateRings(current, {
      baseDelay,
      ease: easing,
      register: (animation, onFinish) => trackAnimation(state, animation, onFinish)
    });
    animateDots(current, {
      baseDelay: baseDelay + ANIM.ringDuration,
      ease: easing,
      register: (animation, onFinish) => trackAnimation(state, animation, onFinish)
    });
  };

  const ripple = () => {
    if (!state.hasAnimated || state.isAnimating) return;
    triggerOrbitRipple(state);
  };

  const dispose = () => {
    cancelTrackedAnimations(state);
    cancelRippleAnimations(state);
    if (state.followDispose) state.followDispose();
    if (state.disposeResize) state.disposeResize();
    if (state.rippleTimer) {
      window.clearTimeout(state.rippleTimer);
      state.rippleTimer = null;
    }
  };

  return { layout: runLayout, observe, play, ripple, dispose };
}

function animateRings(layout, { baseDelay = 0, ease, register }) {
  layout.ringInfo.forEach((info, index) => {
    const delay = baseDelay + index * ANIM.ringStagger;
    const animation = info.el.animate(
      [
        {
          transform: toRingTransform(ANIM.ringStartScale),
          opacity: 0
        },
        {
          transform: toRingTransform(1),
          opacity: 1
        }
      ],
      {
        duration: ANIM.ringDuration,
        delay,
        easing: ease,
        fill: 'forwards'
      }
    );
    register?.(animation, () => commitRingState(info));
  });
}

function animateDots(layout, { baseDelay = 0, ease, register }) {
  const map = new Map();
  layout.dotPlacements.forEach((placement) => {
    if (!map.has(placement.ringIndex)) {
      map.set(placement.ringIndex, []);
    }
    map.get(placement.ringIndex).push(placement);
  });

  map.forEach((placements, ringIndex) => {
    const ringDelay = baseDelay + ringIndex * ANIM.ringStagger - ANIM.dotRingLag;
    placements.forEach((placement, idx) => {
      const delay = Math.max(0, ringDelay) + idx * ANIM.dotStagger;
      const animation = animateSingleDot(placement, { delay, ease });
      register?.(animation, () => commitDotState(placement));
    });
  });
}

function animateSingleDot(placement, { delay = 0, ease }) {
  const pathAnimation = placement.dot.animate(buildArcPathKeyframes(placement), {
    duration: ANIM.dotPathDuration,
    delay,
    easing: ease,
    fill: 'forwards'
  });

  const scaleAnimation = placement.dot.animate(
    [
      { offset: 0, opacity: 0, transform: toDotTransform(0) },
      { offset: 0.12, opacity: 0.01, transform: toDotTransform(0) },
      { offset: 0.32, opacity: 1, transform: toDotTransform(1.12) },
      { offset: 0.52, opacity: 1, transform: toDotTransform(0.92) },
      { offset: 0.72, opacity: 1, transform: toDotTransform(1.04) },
      { offset: 1, opacity: 1, transform: toDotTransform(1) }
    ],
    {
      duration: ANIM.dotScaleDuration,
      delay,
      easing: ease,
      fill: 'forwards'
    }
  );

  scaleAnimation.finished
    .then(() => {
      scaleAnimation.commitStyles();
      scaleAnimation.cancel();
    })
    .catch(() => {});

  return pathAnimation;
}

function computeOrbitLayout(wrap) {
  const rings = Array.from(wrap.querySelectorAll('.orbit_ring'));
  const dots = Array.from(wrap.querySelectorAll('.orbit_dot'));
  if (!rings.length || !dots.length) return null;

  const ringCount = rings.length;
  wrap.style.setProperty('--ring-count', ringCount);

  const wrapRect = wrap.getBoundingClientRect();
  const safeMargin = readSafeMargin(wrap);
  const dotSample = dots[0];
  const dotRadius = dotSample ? dotSample.getBoundingClientRect().width / 2 : 0;
  let minX = dotRadius + safeMargin;
  let maxX = wrapRect.width - (dotRadius + safeMargin);
  if (minX >= maxX) {
    const mid = wrapRect.width / 2;
    minX = mid;
    maxX = mid;
  }

  const ringInfo = rings
    .map((ring, i) => {
      const rect = ring.getBoundingClientRect();
      const radius = rect.width / 2;
      const cx = rect.left - wrapRect.left + radius;
      const cy = rect.top - wrapRect.top + radius;
      return {
        el: ring,
        radius,
        cx,
        cy,
        index: i + 1
      };
    })
    .sort((a, b) => a.radius - b.radius);

  ringInfo.forEach((info) => {
    info.el.dataset.followMouse = '';
    let depth = info.index;
    if (typeof window !== 'undefined') {
      const computed = window.getComputedStyle(info.el);
      const parsed = Number.parseFloat(computed.zIndex);
      if (Number.isFinite(parsed)) depth = parsed;
    }
    info.el.dataset.followDepth = String(depth);
  });

  const ringDots = allocateDotsToRings(ringInfo, dots.length);

  const placements = [];
  let dotCursor = 0;

  for (let i = 0; i < ringCount; i++) {
    const info = ringInfo[i];
    const ringDepth = Number.parseFloat(info.el.dataset.followDepth) || info.index;
    const countOnRing = ringDots[i];
    if (!countOnRing) continue;

    const tOuter = ringCount === 1 ? 1 : i / (ringCount - 1);
    const MIN_SPAN = 120;
    const MAX_SPAN = 180;
    const MIN_SPAN_FLOOR = 20;
    let span = clamp(MIN_SPAN + (MAX_SPAN - MIN_SPAN) * tOuter, MIN_SPAN_FLOOR, MAX_SPAN);
    span *= resolveSpanFactor(countOnRing);

    const bounds = computeAngleBounds(info, minX, maxX);
    const availableSpan = Math.max(0, bounds.right - bounds.left);
    if (availableSpan === 0) {
      span = 0;
    } else {
      span = Math.min(span, availableSpan);
      const minSpanForRing = Math.min(availableSpan, MIN_SPAN_FLOOR);
      span = Math.max(span, minSpanForRing);
    }

      let startDeg = -90 - span / 2;
      let endDeg = -90 + span / 2;

    if (startDeg < bounds.left) {
      const delta = bounds.left - startDeg;
      startDeg += delta;
      endDeg += delta;
    }
    if (endDeg > bounds.right) {
      const delta = endDeg - bounds.right;
      startDeg -= delta;
      endDeg -= delta;
    }

    startDeg = clamp(startDeg, bounds.left, bounds.right);
    endDeg = clamp(endDeg, bounds.left, bounds.right);
    const spanRange = Math.max(0, endDeg - startDeg);

    for (let j = 0; j < countOnRing && dotCursor < dots.length; j++, dotCursor++) {
      const dot = dots[dotCursor];
      dot.style.position = 'absolute';
      const dotInner = ensureDotInner(dot);

      let t;
      if (countOnRing === 1) {
        t = 0.5;
      } else {
        const step = 1 / countOnRing;
        t = step / 2 + j * step;
      }

      const angleDeg = startDeg + spanRange * t;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = info.cx + info.radius * Math.cos(angleRad);
      const y = info.cy + info.radius * Math.sin(angleRad);

      const dotDepth = ringDepth + 0.35;
      dot.dataset.followMouse = '';
      dot.dataset.followDepth = String(dotDepth);
      dot.style.zIndex = String((dotDepth + 10) * 100);

      placements.push({
        dot,
        inner: dotInner,
        ringIndex: i,
        x,
        y,
        centerX: info.cx,
        centerY: info.cy,
        radius: info.radius,
        startX: info.cx,
        startY: info.cy - info.radius,
        angleDeg
      });
    }
  }

  const pedestal = computePedestalLayers(wrap);

  return { wrap, ringInfo, dotPlacements: placements, pedestal };
}

function primeInitialStates(layout) {
  layout.ringInfo.forEach(({ el }) => {
    el.style.opacity = '0';
    el.style.transform = toRingTransform(ANIM.ringStartScale);
  });
  layout.dotPlacements.forEach((placement) => {
    placement.dot.style.opacity = '0';
    placement.dot.style.left = formatPx(placement.startX);
    placement.dot.style.top = formatPx(placement.startY);
    placement.dot.style.transform = toDotTransform(0);
    if (placement.inner) placement.inner.style.transform = '';
  });
}

function settleAnimatedStates(layout) {
  layout.ringInfo.forEach(({ el }) => {
    commitRingState({ el });
  });
  layout.dotPlacements.forEach((placement) => {
    commitDotState(placement);
  });
  if (layout.pedestal?.layers?.length) {
    layout.pedestal.layers.forEach((layer) => commitPedestalState(layer));
  }
}

function commitRingState(info) {
  info.el.style.opacity = '1';
  info.el.style.transform = toRingTransform(1);
}

function commitDotState(placement) {
  placement.dot.style.opacity = '1';
  placement.dot.style.left = formatPx(placement.x);
  placement.dot.style.top = formatPx(placement.y);
  placement.dot.style.transform = toDotTransform(1);
  if (placement.inner) placement.inner.style.transform = '';
}

function commitPedestalState(layer) {
  const target = layer?.inner ?? layer?.el;
  if (!target) return;
  target.style.scale = '1';
}

function trackAnimation(state, animation, onFinish) {
  if (!animation) return;
  const entry = { animation, onFinish };
  state.animations.add(entry);
  animation.finished
    .then(() => {
      onFinish?.();
      animation.cancel();
      state.animations.delete(entry);
      if (state.animations.size === 0) {
        state.isAnimating = false;
        if (!state.followReady) {
          state.followDispose = setupParallaxFollowers(state.wrap);
          state.followReady = true;
        }
        if (state.pendingLayout) state.requestLayout?.();
      }
    })
    .catch(() => {
      state.animations.delete(entry);
      if (state.animations.size === 0) {
        state.isAnimating = false;
        if (!state.followReady) {
          state.followDispose = setupParallaxFollowers(state.wrap);
          state.followReady = true;
        }
        if (state.pendingLayout) state.requestLayout?.();
      }
    });
}

function cancelTrackedAnimations(state, options = {}) {
  const { skipFollowers = false } = options;
  state.animations.forEach((entry) => {
    try {
      entry.animation.cancel();
    } catch (error) {
      // ignore
    }
  });
  state.animations.clear();
  state.isAnimating = false;
  if (!state.followReady && !skipFollowers) {
    state.followDispose = setupParallaxFollowers(state.wrap);
    state.followReady = true;
  }
  if (state.pendingLayout) {
    const immediate = state.pendingLayoutReason === 'ripple';
    state.pendingLayout = false;
    state.pendingLayoutReason = null;
    state.requestLayout?.({ force: true, immediate });
  }
}

function readSafeMargin(element) {
  const styles = getComputedStyle(element);
  const raw = styles.getPropertyValue('--orbit-safe-margin');
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeAngleBounds(info, minX, maxX) {
  if (info.radius <= 0) {
    return { left: -90, right: -90 };
  }
  const leftRatio = clamp((minX - info.cx) / info.radius, -1, 1);
  const rightRatio = clamp((maxX - info.cx) / info.radius, -1, 1);
  let left = -radToDeg(Math.acos(leftRatio));
  let right = -radToDeg(Math.acos(rightRatio));
  if (!Number.isFinite(left)) left = -180;
  if (!Number.isFinite(right)) right = 0;
  if (left > right) {
    const temp = left;
    left = right;
    right = temp;
  }
  return { left, right };
}

function buildArcPathKeyframes(placement) {
  const frames = [];
  const steps = Math.max(1, Math.round(ANIM.dotPathSteps));
  const startAngle = -90;
  const endAngle = placement.angleDeg ?? startAngle;
  frames.push({
    offset: 0,
    left: formatPx(placement.startX),
    top: formatPx(placement.startY)
  });

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    const coords = polarToCartesian(placement.centerX, placement.centerY, placement.radius, angle);
    frames.push({
      offset: t,
      left: formatPx(i === steps ? placement.x : coords.x),
      top: formatPx(i === steps ? placement.y : coords.y)
    });
  }

  if (frames.length === 1) {
    frames.push({
      offset: 1,
      left: formatPx(placement.x),
      top: formatPx(placement.y)
    });
  }

  return frames;
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

function toRingTransform(scale) {
  return `translate(-50%, -50%) scale(${scale})`;
}

function toDotTransform(scale) {
  return `translate(-50%, -50%) scale(${scale})`;
}

function formatPx(value) {
  return `${value}px`;
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setupParallaxFollowers(wrap) {
  if (!wrap) return () => {};
  const root = wrap.closest('[data-follow-root]') ?? wrap;
  const layers = qsa('[data-follow-mouse]', root);
  if (!layers.length) return () => {};
  return createFollowGroup({ root });
}

function triggerOrbitRipple(state) {
  const layout = state.layout;
  if (!layout) return;
  if (state.rippleTimer) {
    window.clearTimeout(state.rippleTimer);
    state.rippleTimer = null;
  }
  cancelRippleAnimations(state);
  const ringCount = layout.ringInfo.length;
  if (!ringCount) return;

  layout.ringInfo.forEach((info, index) => {
    const strength = computeRippleStrength(index, ringCount);
    const delay = index * RIPPLE.waveDelay;
    const animation = animateRingRipple(info.el, strength, delay);
    registerRippleAnimation(state, animation);
  });

  layout.dotPlacements.forEach((placement) => {
    const strength =
      computeRippleStrength(placement.ringIndex, ringCount) * RIPPLE.dotStrengthMultiplier;
    const delay = placement.ringIndex * RIPPLE.waveDelay;
    const animation = animateDotRipple(placement, strength, delay);
    registerRippleAnimation(state, animation);
  });

  const pedestalLayers = layout.pedestal?.layers ?? [];
  if (pedestalLayers.length) {
    pedestalLayers.forEach((layer, index) => {
      const strength = computePedestalRippleStrength(index, pedestalLayers.length);
      const delay = index * RIPPLE.waveDelay * RIPPLE.pedestalWaveDelayFactor;
      const animation = animateRingRipple(layer.inner ?? layer.el, strength, delay);
      registerRippleAnimation(state, animation);
    });
  }

  const totalWave = RIPPLE.duration + (ringCount - 1) * RIPPLE.waveDelay;
  state.rippleTimer = window.setTimeout(() => {
    state.rippleTimer = null;
  }, totalWave);
}

function computeRippleStrength(index, total) {
  if (total <= 1) return RIPPLE.ringStrengthInner;
  const ratio = total <= 1 ? 0 : index / (total - 1);
  return (
    RIPPLE.ringStrengthOuter +
    (RIPPLE.ringStrengthInner - RIPPLE.ringStrengthOuter) * Math.max(0, 1 - ratio)
  );
}

function computePedestalRippleStrength(index, total) {
  if (total <= 1) return RIPPLE.pedestalStrengthInner;
  const ratio = total <= 1 ? 0 : index / (total - 1);
  return (
    RIPPLE.pedestalStrengthOuter +
    (RIPPLE.pedestalStrengthInner - RIPPLE.pedestalStrengthOuter) * Math.max(0, 1 - ratio)
  );
}

function animateRingRipple(element, strength, delay = 0) {
  if (!element || strength <= 0) return null;
  const keyframes = [
    { offset: 0, scale: 1 },
    { offset: 0.32, scale: 1 + strength },
    { offset: 0.58, scale: 1 - strength * 0.45 },
    { offset: 0.78, scale: 1 + strength * 0.18 },
    { offset: 1, scale: 1 }
  ];
  const animation = element.animate(keyframes, {
    duration: RIPPLE.duration,
    easing: RIPPLE.easing,
    delay
  });
  animation.finished.catch(() => {});
  return animation;
}

function animateDotRipple(placement, strength, delay = 0) {
  if (!placement?.dot || strength <= 0 || !placement.inner) return null;
  const frames = buildDotRippleFrames(placement, strength);
  const animation = placement.inner.animate(frames, {
    duration: RIPPLE.duration,
    easing: RIPPLE.easing,
    delay,
    fill: 'forwards'
  });
  animation.finished
    .then(() => {
      placement.inner.style.transform = '';
    })
    .catch(() => {});
  return animation;
}

function buildDotRippleFrames(placement, strength) {
  const sequences = [
    { offset: 0, scale: 0 },
    { offset: 0.32, scale: strength },
    { offset: 0.58, scale: -strength * 0.45 },
    { offset: 0.78, scale: strength * 0.18 },
    { offset: 1, scale: 0 }
  ];
  const angleRad = (placement.angleDeg * Math.PI) / 180;
  return sequences.map(({ offset, scale }) => {
    const radius = placement.radius * (1 + scale);
    const x = placement.centerX + radius * Math.cos(angleRad);
    const y = placement.centerY + radius * Math.sin(angleRad);
    return {
      offset,
      transform: `translate(${(x - placement.x).toFixed(2)}px, ${(y - placement.y).toFixed(2)}px)`
    };
  });
}

function resolveSpanFactor(count) {
  if (count <= 1) return 0.42;
  if (count === 2) return 0.65;
  if (count === 3) return 0.6;
  if (count === 4) return 0.92;
  return 1;
}

function registerRippleAnimation(state, animation) {
  if (!animation) return;
  state.rippleAnimations.add(animation);
  animation.finished
    .catch(() => {})
    .finally(() => {
      state.rippleAnimations.delete(animation);
      if (state.pendingLayout && state.rippleAnimations.size === 0) {
        const immediate = state.pendingLayoutReason === 'ripple';
        state.requestLayout?.({ force: true, immediate });
      }
    });
}

function cancelRippleAnimations(state, options = {}) {
  const { trigger = true } = options;
  if (!state?.rippleAnimations) return;
  state.rippleAnimations.forEach((animation) => {
    try {
      animation.cancel();
    } catch {
      /* ignore */
    }
  });
  state.rippleAnimations.clear();
  if (state.layout) {
    settleAnimatedStates(state.layout);
  }
  if (trigger && state.pendingLayout) {
    const immediate = state.pendingLayoutReason === 'ripple';
    state.requestLayout?.({ force: true, immediate });
  }
}

function ensureDotInner(dot) {
  if (!dot) return null;
  let inner = dot.querySelector(':scope > .orbit_dot_inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'orbit_dot_inner';
    while (dot.firstChild) {
      inner.appendChild(dot.firstChild);
    }
    dot.appendChild(inner);
  }
  return inner;
}

function computePedestalLayers(wrap) {
  if (!wrap) return null;
  const holder = wrap.querySelector('.orbit_pedestal');
  if (!holder) return null;
  const ordered = [
    holder.querySelector('.orbit_pedestal_circle--inner'),
    holder.querySelector('.orbit_pedestal_circle--middle'),
    holder.querySelector('.orbit_pedestal_circle--outer')
  ].filter(Boolean);
  if (!ordered.length) return null;
  const layers = ordered.map((el, index) => ({
    el,
    inner: ensurePedestalInner(el),
    index
  }));
  return { holder, layers };
}

function ensurePedestalInner(el) {
  if (!el) return null;
  let inner = el.querySelector(':scope > .orbit_pedestal_circle_core');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'orbit_pedestal_circle_core';
    while (el.firstChild) {
      inner.appendChild(el.firstChild);
    }
    el.appendChild(inner);
  }
  return inner;
}

function allocateDotsToRings(ringInfo, dotCount) {
  const evenFirst = buildParityDistribution(ringInfo, dotCount, true);
  if (evenFirst) return evenFirst;
  const oddFirst = buildParityDistribution(ringInfo, dotCount, false);
  if (oddFirst) return oddFirst;
  return allocateDotsByWeight(ringInfo, dotCount);
}

function buildParityDistribution(ringInfo, dotCount, outerPrefersEven) {
  const ringCount = ringInfo.length;
  if (!ringCount || dotCount <= 0) return new Array(ringCount).fill(0);

  const parities = ringInfo.map((_, innerIndex) => {
    const fromOuter = ringCount - 1 - innerIndex;
    const outerEven = fromOuter % 2 === 0;
    return outerPrefersEven ? outerEven : !outerEven;
  });

  const baseCounts = parities.map((isEven) => (isEven ? 2 : 1));
  const baseTotal = baseCounts.reduce((sum, value) => sum + value, 0);
  if (dotCount < baseTotal) return null;
  const remainder = dotCount - baseTotal;
  if (remainder % 2 !== 0) return null;

  const counts = baseCounts.slice();
  let remaining = remainder;
  const orderDesc = ringInfo
    .map((info, index) => ({ index, radius: info.radius ?? 0 }))
    .sort((a, b) => a.radius - b.radius)
    .map((entry) => entry.index)
    .reverse();

  let cursor = 0;
  while (remaining >= 2) {
    const ringIndex = orderDesc[cursor % orderDesc.length];
    counts[ringIndex] += 2;
    remaining -= 2;
    cursor += 1;
  }

  return counts;
}

function allocateDotsByWeight(ringInfo, dotCount) {
  const ringCount = ringInfo.length;
  const counts = new Array(ringCount).fill(0);
  if (!ringCount || dotCount <= 0) return counts;

  const totalRadius = ringInfo.reduce((sum, info) => sum + info.radius, 0);
  let remaining = dotCount;

  for (let i = ringCount - 1; i >= 0; i--) {
    if (remaining <= 0) break;
    const weight = totalRadius > 0 ? ringInfo[i].radius / totalRadius : 0;
    let ideal = Math.round(dotCount * weight);
    const minForThis = remaining > i ? 1 : 0;
    ideal = Math.max(ideal, minForThis);
    const assign = Math.min(ideal, remaining);
    counts[i] = assign;
    remaining -= assign;
  }

  if (remaining > 0) {
    counts[ringCount - 1] += remaining;
  }

  return counts;
}
