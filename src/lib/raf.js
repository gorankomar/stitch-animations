const hasWindow = typeof window !== 'undefined';

export function createRafLoop(step) {
  let frame = null;

  const tick = (ts) => {
    step(ts);
    frame = hasWindow ? window.requestAnimationFrame(tick) : null;
  };

  const start = () => {
    if (!hasWindow || frame) return;
    frame = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!hasWindow || !frame) return;
    window.cancelAnimationFrame(frame);
    frame = null;
  };

  return { start, stop, isRunning: () => frame !== null };
}

export const nextFrame = () =>
  new Promise((resolve) => (hasWindow ? window.requestAnimationFrame(resolve) : resolve()));
