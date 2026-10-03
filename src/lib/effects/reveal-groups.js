import { toMs } from '../time.js';
import { getPrimaryEase } from '../easing.js';

// Both reveal modes share direction/geometry. Hard preserves opacity and clears
// the entire clipping frame, rather than translating by the object's own width.
export function revealOffset({ mode = 'soft', direction = 'bottom-to-top', frame, element, offset = 24, bleed = 0 }) {
  const distances = mode === 'hard' ? {
    'right-to-left': [frame.right - element.left + bleed, 0],
    'left-to-right': [frame.left - element.right - bleed, 0],
    'top-to-bottom': [0, frame.top - element.bottom - bleed],
    'bottom-to-top': [0, frame.bottom - element.top + bleed]
  } : {
    'right-to-left': [offset, 0], 'left-to-right': [-offset, 0],
    'top-to-bottom': [0, -offset], 'bottom-to-top': [0, offset]
  };
  if (!distances[direction]) throw new Error(`Unknown Reveal direction: ${direction}`);
  return distances[direction];
}

// An externally clocked track lets stages pause entrances offscreen/hidden.
// Layout, reveal and pointer follow must each own a separate wrapper.
export function createRevealTrack(element, { frame = element.parentElement, mode = element.dataset.revealMode || 'soft', direction = element.dataset.revealDirection || 'bottom-to-top', offset = 24, bleed = 0 } = {}) {
  const saved = { transform: element.style.transform, opacity: element.style.opacity };
  let displacement = [0, 0];
  const measure = () => {
    const current = element.style.transform;
    element.style.transform = saved.transform;
    displacement = revealOffset({ mode, direction, frame: frame.getBoundingClientRect(), element: element.getBoundingClientRect(), offset, bleed });
    element.style.transform = current;
  };
  measure();
  return {
    measure,
    render(progress, ease = value => value, opacityProgress = progress) {
      const p = Math.max(0, Math.min(1, progress));
      const remaining = 1 - ease(p);
      element.style.transform = p === 1 ? saved.transform : `${saved.transform === 'none' ? '' : saved.transform} translate3d(${displacement[0] * remaining}px,${displacement[1] * remaining}px,0)`;
      if (mode === 'soft') element.style.opacity = p === 1 ? saved.opacity : String(Math.max(0, Math.min(1, opacityProgress)));
    },
    keyframes() { return [{ transform: `${saved.transform === 'none' ? '' : saved.transform} translate3d(${displacement[0]}px,${displacement[1]}px,0)` }, { transform: saved.transform || 'none' }]; },
    dispose() { element.style.transform = saved.transform; element.style.opacity = saved.opacity; }
  };
}

// Hard entrances overlap by default; explicit target/group stagger wins.
export const HARD_REVEAL_STAGGER_MS = 340;
export function resolveRevealStagger(mode, override, softDefault = 200) {
  // Controller timings are already milliseconds; attribute strings retain
  // toMs's seconds/ms parsing. Re-parsing 200 as seconds stalls row reveals.
  if (typeof override === 'number' && Number.isFinite(override)) return override;
  return toMs(override, mode === 'hard' ? HARD_REVEAL_STAGGER_MS : softDefault);
}

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
  const hardAnimations = [];
  let hasStarted = false;
  let finishAt = 0;
  let lastDuration = 0;

  const scheduleReveal = (el, delay) => {
    const appliedDelay = Math.max(0, delay);
    if ((readRevealAttr(el, 'revealMode') || options.mode) === 'hard') {
      const track = createRevealTrack(el, {
        mode: 'hard',
        frame: el.closest('[data-reveal-frame]') || root,
        direction: readRevealAttr(el, 'revealDirection') || options.direction || 'bottom-to-top'
      });
      const animation = el.animate(track.keyframes(), { duration: toMs(readRevealAttr(el, 'revealDuration'), timings.duration), delay: appliedDelay, easing: getPrimaryEase(), fill: 'both' });
      hardAnimations.push({ animation, track });
      return animation;
    }
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
        const mode = readRevealAttr(node.el, 'revealMode') || options.mode || 'soft';
        const elementStagger = resolveRevealStagger(mode, node.stagger ?? options.timings?.stagger, group.stagger);
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
      try { lastDuration = startGroup(rootGroup, 0); }
      catch (error) { cancel(); throw error; }
      finishAt = performance.now() + lastDuration;
      return lastDuration;
    }
    return Math.max(0, finishAt - performance.now());
  };

  const cancel = () => {
    hardAnimations.splice(0).forEach(({ animation, track }) => { animation.cancel(); track.dispose(); });
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
        walker(child, bucket);
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
  const direction = readRevealAttr(el, 'revealDirection');
  if (direction && readRevealAttr(el, 'revealMode') !== 'hard') {
    const distance = 'var(--reveal-offset, var(--reveal-offset-default))';
    const transforms = {
      'right-to-left': `translate3d(${distance},0,0)`,
      'left-to-right': `translate3d(calc(-1 * ${distance}),0,0)`,
      'top-to-bottom': `translate3d(0,calc(-1 * ${distance}),0)`,
      'bottom-to-top': `translate3d(0,${distance},0)`
    };
    if (!transforms[direction]) throw new Error(`Unknown Reveal direction: ${direction}`);
    el.style.setProperty('--reveal-transform', transforms[direction]);
  }

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
