// One visibility-aware clock per stage, with resize and reduced-motion handling.
export function animateStage(stage, { nodes = [], threshold = 0, start = () => {}, update }) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, previous = 0, time = 0, visible = false, started = false, dirty = true, disposed = false;
  function tick(now) {
    if (disposed) return;
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now; time += dt;
    update({ time, dt, reduced: motion.matches, dirty }); dirty = false;
    if (!disposed && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (disposed) return;
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function invalidate() { dirty = true; resume(); }
  let observer, resize;
  try {
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
      if (visible && !started) { started = true; start(); }
      resume();
    }, { threshold });
    observer.observe(stage);
    resize = new ResizeObserver(invalidate);
    [stage, ...nodes].forEach(node => resize.observe(node));
    motion.addEventListener('change', invalidate); document.addEventListener('visibilitychange', resume);
  } catch (error) {
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect(); resize?.disconnect();
    motion.removeEventListener('change', invalidate); document.removeEventListener('visibilitychange', resume);
    throw error;
  }
  return () => {
    disposed = true;
    cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
    motion.removeEventListener('change', invalidate); document.removeEventListener('visibilitychange', resume);
  };
}
export function stageInitializer(selector, setup) {
  const mounted = new WeakMap();
  return (root = document) => {
    const stages = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) stages.unshift(root);
    const cleanups = stages.map(stage => {
      if (!mounted.has(stage)) {
        const dispose = setup(stage);
        let disposed = false;
        mounted.set(stage, () => { if (disposed) return; disposed = true; dispose?.(); mounted.delete(stage); });
      }
      return mounted.get(stage);
    });
    return () => cleanups.forEach(cleanup => cleanup());
  };
}
