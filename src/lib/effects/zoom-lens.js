import { qsa } from '../dom.js';

const SELECTOR = '[data-zoom-lens]';
const LENS_ATTR = 'data-zoom-lens-ui';
const DEFAULT_SIZE = 220;
const DEFAULT_SCALE = 1.8;
const DEFAULT_BORDER = '#D1D1D1';
const DEFAULT_SHADOW_ALPHA = 0.2;
const EDGE_BUFFER_PX = 2;
const STYLE_ID = 'stitch-zoom-lens-styles';
const HOST_CACHE = new WeakMap();

const NOOP = () => {};

export function initZoomLenses(root = document) {
  if (typeof window === 'undefined' || !root) return NOOP;

  ensureStyles();
  const hosts = qsa(SELECTOR, root);
  if (!hosts.length) return NOOP;

  const cleanups = hosts.map((host) => createZoomLens(host));
  return () => cleanups.forEach((cleanup) => cleanup && cleanup());
}

function createZoomLens(host) {
  if (!host) return NOOP;
  if (HOST_CACHE.has(host)) return NOOP;

  const lens = document.createElement('div');
  const frame = document.createElement('div');
  const state = {
    active: false,
    frame,
    lens,
    host,
    hostRect: null,
    sourceRect: null,
    source: null,
    clone: null,
    observer: null,
    rafId: null,
    apertureSize: 0,
    x: 0,
    y: 0,
    sourceX: 0,
    sourceY: 0,
    previousPosition: '',
    appliedPosition: false
  };

  lens.className = 'stitch-zoom-lens';
  lens.setAttribute(LENS_ATTR, '');
  lens.setAttribute('aria-hidden', 'true');
  frame.className = 'stitch-zoom-lens_frame';
  lens.append(frame);

  const onPointerEnter = (event) => {
    if (event.pointerType === 'touch') return;
    if (state.active) {
      updatePointer(state, event);
      scheduleRender(state);
      return;
    }
    activate(state, event);
  };
  const onPointerMove = (event) => {
    if (!state.active || event.pointerType === 'touch') return;
    updatePointer(state, event);
    scheduleRender(state);
  };
  const onPointerLeave = () => deactivate(state);
  const onResize = () => {
    if (!state.active) return;
    refreshMetrics(state);
    scheduleRender(state);
  };

  host.addEventListener('pointerenter', onPointerEnter);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerleave', onPointerLeave);
  host.addEventListener('mouseenter', onPointerEnter);
  host.addEventListener('mousemove', onPointerMove);
  host.addEventListener('mouseleave', onPointerLeave);
  window.addEventListener('resize', onResize);

  const cleanup = () => {
    host.removeEventListener('pointerenter', onPointerEnter);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    host.removeEventListener('mouseenter', onPointerEnter);
    host.removeEventListener('mousemove', onPointerMove);
    host.removeEventListener('mouseleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    deactivate(state);
    lens.remove();
    HOST_CACHE.delete(host);
  };
  HOST_CACHE.set(host, cleanup);
  return cleanup;
}

function activate(state, event) {
  state.lens.classList.remove('is-shrinking');
  state.apertureSize = 0;

  if (!state.host.contains(state.lens)) {
    state.host.append(state.lens);
  }

  prepareHost(state);
  rebuildClone(state);
  observeSource(state);
  refreshMetrics(state);
  updatePointer(state, event);

  state.active = true;
  render(state);
  state.lens.classList.add('is-active');
}

function deactivate(state) {
  if (state.apertureSize > 0) {
    state.lens.classList.add('is-shrinking');
  }
  state.active = false;
  state.lens.classList.remove('is-active');
  if (state.rafId !== null) {
    window.cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  state.observer?.disconnect();
  state.observer = null;
  if (state.appliedPosition) {
    state.host.style.position = state.previousPosition;
    state.appliedPosition = false;
  }
}

function prepareHost(state) {
  const position = window.getComputedStyle(state.host).position;
  if (position === 'static') {
    state.previousPosition = state.host.style.position;
    state.host.style.position = 'relative';
    state.appliedPosition = true;
  }
}

function rebuildClone(state) {
  const source = resolveSource(state.host);
  if (!source) return;

  const clone = source.cloneNode(true);
  stripLensArtifacts(clone);
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('stitch-zoom-lens_source');

  state.frame.replaceChildren(clone);
  state.source = source;
  state.clone = clone;
}

function observeSource(state) {
  if (typeof MutationObserver === 'undefined' || !state.source) return;

  state.observer?.disconnect();
  state.observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mirrorMutation(state, mutation));
  });
  state.observer.observe(state.source, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });
}

