// Shared SVG primitives. Animation modules own their routing and choreography.
export const NS = 'http://www.w3.org/2000/svg';
export function make(tag, parent, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  parent?.append(node);
  return node;
}
const lengths = new WeakMap();
export function setPath(node, d) {
  if (node.getAttribute('d') !== d) { node.setAttribute('d', d); lengths.delete(node); }
}
export function pathLength(node) {
  if (!lengths.has(node)) lengths.set(node, node.getTotalLength());
  return lengths.get(node);
}
export function paintPulse(node, { head, span, length, offset = 0, active = true }) {
  node.style.strokeDasharray = `${span} ${length + span + 100}`;
  node.style.strokeDashoffset = `${span - head + offset}`;
  node.style.opacity = active ? '1' : '0';
}
export function fillDot(node, head, tail, center = 0, axis = 'y', direction = 1, active = true) {
  const lo = Math.max(-4, Math.min(4, tail - center));
  const hi = Math.max(-4, Math.min(4, head - center));
  node.setAttribute(axis, direction > 0 ? lo : -hi);
  node.setAttribute(axis === 'x' ? 'width' : 'height', active ? Math.max(0, hi - lo) : 0);
}
// Round a polyline's corners; handles either direction and collapsed segments.
export function roundedPath(points, radius = 18) {
  const p = points.filter((point, i) => !i || point.x !== points[i - 1].x || point.y !== points[i - 1].y);
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1], b = p[i], c = p[i + 1];
    const incoming = Math.hypot(b.x - a.x, b.y - a.y), outgoing = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(radius, incoming / 2, outgoing / 2);
    d += ` L ${b.x + (a.x - b.x) * r / incoming} ${b.y + (a.y - b.y) * r / incoming} Q ${b.x} ${b.y} ${b.x + (c.x - b.x) * r / outgoing} ${b.y + (c.y - b.y) * r / outgoing}`;
  }
  const end = p[p.length - 1];
  return `${d} L ${end.x} ${end.y}`;
}

export function createGradient(parent, id, color, stops = [[0, 0.18], [0.35, 1], [0.7, 1], [1, 0]]) {
  const gradient = make('linearGradient', parent, { id, gradientUnits: 'userSpaceOnUse' });
  stops.forEach(([offset, opacity]) => make('stop', gradient, { offset, 'stop-color': color, 'stop-opacity': opacity }));
  return gradient;
}
