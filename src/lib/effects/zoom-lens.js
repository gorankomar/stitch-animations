import { qsa } from '../dom.js';

const SELECTOR = '[data-zoom-lens]';
const LENS_ATTR = 'data-zoom-lens-ui';
const DEFAULT_SIZE = 220;
const DEFAULT_SCALE = 1.8;
const DEFAULT_BORDER = '#b8b8b8';
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
  if (!state.host.contains(state.lens)) {
    state.host.append(state.lens);
  }

  prepareHost(state);
  rebuildClone(state);
  observeSource(state);
  refreshMetrics(state);
  updatePointer(state, event);

  state.active = true;
  state.lens.classList.add('is-active');
  scheduleRender(state);
}

function deactivate(state) {
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
  const border = state.host.dataset.zoomLensBorder || DEFAULT_BORDER;
  const translateX = radius - state.sourceX * scale;
  const translateY = radius - state.sourceY * scale;

  state.lens.style.width = `${size}px`;
  state.lens.style.height = `${size}px`;
  state.lens.style.borderColor = border;
  state.lens.style.transform = `translate3d(${state.x - radius}px, ${state.y - radius}px, 0)`;
  state.clone.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
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
      border: 1px solid ${DEFAULT_BORDER};
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 12px 36px rgba(0, 0, 0, .12);
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translate3d(-9999px, -9999px, 0);
      transition: opacity 160ms ease;
      will-change: transform;
    }

    .stitch-zoom-lens.is-active {
      opacity: 1;
    }

    .stitch-zoom-lens_frame {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
      contain: strict;
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
