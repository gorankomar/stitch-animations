// Individual card response: the hovered card rests while distant cards move away.
export function createRepelFloat(stage, nodes, config) {
  const original = nodes.map(node => node.style.translate);
  const offsets = nodes.map(() => ({ x: 0, y: 0, renderedX: 0, renderedY: 0 }));
  const root = stage.closest('[data-anim]') || stage;
  let cursor = null;
  function move(event) { if (event.pointerType !== 'touch') cursor = { x: event.clientX, y: event.clientY }; }
  function leave() { cursor = null; }
  root.addEventListener('pointermove', move); root.addEventListener('pointerleave', leave);
  root.addEventListener('pointercancel', leave);
  return {
    update(time, dt, reduced) {
      const bounds = stage.getBoundingClientRect();
      const sx = bounds.width / stage.clientWidth || 1, sy = bounds.height / stage.clientHeight || 1;
      const reach = Math.max(1, Math.hypot(stage.clientWidth, stage.clientHeight) * 0.55);
      const centers = nodes.map((node, i) => {
        const r = node.getBoundingClientRect();
        return { x: (r.left + r.width / 2 - bounds.left) / sx - offsets[i].renderedX, y: (r.top + r.height / 2 - bounds.top) / sy - offsets[i].renderedY, halfWidth: r.width / sx / 2, halfHeight: r.height / sy / 2 };
      });
      nodes.forEach((node, i) => {
        const o = offsets[i], c = config(i);
        const dx = cursor ? centers[i].x - (cursor.x - bounds.left) / sx : 0;
        const dy = cursor ? centers[i].y - (cursor.y - bounds.top) / sy : 0;
        // Measure from the resting card's edges, so its entire hover area is calm.
        // Subtracting the rendered offset above prevents movement feeding back into distance.
        const distance = Math.hypot(Math.max(0, Math.abs(dx) - centers[i].halfWidth), Math.max(0, Math.abs(dy) - centers[i].halfHeight));
        const proximity = Math.min(1, distance / reach);
        const weight = proximity * proximity * (3 - 1 * proximity);
        const directionLength = Math.hypot(dx, dy) || 1;
        const travel = c.travel * Math.min(1, stage.clientWidth / 600);
        const targetX = cursor ? dx / directionLength * travel * weight : 0;
        const targetY = cursor ? dy / directionLength * travel * weight : 0;
        const ease = 1 - Math.exp(-Math.max(0, dt) * c.ease);
        if (reduced) { o.x = 0; o.y = 0; }
        else {
          o.x += (targetX - o.x) * ease;
          o.y += (targetY - o.y) * ease;
        }
        o.renderedX = o.x;
        o.renderedY = o.y;
        node.style.translate = reduced ? original[i] : `${o.renderedX}px ${o.renderedY}px`;
      });
    },
    dispose() {
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave);
      root.removeEventListener('pointercancel', leave);
      nodes.forEach((node, i) => { node.style.translate = original[i]; });
    }
  };
}
