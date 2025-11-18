const NOOP = () => {};
const DEFAULT_DURATION = 120;
const DEFAULT_SNAP = 0.01;
const DEFAULT_LOCALE = 'en-US';
const DRIVER_AUTO = 'auto';
const DRIVER_EXTERNAL = 'external';

export function createValueCounter(options = {}) {
  const { element } = options;
  if (!element || typeof window === 'undefined') {
    const initialValue = Number(options.initialValue) || 0;
    return {
      setTarget: NOOP,
      jumpTo: NOOP,
      dispose: NOOP,
      advance: NOOP,
      get value() {
        return initialValue;
      },
      get target() {
        return initialValue;
      }
    };
  }

  const datasetConfig = readCounterDataset(element);
  const template = parseCounterTextTemplate(element);
  const driver = options.driver === DRIVER_EXTERNAL ? DRIVER_EXTERNAL : DRIVER_AUTO;

  const duration = resolveNumber(
    options.duration,
    datasetConfig.duration,
    DEFAULT_DURATION
  );

  const formatter =
    typeof options.formatter === 'function'
      ? options.formatter
      : createFormatter({
          prefix: coalesce(options.prefix, datasetConfig.prefix, template?.prefix, ''),
          suffix: coalesce(options.suffix, datasetConfig.suffix, template?.suffix, ''),
          decimals: clampDecimals(
            coalesce(options.decimals, datasetConfig.decimals, template?.decimals, 0)
          ),
          locale: coalesce(options.locale, datasetConfig.locale, DEFAULT_LOCALE),
          useGrouping: coalesce(options.useGrouping, datasetConfig.useGrouping, true)
        });

  const snapEpsilon = resolvePositiveNumber(
    options.snapEpsilon,
    datasetConfig.snapEpsilon,
    DEFAULT_SNAP
  );

  let displayValue =
    Number.parseFloat(
      coalesce(
        options.initialValue,
        datasetConfig.initialValue,
        template?.value,
        0
      )
    ) || 0;

  let targetValue = displayValue;
  let rafId = null;

  const counterStep = duration > 0 ? 1 - Math.exp(-16 / duration) : 1;
  const snapThreshold = Number.isFinite(snapEpsilon) && snapEpsilon > 0 ? snapEpsilon : null;

  function applyFormatter(value) {
    const rounded = Math.round(value);
    const text = formatter(value, rounded);
    if (typeof text === 'string') {
      element.textContent = text;
    }
  }

  function runStep() {
    if (displayValue === targetValue) return false;
    displayValue += (targetValue - displayValue) * counterStep;
    if (snapThreshold !== null && Math.abs(targetValue - displayValue) <= snapThreshold) {
      displayValue = targetValue;
    }
    applyFormatter(displayValue);
    return displayValue !== targetValue;
  }

  function tick() {
    rafId = null;
    const needsMore = runStep();
    if (needsMore) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function ensureTick() {
    if (driver === DRIVER_EXTERNAL) return;
    if (rafId === null) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function advance() {
    runStep();
    return displayValue;
  }

  function setTarget(nextValue) {
    const numeric = Number(nextValue);
    if (!Number.isFinite(numeric)) return;
    targetValue = numeric;
    if (targetValue === displayValue) return;
    ensureTick();
  }

  function jumpTo(nextValue) {
    const numeric = Number(nextValue);
    if (!Number.isFinite(numeric)) return;
    targetValue = numeric;
    displayValue = numeric;
    applyFormatter(displayValue);
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function dispose() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  applyFormatter(displayValue);

  return {
    setTarget,
    jumpTo,
    dispose,
    advance,
    get value() {
      return displayValue;
    },
    get target() {
      return targetValue;
    }
  };
}

export function readCounterDataset(element) {
  const dataset = element?.dataset;
  if (!dataset) return {};

  const config = {};

  const duration = resolvePositiveNumber(dataset.counterDuration);
  if (Number.isFinite(duration)) config.duration = duration;

  const initialValue = resolveNumber(dataset.counterInitial);
  if (Number.isFinite(initialValue)) config.initialValue = initialValue;

  const value = resolveNumber(dataset.counterValue);
  if (Number.isFinite(value)) config.value = value;

  if (dataset.counterPrefix !== undefined) config.prefix = dataset.counterPrefix;
  if (dataset.counterSuffix !== undefined) config.suffix = dataset.counterSuffix;

  const decimals = resolveDecimals(dataset);
  if (Number.isInteger(decimals)) config.decimals = decimals;

  const grouping = resolveBoolean(dataset.counterGrouping);
  if (grouping !== null) config.useGrouping = grouping;

  if (dataset.counterLocale) config.locale = dataset.counterLocale;

  const snap = resolvePositiveNumber(dataset.counterSnap);
  if (Number.isFinite(snap)) config.snapEpsilon = snap;

  return config;
}

export function parseCounterTextTemplate(nodeOrText) {
  const raw =
    typeof nodeOrText === 'string'
      ? nodeOrText
      : nodeOrText?.textContent;
  const text = raw?.trim?.();
  if (!text) return null;

  const match = text.match(/^([^0-9+-]*)([0-9,.\-+]+)(.*)$/);
  if (!match) return null;

  const [, prefix = '', numericPart = '', suffix = ''] = match;
  const decimals = numericPart.includes('.') ? numericPart.split('.')[1].length : 0;
  const value = Number.parseFloat(numericPart.replace(/,/g, ''));
  return {
    prefix,
    suffix,
    decimals: clampDecimals(decimals),
    value: Number.isFinite(value) ? value : 0
  };
}

function createFormatter({ prefix, suffix, decimals, locale, useGrouping }) {
  return (value) => {
    const numeric = Number(value) || 0;
    const formatted = numeric.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping
    });
    return `${prefix ?? ''}${formatted}${suffix ?? ''}`;
  };
}

function resolveDecimals(dataset) {
  if (!dataset) return null;
  if (dataset.counterDecimals !== undefined) {
    const decimals = Number.parseInt(dataset.counterDecimals, 10);
    if (Number.isFinite(decimals) && decimals >= 0) return decimals;
  }
  if (dataset.counterDecimal !== undefined) {
    const include = resolveBoolean(dataset.counterDecimal);
    if (include === true) return 2;
    if (include === false) return 0;
  }
  return null;
}

function resolveBoolean(value) {
  if (value === undefined) return null;
  if (value === '' || value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return null;
}

function clampDecimals(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function resolveNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function resolvePositiveNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return null;
}

function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}
