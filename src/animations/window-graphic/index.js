import { byData, qsa } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { resolveVisibilityThreshold, whenVisible } from '../../lib/effects/threshold.js';
import { createValueCounter } from '../../lib/effects/value-counter.js';
import { toMs } from '../../lib/time.js';

const REVEAL_SELECTOR = '[data-reveal]';
const VALUE_SELECTOR = '[data-value]';
const DATE_SELECTOR = '[data-date="true"]';
const DEFAULT_COUNTER_DURATION_MS = 250;
const DEFAULT_REVEAL_STAGGER_MS = 20;

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.windowGraphic), root);
  if (!sections.length) return () => {};

  const cleanups = sections.map((section) => setupWindowGraphicSection(section));

  return () => cleanups.forEach((dispose) => dispose && dispose());
}

function setupWindowGraphicSection(section) {
  applyCurrentDates(section);

  const revealController = ensureSectionReveal(section);
  const counters = createCounters(section);
  const threshold = resolveVisibilityThreshold(section, 0.7);
  const staggerMs = readRevealStagger(section);
  const counterTimeouts = new Set();
  let didAnimate = false;

  const startCounters = () => {
    const revealTargets = qsa(REVEAL_SELECTOR, section);

    counters.forEach((counter) => {
      const revealTarget = counter.element.closest(REVEAL_SELECTOR);
      const revealIndex = Math.max(0, revealTargets.indexOf(revealTarget));
      const timeoutId = window.setTimeout(() => {
        counter.start();
        counterTimeouts.delete(timeoutId);
      }, revealIndex * staggerMs);
      counterTimeouts.add(timeoutId);
    });
  };

  const stopVisibilityWatch = whenVisible(
    section,
    () => {
      if (didAnimate) return () => {};
      didAnimate = true;
      revealController.ensure();
      startCounters();
      return () => {};
    },
    { threshold }
  );

  return () => {
    counterTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    counterTimeouts.clear();
    counters.forEach((counter) => counter.dispose());
    stopVisibilityWatch();
    revealController.cancel();
  };
}

function applyCurrentDates(section) {
  const now = new Date();
  const dateText = formatCurrentDate(now);
  const timeText = formatCurrentTime(now);

  qsa(DATE_SELECTOR, section).forEach((element) => {
    element.textContent = resolveBoolean(element.dataset.time, false)
      ? `${dateText} ${timeText}`
      : dateText;
  });
}

function createCounters(section) {
  return qsa(VALUE_SELECTOR, section)
    .map((element) => createCounter(element))
    .filter(Boolean);
}

function createCounter(element) {
  if (resolveBoolean(element.dataset.date, false)) return null;

  const targetValue = Number(element.dataset.value);
  if (!Number.isFinite(targetValue)) return null;

  const decimalElement = findDecimalElement(element);
  const decimalText = decimalElement?.dataset?.decimal?.trim() ?? '';
  const shouldAnimateDecimal = resolveBoolean(decimalElement?.dataset?.animate, false);
  const decimalPlaces = decimalText.length;
  const decimalTarget = Number.parseInt(decimalText, 10);
  const hasAnimatedDecimal =
    decimalElement &&
    shouldAnimateDecimal &&
    decimalPlaces > 0 &&
    Number.isFinite(decimalTarget);
  const shouldFormat = resolveBoolean(element.dataset.format, true);

  const valueCounter = createValueCounter({
    element,
    initialValue: 0,
    duration: DEFAULT_COUNTER_DURATION_MS,
    decimals: hasAnimatedDecimal ? decimalPlaces : 0,
    useGrouping: shouldFormat,
    formatter: (value) =>
      hasAnimatedDecimal
        ? formatCompoundValue({
            value,
            integerElement: element,
            decimalElement,
            decimalPlaces,
            useGrouping: shouldFormat
          })
        : formatWholeNumber(value, shouldFormat)
  });

  if (decimalElement && decimalText && !hasAnimatedDecimal) {
    decimalElement.textContent = decimalText;
  }

  return {
    element,
    start() {
      const nextTarget = hasAnimatedDecimal
        ? composeDecimalValue(targetValue, decimalText)
        : targetValue;
      valueCounter.setTarget(nextTarget);
    },
    dispose() {
      valueCounter.dispose();
    }
  };
}

function findDecimalElement(element) {
  const valueBlock = element.parentElement;
  if (!valueBlock) return null;
  return valueBlock.querySelector('[data-decimal]');
}

function formatCurrentDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatCurrentTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function readRevealStagger(section) {
  const explicit = toMs(section.dataset?.revealStagger, NaN);
  if (Number.isFinite(explicit)) return explicit;

  const rootValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--reveal-stagger-default');
  return toMs(rootValue, DEFAULT_REVEAL_STAGGER_MS);
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
