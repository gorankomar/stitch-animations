// Reusable distance-weighted repulsion plus independent idle drift.
export function createRepelFloat(stage, nodes, config) {
  const original = nodes.map(node => node.style.translate);
  const offsets = nodes.map(() => ({ x: 0, y: 0, renderedX: 0, renderedY: 0 }));
  const root = stage.closest('[data-anim]') || stage;
  let cursor = null;
  function move(event) { if (event.pointerType !== 'touch') cursor = { x: event.clientX, y: event.clientY }; }
  function leave() { cursor = null; }
  root.addEventListener('pointermove', move); root.addEventListener('pointerleave', leave);
  return {
    update(time, dt, reduced) {
      const bounds = stage.getBoundingClientRect();
      const sx = bounds.width / stage.clientWidth || 1, sy = bounds.height / stage.clientHeight || 1;
      const reach = Math.max(1, Math.hypot(stage.clientWidth, stage.clientHeight) * 0.65);
      const centers = nodes.map((node, i) => {
        const r = node.getBoundingClientRect();
        return { x: (r.left + r.width / 2 - bounds.left) / sx - offsets[i].renderedX, y: (r.top + r.height / 2 - bounds.top) / sy - offsets[i].renderedY };
      });
      nodes.forEach((node, i) => {
        const o = offsets[i], c = config(i);
        const dx = cursor ? centers[i].x - (cursor.x - bounds.left) / sx : 0;
        const dy = cursor ? centers[i].y - (cursor.y - bounds.top) / sy : 0;
        const strength = c.travel / Math.max(reach, Math.hypot(dx, dy));
        const ease = 1 - Math.exp(-dt * c.ease);
        o.x += (dx * strength - o.x) * ease; o.y += (dy * strength - o.y) * ease;
        o.renderedX = reduced ? 0 : o.x + Math.sin(time * c.speedX + c.phaseX) * c.amplitudeX;
        o.renderedY = reduced ? 0 : o.y + Math.sin(time * c.speedY + c.phaseY) * c.amplitudeY;
        node.style.translate = reduced ? original[i] : `${o.renderedX}px ${o.renderedY}px`;
      });
    },
    dispose() {
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave);
      nodes.forEach((node, i) => { node.style.translate = original[i]; });
    }
  };
}