function mirrorMutation(state, mutation) {
  if (!state.active || !state.clone || isLensNode(mutation.target)) return;

  if (mutation.type === 'attributes') {
    mirrorAttribute(state, mutation);
    return;
  }

  if (mutation.type === 'characterData') {
    mirrorCharacterData(state, mutation);
    return;
  }

  if (mutation.type === 'childList') {
    mirrorChildList(state, mutation);
  }
}

function mirrorAttribute(state, mutation) {
  const attr = mutation.attributeName;
  if (!attr || attr === LENS_ATTR || attr === 'data-zoom-lens') return;

  const cloneTarget = findCloneNode(state, mutation.target);
  if (!cloneTarget?.setAttribute) return;

  const value = mutation.target.getAttribute(attr);
  if (value === null) {
    cloneTarget.removeAttribute(attr);
  } else {
    cloneTarget.setAttribute(attr, value);
  }

  scheduleRender(state);
}

function mirrorCharacterData(state, mutation) {
  const cloneTarget = findCloneNode(state, mutation.target);
  if (!cloneTarget) return;
  cloneTarget.nodeValue = mutation.target.nodeValue;
  scheduleRender(state);
}

function mirrorChildList(state, mutation) {
  const cloneTarget = findCloneNode(state, mutation.target);
  if (!cloneTarget) return;

  cloneTarget.replaceChildren(
    ...Array.from(mutation.target.childNodes)
      .filter((node) => !isLensNode(node))
      .map((node) => cloneForLens(node))
  );
  refreshMetrics(state);
  scheduleRender(state);
}

function findCloneNode(state, sourceNode) {
  const path = getNodePath(state.source, sourceNode);
  if (!path || !state.clone) return null;

  let current = state.clone;
  for (const index of path) {
    current = current?.childNodes?.[index] ?? null;
    if (!current) return null;
  }
  return current;
}

function getNodePath(root, node) {
  if (!root || !node) return null;
  if (root === node) return [];

  const path = [];
  let current = node;
  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) return null;
    const siblings = Array.from(parent.childNodes).filter((child) => !isLensNode(child));
    const index = siblings.indexOf(current);
    if (index < 0) return null;
    path.unshift(index);
    current = parent;
  }
  return current === root ? path : null;
}

function cloneForLens(node) {
  const clone = node.cloneNode(true);
  stripLensArtifacts(clone);
  return clone;
}

function stripLensArtifacts(node) {
  if (node.nodeType !== 1) return;
  node.querySelectorAll(`[${LENS_ATTR}]`).forEach((child) => child.remove());
  node.removeAttribute('data-zoom-lens');
  node.querySelectorAll('[data-zoom-lens]').forEach((child) =>
    child.removeAttribute('data-zoom-lens')
  );
}

function isLensNode(node) {
  if (!node) return false;
  const element = node.nodeType === 1 ? node : node.parentElement;
  return Boolean(element?.closest?.(`[${LENS_ATTR}]`));
}

function refreshMetrics(state) {
  state.hostRect = state.host.getBoundingClientRect();
  state.sourceRect = state.source?.getBoundingClientRect() ?? state.hostRect;

  if (!state.clone || !state.sourceRect) return;
  Object.assign(state.clone.style, {
    width: `${state.sourceRect.width}px`,
    height: `${state.sourceRect.height}px`,
    minHeight: `${state.sourceRect.height}px`
  });
}

function updatePointer(state, event) {
  const hostRect = state.hostRect ?? state.host.getBoundingClientRect();
  const sourceRect = state.sourceRect ?? state.source?.getBoundingClientRect() ?? hostRect;
  state.hostRect = hostRect;
  state.sourceRect = sourceRect;
  state.x = event.clientX - hostRect.left;
  state.y = event.clientY - hostRect.top;
  state.sourceX = event.clientX - sourceRect.left;
  state.sourceY = event.clientY - sourceRect.top;
}

