import { qsa } from '../dom.js';

const POSITION_SELECTOR = '.stacked-windows_position';
const CARD_SELECTOR = '.stacked-windows_img-wrap';
const DEFAULT_BREAKPOINT = 991;

const DEFAULT_LAYOUT = Object.freeze({
  desktop: Object.freeze({
    anchorX: 0,
    anchorY: 0,
    anchorDepth: 0,
    xStep: 5,
    yStep: -19,
    depthBase: -1,
    depthStep: -1
  }),
  mobile: Object.freeze({
    anchorX: 0,
    anchorY: 38,
    anchorDepth: 0,
    xStep: 10,
    yStep: -19,
    depthBase: -1,
    depthStep: -1
  })
});

const NOOP = () => {};

export function createStackedWindowsController(wrap, options = {}) {
  if (typeof window === 'undefined' || !wrap) return NOOP;

  const positions = qsa(POSITION_SELECTOR, wrap);
  if (!positions.length) return NOOP;

  const cards = qsa(CARD_SELECTOR, wrap);
  const layout = mergeLayouts(options.layout);
  const breakpoint = Number.isFinite(options.breakpoint)
    ? options.breakpoint
    : DEFAULT_BREAKPOINT;
  const mediaQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia(`(max-width: ${breakpoint}px)`)
      : null;

  cards.forEach((card, idx) => card.style.setProperty('--i', String(idx)));
  wrap.dataset.stackCount = String(positions.length);

  const applyLayout = () => {
    const mode = mediaQuery?.matches ? 'mobile' : 'desktop';
    const config = layout[mode] ?? layout.desktop;
    const total = positions.length;
    positions.forEach((el, index) => {
      const offsets = computeOffsets(index, config);
      el.style.setProperty('--stack-x', `${offsets.x}%`);
      el.style.setProperty('--stack-y', `${offsets.y}%`);
      el.style.setProperty('--stack-z', `${offsets.z}px`);
      el.style.setProperty('--stack-layer', String(total - index));
      el.style.setProperty('--stack-position', index === 0 ? 'relative' : 'absolute');
      el.dataset.stackIndex = String(index);
    });
  };

  applyLayout();
  const detach = bindMediaQuery(mediaQuery, applyLayout);

  return () => {
    detach();
    positions.forEach((el) => {
      el.style.removeProperty('--stack-x');
      el.style.removeProperty('--stack-y');
      el.style.removeProperty('--stack-z');
      el.style.removeProperty('--stack-layer');
      el.style.removeProperty('--stack-position');
      delete el.dataset.stackIndex;
    });
    cards.forEach((card) => card.style.removeProperty('--i'));
    delete wrap.dataset.stackCount;
  };
}

function bindMediaQuery(query, handler) {
  if (!query) return NOOP;
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }
  if (typeof query.addListener === 'function') {
    query.addListener(handler);
    return () => query.removeListener(handler);
  }
  return NOOP;
}

function mergeLayouts(overrides = {}) {
  return {
    desktop: { ...DEFAULT_LAYOUT.desktop, ...(overrides.desktop || {}) },
    mobile: { ...DEFAULT_LAYOUT.mobile, ...(overrides.mobile || {}) }
  };
}

function computeOffsets(index, config) {
  if (index === 0) {
    return {
      x: config.anchorX ?? 0,
      y: config.anchorY ?? 0,
      z: config.anchorDepth ?? 0
    };
  }
  const step = index;
  return {
    x: (config.anchorX ?? 0) + step * (config.xStep ?? 0),
    y: (config.anchorY ?? 0) + step * (config.yStep ?? 0),
    z: (config.depthBase ?? -1) + step * (config.depthStep ?? -1)
  };
}
