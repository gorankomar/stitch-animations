// Caller owns the clock and stacking context. Coordinates use the design frame.
export const clampProgress = value => Math.max(0, Math.min(1, value));
export function sampleCursor(points, time, ease = value => value) {
  const index = points.findIndex((point, i) => i < points.length - 1 && time < points[i + 1].time);
  const a = points[index < 0 ? points.length - 1 : index];
  const b = points[index < 0 ? points.length - 1 : index + 1];
  const progress = a === b ? 1 : ease(clampProgress((time - a.time) / (b.time - a.time)));
  return { x: a.x + (b.x - a.x) * progress, y: a.y + (b.y - a.y) * progress };
}
export function createDemoCursor(element, { designWidth, frame = element.parentElement } = {}) {
  const shape = element.firstElementChild;
  const saved = [element.style.cssText, shape?.style.cssText];
  return {
    render({ x, y, opacity = 1, pressed = false, behind = false }) {
      const scale = frame.getBoundingClientRect().width / designWidth;
      element.style.transform = `translate3d(${x * scale}px,${y * scale}px,0)`;
      element.style.opacity = opacity;
      element.style.zIndex = behind ? '1' : '4';
      if (shape) shape.style.transform = `scale(${pressed ? .86 : 1})`;
    },
    hide() { element.style.opacity = '0'; element.style.zIndex = '1'; },
    dispose() { element.style.cssText = saved[0]; if (shape) shape.style.cssText = saved[1]; }
  };
}
