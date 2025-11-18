const hasWindow = typeof window !== 'undefined';

export function onEnter(el, options = {}, callback) {
  if (!el || !hasWindow || typeof IntersectionObserver !== 'function') {
    callback?.({ isIntersecting: true, ratio: 1 });
    return () => {};
  }

  const { threshold = 0.25, once = true, root = null } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        callback?.({ isIntersecting: true, ratio: entry.intersectionRatio, entry });
        if (once) observer.disconnect();
      });
    },
    { threshold, root }
  );
  observer.observe(el);
  return () => observer.disconnect();
}

export function observeResize(element, callback, options = {}) {
  if (!element || typeof callback !== 'function' || !hasWindow) {
    return () => {};
  }

  const { raf = true } = options;

  if (typeof ResizeObserver === 'function') {
    let rafId = null;
    const observer = new ResizeObserver(() => {
      if (!raf) {
        callback();
        return;
      }
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        callback();
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }

  const handler = () => callback();
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}
