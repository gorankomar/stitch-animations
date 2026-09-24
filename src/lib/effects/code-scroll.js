/** Shared line-by-line typing and continuous upward code scroll.
 * The illustration owns its clock, visibility and reduced-motion policy.
 * Rows must have equal, fixed heights; syntax markup is retained verbatim.
 */
const instances = new WeakMap();
export function createCodeScrollEffect(track, {
  typingSelector = null,
  linesPerSecond = 1.05,
  lineDelay = 145,
  characterDelay = 7,
  visibleLines = 15
} = {}) {
  if (instances.has(track)) return instances.get(track);
  const originals = [...track.children];
  if (!originals.length) return null;
  const initialTransform = track.style.transform;
  const clones = originals.map(row => {
    const clone = row.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    // Duplicated decorative content must never introduce duplicate DOM IDs.
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    track.append(clone);
    return clone;
  });
  const rows = [...originals, ...clones].map(row => {
    const target = typingSelector ? row.querySelector(typingSelector) : row;
    const nodes = [];
    if (target) {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push({node: walker.currentNode, text: walker.currentNode.textContent});
    }
    return {nodes, length: nodes.reduce((sum, part) => sum + part.text.length, 0)};
  });
  let lineHeight = 0;
  let disposed = false;
  // offsetHeight is unaffected by entrance transforms on ancestor elements.
  const measure = () => { lineHeight = parseFloat(getComputedStyle(originals[0]).height) || originals[0].offsetHeight; };
  const resize = new ResizeObserver(measure);
  resize.observe(track);
  measure();
  function render(elapsed) {
    if (disposed) return;
    const travel = Math.max(0, elapsed) / 1000 * linesPerSecond;
    const cycle = originals.length;
    track.style.transform = `translateY(${-((travel % cycle) * lineHeight)}px)`;
    rows.forEach((row, index) => {
      const absolute = Math.floor(travel / cycle) * cycle + index;
      const start = absolute < cycle ? index * lineDelay : (absolute - visibleLines) / linesPerSecond * 1000;
      let count = Math.max(0, Math.min(row.length, Math.floor((elapsed - start) / characterDelay)));
      for (const part of row.nodes) {
        const value = part.text.slice(0, count);
        if (part.node.textContent !== value) part.node.textContent = value;
        count = Math.max(0, count - part.text.length);
      }
    });
  }
  function showAll() {
    rows.forEach(row => row.nodes.forEach(part => { part.node.textContent = part.text; }));
    track.style.transform = initialTransform;
  }
  function dispose() {
    if (disposed) return;
    showAll();
    disposed = true;
    resize.disconnect();
    clones.forEach(node => node.remove());
    instances.delete(track);
  }
  const controller = {render, showAll, dispose};
  instances.set(track, controller);
  return controller;
}
