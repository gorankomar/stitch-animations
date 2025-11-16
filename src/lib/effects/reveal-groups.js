import { toMs } from '../time.js';

const REVEAL_SELECTOR = '[data-reveal]';
const REVEAL_GROUP_SELECTOR = '[data-reveal-group]';
const REVEAL_CLASS = 'is-reveal';

const TIMING_FALLBACKS = Object.freeze({
  duration: 700,
  stagger: 200,
  opacityRatio: 0.7
});

const DEFAULT_OPTIONS = Object.freeze({
  selector: REVEAL_SELECTOR,
  groupSelector: REVEAL_GROUP_SELECTOR,
  className: REVEAL_CLASS
});

const SECTION_CACHE = new WeakMap();

const NOOP_CONTROLLER = Object.freeze({
  ensure() {
    return 0;
  },
  cancel() {},
  reset() {}
});

export function resolveRevealTimings() {
  if (typeof window === 'undefined') {
    const { duration, stagger, opacityRatio } = TIMING_FALLBACKS;
    return {
      duration,
      stagger,
      opacityRatio,
      opacityDuration: Math.round(duration * opacityRatio)
    };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const cssDuration = styles.getPropertyValue('--reveal-duration-default');
  const cssStagger = styles.getPropertyValue('--reveal-stagger-default');
  const cssOpacityRatio = styles.getPropertyValue('--reveal-opacity-ratio');

  const duration = toMs(cssDuration, TIMING_FALLBACKS.duration);
  const stagger = toMs(cssStagger, TIMING_FALLBACKS.stagger);
  const opacityRatio = parseFloat(cssOpacityRatio) || TIMING_FALLBACKS.opacityRatio;

  return {
    duration,
    stagger,
    opacityRatio,
    opacityDuration: Math.round(duration * opacityRatio)
  };
}

export function createRevealController(options = {}) {
  if (typeof window === 'undefined') return NOOP_CONTROLLER;

  const {
    root,
    selector = DEFAULT_OPTIONS.selector,
    groupSelector = DEFAULT_OPTIONS.groupSelector,
    className = DEFAULT_OPTIONS.className,
    timings = resolveRevealTimings()
  } = options;

  if (!root) return NOOP_CONTROLLER;

  const revealEls = querySelectorAllSafe(selector, root);
  if (!revealEls.length) return NOOP_CONTROLLER;
  revealEls.forEach((el) => el.classList.remove(className));

  const rootGroup = buildGroupTree(root, {
    groupSelector,
    revealSelector: selector,
    defaultStagger: timings.stagger
  });
  if (!rootGroup.children.length) return NOOP_CONTROLLER;

  const timeouts = new Set();
  let hasStarted = false;
  let finishAt = 0;
  let lastDuration = 0;

  const scheduleReveal = (el, delay) => {
    const appliedDelay = Math.max(0, delay);
    const timeoutId = window.setTimeout(() => {
      el.classList.add(className);
    }, appliedDelay);
    timeouts.add(timeoutId);
    return timeoutId;
  };

  const startGroup = (group, startTime = 0) => {
    const groupDelay = startTime + group.delay;
    let cursor = groupDelay;
    let maxEnd = groupDelay;
    const revealBuffer = [];

    const flushReveals = () => {
      if (!revealBuffer.length) return;
      let localCursor = 0;
      revealBuffer.forEach((node) => {
        const elementStagger = toMs(node.stagger, group.stagger);
        const delayFromGroup = localCursor + node.delay;
        const revealDelay = cursor + delayFromGroup;
        const duration = applyRevealOverrides(node.el, timings);
        scheduleReveal(node.el, revealDelay);
        maxEnd = Math.max(maxEnd, revealDelay + duration);
        localCursor += elementStagger;
      });
      cursor += localCursor;
      revealBuffer.length = 0;
    };

    group.children.forEach((child) => {
      if (child.type === 'group') {
        flushReveals();
        const childDuration = startGroup(child, cursor);
        cursor += childDuration;
        maxEnd = Math.max(maxEnd, cursor);
        return;
      }
      revealBuffer.push(child);
    });

    flushReveals();
    return Math.max(0, maxEnd - startTime);
  };

  const ensure = () => {
    if (!hasStarted) {
      hasStarted = true;
      lastDuration = startGroup(rootGroup, 0);
      finishAt = performance.now() + lastDuration;
      return lastDuration;
    }
    return Math.max(0, finishAt - performance.now());
  };

  const cancel = () => {
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
    revealEls.forEach((el) => el.classList.remove(className));
    hasStarted = false;
    finishAt = 0;
    lastDuration = 0;
  };

  const reset = () => {
    cancel();
  };

  return {
    ensure,
    cancel,
    reset
  };
}

export function ensureSectionReveal(section, options = {}) {
  if (!section) return null;
  let controller = SECTION_CACHE.get(section);
  if (controller) return controller;
  const controllerOptions = {
    root: section,
    ...options
  };
  if (!controllerOptions.timings) {
    controllerOptions.timings = resolveRevealTimings();
  }
  controller = createRevealController(controllerOptions);
  SECTION_CACHE.set(section, controller);
  return controller;
}

export function releaseSectionReveal(section) {
  const controller = SECTION_CACHE.get(section);
  if (!controller) return;
  controller.cancel();
  SECTION_CACHE.delete(section);
}

function buildGroupTree(root, options) {
  const group = {
    type: 'group',
    el: root,
    children: [],
    stagger: toMs(root.dataset?.revealStagger, options.defaultStagger),
    delay: toMs(root.dataset?.revealDelay, 0)
  };

  const walker = (node, bucket) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType !== 1) return;
      if (child.matches?.(options.groupSelector)) {
        bucket.push(buildGroupTree(child, options));
        return;
      }
      if (child.matches?.(options.revealSelector ?? REVEAL_SELECTOR)) {
        bucket.push({
          type: 'reveal',
          el: child,
          delay: toMs(readRevealAttr(child, 'revealDelay'), 0),
          stagger: readRevealAttr(child, 'revealStagger')
        });
        return;
      }
      walker(child, bucket);
    });
  };

  walker(root, group.children);
  return group;
}

