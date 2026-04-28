import { byData, qsa } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { createDotsField } from '../../lib/effects/dots-field.js';
import { createFollowGroup } from '../../lib/effects/follow-group.js';
import { createValueCounter } from '../../lib/effects/value-counter.js';
import { resolveVisibilityThreshold, whenVisible } from '../../lib/effects/threshold.js';
import { clamp, lerp } from '../../lib/math.js';

const CARD_SELECTOR = '.small-card_container';
const ARROWS_SELECTOR = '.small-cards_arrows';
const VALUE_SELECTOR = '[data-value]';
const DECIMAL_SELECTOR = '[data-decimal]';
const ARC_STRENGTH = 70;
const ANIMATION_MS = 2500;
const ARROW_START_PROGRESS = 0.52;
const ARROW_POINTER_ROTATION_MAX = 5;
const ARROW_POINTER_LERP = 0.08;
const COUNTER_STAGGER_MS = 430;
const COUNTER_DURATION_MS = 210;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.smallCards), root);
  if (!sections.length) return () => {};

  const cleanups = sections.map((section) => setupSmallCardsSection(section));

  return () => cleanups.forEach((dispose) => dispose && dispose());
}

function setupSmallCardsSection(section) {
  const followRoot = section.matches('[data-follow-root]') ? section : section.querySelector('[data-follow-root]');
  const cards = qsa(CARD_SELECTOR, section).filter((node) => node instanceof HTMLElement);
  const arrows = section.querySelector(ARROWS_SELECTOR);
  const dotsCanvas = section.querySelector('.features-graphic_cc_dots-canvas');
  const dotsSensor = section.querySelector('.features-graphic_cc_dots-sensor');
  const threshold = resolveVisibilityThreshold(section, 0.5);

  if (!cards.length) {
    return () => {};
  }

  const revealController = ensureSectionReveal(section);
  const state = cards.map((card, index) => ({
    card,
    index,
    targetX: 0,
    targetY: 0,
    counters: createCardCounters(card)
  }));

  let progress = 0;
  let rafId = null;
  let resizeRafId = null;
  let isDisposed = false;
  let didAnimate = false;
  let arrowTargetAngle = 0;
  let arrowBaseRotation = 0;
  let pointerRotation = 0;
  let pointerRotationTarget = 0;
  let pointerRafId = null;
  const counterTimeouts = [];

  const measureTargets = () => {
    state.forEach((item) => {
      item.card.style.removeProperty('transform');
    });
    arrows?.style.removeProperty('transform');

    state.forEach((item) => {
      const transform = window.getComputedStyle(item.card).transform;
      const matrix = parseTransformMatrix(transform);
      item.targetX = matrix.m41;
      item.targetY = matrix.m42;
    });

    if (arrows) {
      const arrowsTransform = window.getComputedStyle(arrows).transform;
      arrowTargetAngle = readRotationDegrees(parseTransformMatrix(arrowsTransform));
    }

    render(progress);
  };

  const render = (value) => {
    const t = easeOutCubic(clamp(value, 0, 1));
    state.forEach((item, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const x = lerp(0, item.targetX, t);
      const y = lerp(0, item.targetY, t);
      const arc = Math.sin(t * Math.PI) * ARC_STRENGTH * direction;
      item.card.style.transform = `translate3d(${x.toFixed(2)}px, ${(y + arc).toFixed(2)}px, 0)`;
    });

    if (arrows) {
      const arrowProgress = easeOutCubic(clamp((value - ARROW_START_PROGRESS) / (1 - ARROW_START_PROGRESS), 0, 1));
      arrowBaseRotation = lerp(arrowTargetAngle + 360, arrowTargetAngle, arrowProgress);
      applyArrowTransform(arrowProgress);
    }
  };

  const animateIn = () => {
    const start = performance.now();

    const tick = (now) => {
      if (isDisposed) return;
      progress = clamp((now - start) / ANIMATION_MS, 0, 1);
      render(progress);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    rafId = window.requestAnimationFrame(tick);
  };

  const animateCounters = () => {
    state.forEach((item, index) => {
      const timeoutId = window.setTimeout(() => {
        if (isDisposed) return;
        item.counters.start();
      }, index * COUNTER_STAGGER_MS);

      counterTimeouts.push(timeoutId);
    });
  };

  const queueMeasure = () => {
    if (resizeRafId != null) return;
    resizeRafId = window.requestAnimationFrame(() => {
      resizeRafId = null;
      measureTargets();
    });
  };

  const getArrowScale = () =>
    progress <= ARROW_START_PROGRESS
      ? 0
      : easeOutCubic(clamp((progress - ARROW_START_PROGRESS) / (1 - ARROW_START_PROGRESS), 0, 1));

  const applyArrowTransform = (scaleProgress = getArrowScale()) => {
    if (!arrows) return;
    const angle = arrowBaseRotation + pointerRotation;
    arrows.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${scaleProgress.toFixed(3)})`;
  };

  const animateArrowPointer = () => {
    pointerRafId = null;
    pointerRotation = lerp(pointerRotation, pointerRotationTarget, ARROW_POINTER_LERP);

    if (Math.abs(pointerRotationTarget - pointerRotation) <= 0.01) {
      pointerRotation = pointerRotationTarget;
    }

    applyArrowTransform();

    if (Math.abs(pointerRotationTarget - pointerRotation) > 0.01) {
      pointerRafId = window.requestAnimationFrame(animateArrowPointer);
    }
  };

  const queueArrowPointerAnimation = () => {
    if (!arrows || pointerRafId != null) return;
    pointerRafId = window.requestAnimationFrame(animateArrowPointer);
  };

  const updateArrowPointerTarget = (clientX) => {
    if (!arrows) return;
    const bounds = section.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const halfWidth = Math.max(bounds.width / 2, 1);
    const normalizedX = clamp((clientX - centerX) / halfWidth, -1, 1);
    pointerRotationTarget = normalizedX * ARROW_POINTER_ROTATION_MAX;
    queueArrowPointerAnimation();
  };

  const resetArrowPointerTarget = () => {
    pointerRotationTarget = 0;
    queueArrowPointerAnimation();
  };

  const handlePointerMove = (event) => {
    updateArrowPointerTarget(event.clientX);
  };

  measureTargets();

  const teardownFollowers = followRoot ? createFollowGroup({ root: followRoot }) : () => {};
  const disposeDots =
    dotsCanvas && dotsSensor
      ? createDotsField({
          canvas: dotsCanvas,
          sensor: dotsSensor,
          pointerTarget: followRoot ?? section
        })
      : () => {};

  const stopVisibilityWatch = whenVisible(
    section,
    () => {
      if (didAnimate) return () => {};
      didAnimate = true;
      revealController.ensure();
      animateIn();
      animateCounters();
      return () => {};
    },
    { threshold }
  );

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(queueMeasure) : null;
  resizeObserver?.observe(section);
  followRoot && resizeObserver?.observe(followRoot);
  cards.forEach((card) => resizeObserver?.observe(card));

  window.addEventListener('resize', queueMeasure, { passive: true });
  section.addEventListener('pointermove', handlePointerMove, { passive: true });
  section.addEventListener('pointerleave', resetArrowPointerTarget, { passive: true });

  return () => {
    isDisposed = true;
    if (rafId != null) {
      window.cancelAnimationFrame(rafId);
    }
    if (resizeRafId != null) {
      window.cancelAnimationFrame(resizeRafId);
    }
    if (pointerRafId != null) {
      window.cancelAnimationFrame(pointerRafId);
    }
    counterTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    window.removeEventListener('resize', queueMeasure);
    section.removeEventListener('pointermove', handlePointerMove);
    section.removeEventListener('pointerleave', resetArrowPointerTarget);
    resizeObserver?.disconnect();
    stopVisibilityWatch();
    teardownFollowers();
    disposeDots();
    state.forEach((item) => item.counters.dispose());
    state.forEach((item) => {
      item.card.style.removeProperty('transform');
    });
    arrows?.style.removeProperty('transform');
    revealController.cancel();
  };
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function parseTransformMatrix(transform) {
  if (!transform || transform === 'none') {
    return new DOMMatrixReadOnly();
  }

  try {
    return new DOMMatrixReadOnly(transform);
  } catch {
    return new DOMMatrixReadOnly();
  }
}

function readRotationDegrees(matrix) {
  return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
}

function createCardCounters(card) {
  const valueElement = card.querySelector(VALUE_SELECTOR);
  const decimalElement = card.querySelector(DECIMAL_SELECTOR);
  let valueCounter = null;

  const targetValue = Number(valueElement?.dataset?.value);
  const decimalText = decimalElement?.dataset?.decimal;
  const shouldAnimateDecimal = resolveBoolean(decimalElement?.dataset?.animate, false);
  const decimalDigits = decimalText?.trim() ?? '';
  const decimalPlaces = decimalDigits.length;
  const decimalTarget = Number.parseInt(decimalDigits, 10);

  const hasAnimatedDecimal =
    decimalElement &&
    shouldAnimateDecimal &&
    decimalPlaces > 0 &&
    Number.isFinite(decimalTarget);

  if (valueElement && Number.isFinite(targetValue)) {
    const shouldFormat = resolveBoolean(valueElement.dataset.format, true);
    valueCounter = createValueCounter({
      element: valueElement,
      initialValue: 0,
      duration: COUNTER_DURATION_MS,
      decimals: hasAnimatedDecimal ? decimalPlaces : 0,
      useGrouping: shouldFormat,
      formatter: (value) =>
        hasAnimatedDecimal
          ? formatCompoundValue({
              value,
              integerElement: valueElement,
              decimalElement,
              decimalPlaces,
              useGrouping: shouldFormat
            })
          : formatWholeNumber(value, shouldFormat)
    });
  }

  if (decimalElement && decimalDigits) {
    if (!hasAnimatedDecimal) {
      decimalElement.textContent = decimalDigits;
    }
  }

  return {
    start() {
      if (valueElement && valueCounter && Number.isFinite(targetValue)) {
        const nextTarget = hasAnimatedDecimal
          ? composeDecimalValue(targetValue, decimalDigits)
          : targetValue;
        valueCounter.setTarget(nextTarget);
      }
    },
    dispose() {
      valueCounter?.dispose();
    }
  };
}

function resolveBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return fallback;
}

function formatWholeNumber(value, useGrouping) {
  const rounded = Math.max(0, Math.round(Number(value) || 0));
  return useGrouping ? rounded.toLocaleString('en-US') : String(rounded);
}

function formatDecimalNumber(value, minDigits) {
  const rounded = Math.max(0, Math.round(Number(value) || 0));
  return String(rounded).padStart(minDigits, '0');
}

function composeDecimalValue(integerValue, decimalDigits) {
  const whole = Math.max(0, Math.round(Number(integerValue) || 0));
  const fraction = decimalDigits ? Number(`0.${decimalDigits}`) : 0;
  return whole + fraction;
}

function formatCompoundValue({ value, integerElement, decimalElement, decimalPlaces, useGrouping }) {
  const numeric = Math.max(0, Number(value) || 0);
  const fixed = numeric.toFixed(decimalPlaces);
  const [wholePart = '0', decimalPart = ''] = fixed.split('.');
  const formattedWhole = formatWholeNumber(Number(wholePart), useGrouping);

  integerElement.textContent = formattedWhole;
  if (decimalElement) {
    decimalElement.textContent = decimalPart.padEnd(decimalPlaces, '0');
  }

  return formattedWhole;
}