function scheduleRender(state) {
  if (state.rafId !== null) return;
  state.rafId = window.requestAnimationFrame(() => {
    state.rafId = null;
    render(state);
  });
}

function render(state) {
  if (!state.active || !state.clone) return;

  const size = readNumber(state.host.dataset.zoomLensSize, DEFAULT_SIZE);
  const scale = readNumber(state.host.dataset.zoomLensScale, DEFAULT_SCALE);
  const radius = size / 2;
  const edgeSize = resolveEdgeSize(state);
  const apertureSize = Math.min(size, edgeSize);
  const apertureRatio = size > 0 ? clamp01(apertureSize / size) : 0;
  const border = state.host.dataset.zoomLensBorder || DEFAULT_BORDER;
  const translateX = radius - state.sourceX * scale;
  const translateY = radius - state.sourceY * scale;
  const isShrinking = apertureSize < state.apertureSize - 0.5;

  state.lens.style.setProperty('--stitch-zoom-lens-size', `${size}px`);
  state.lens.style.setProperty('--stitch-zoom-lens-aperture-size', `${apertureSize}px`);
  state.lens.style.setProperty('--stitch-zoom-lens-edge-size', `${edgeSize}px`);
  state.lens.style.setProperty(
    '--stitch-zoom-lens-shadow-alpha',
    String(DEFAULT_SHADOW_ALPHA * apertureRatio)
  );
  state.lens.style.borderColor = border;
  state.lens.style.left = `${state.x}px`;
  state.lens.style.top = `${state.y}px`;
  state.lens.classList.toggle('is-shrinking', isShrinking);
  state.apertureSize = apertureSize;
  state.clone.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
}

function resolveEdgeSize(state) {
  const rect = state.hostRect;
  if (!rect) return Number.POSITIVE_INFINITY;

  const edgeDistance = Math.min(state.x, state.y, rect.width - state.x, rect.height - state.y);
  return Math.max(0, (edgeDistance - EDGE_BUFFER_PX) * 2);
}

function resolveSource(host) {
  const selector = host.dataset.zoomLensTarget || host.dataset.zoomLensSource;
  if (!selector) return host;
  try {
    return host.querySelector(selector) || host;
  } catch {
    return host;
  }
}

function readNumber(value, fallback) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .stitch-zoom-lens {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 20;
      width: 0;
      height: 0;
      max-width: var(--stitch-zoom-lens-edge-size, var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px));
      max-height: var(--stitch-zoom-lens-edge-size, var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px));
      border: 1px solid ${DEFAULT_BORDER};
      border-radius: 999px;
      background: #fff;
      box-shadow: 6px 15px 30px rgba(0, 0, 0, var(--stitch-zoom-lens-shadow-alpha, ${DEFAULT_SHADOW_ALPHA}));
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0);
      transition:
        width 700ms var(--motion-ease-primary, cubic-bezier(.11, .61, .27, .99)),
        height 700ms var(--motion-ease-primary, cubic-bezier(.11, .61, .27, .99)),
        opacity 160ms ease;
      transform-origin: 50% 50%;
      will-change: top, left, width, height;
    }

    .stitch-zoom-lens.is-active {
      width: var(--stitch-zoom-lens-aperture-size, var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px));
      height: var(--stitch-zoom-lens-aperture-size, var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px));
      opacity: 1;
    }

    .stitch-zoom-lens.is-shrinking {
      transition:
        width 700ms cubic-bezier(.73, .01, .89, .39),
        height 700ms cubic-bezier(.73, .01, .89, .39),
        opacity 160ms ease;
    }

    .stitch-zoom-lens_frame {
      position: absolute;
      top: 50%;
      left: 50%;
      width: var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px);
      height: var(--stitch-zoom-lens-size, ${DEFAULT_SIZE}px);
      overflow: hidden;
      border-radius: inherit;
      contain: strict;
      transform: translate3d(-50%, -50%, 0);
    }

    .stitch-zoom-lens_source {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      margin: 0 !important;
      pointer-events: none !important;
      transform-origin: 0 0 !important;
      will-change: transform;
    }
  `;

  document.head.append(style);
}