function applyRevealOverrides(el, timings) {
  const durationValue = readRevealAttr(el, 'revealDuration');
  const offsetValue = readRevealAttr(el, 'revealOffset');
  const easeValue = readRevealAttr(el, 'revealEase');
  const opacityOverride = readRevealAttr(el, 'revealOpacityDuration');

  let durationMs = timings.duration;
  if (durationValue) {
    durationMs = toMs(durationValue, timings.duration);
    el.style.setProperty('--reveal-duration', durationValue);
  }
  if (offsetValue) el.style.setProperty('--reveal-offset', offsetValue);
  if (easeValue) el.style.setProperty('--motion-ease-primary', easeValue);

  let opacityDuration = Math.round(durationMs * timings.opacityRatio);
  if (opacityOverride) {
    opacityDuration = toMs(opacityOverride, opacityDuration);
    el.style.setProperty('--reveal-opacity-duration', opacityOverride);
  } else {
    el.style.setProperty('--reveal-opacity-duration', `${opacityDuration}ms`);
  }

  el.style.setProperty('--shadow-delay-factor', '0');
  el.style.setProperty('--shadow-delay-offset', `${durationMs}ms`);
  return durationMs;
}

function readRevealAttr(el, key) {
  if (el.dataset?.[key]) return el.dataset[key];
  let current = el.parentElement;
  while (current) {
    if (current.dataset?.[key]) return current.dataset[key];
    current = current.parentElement;
  }
  return null;
}

function querySelectorAllSafe(selector, root) {
  if (!selector || !root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(selector));
}
