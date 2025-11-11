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
