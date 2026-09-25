import './styles.css';
import { NS, make, createGradient, setPath, pathLength, paintPulse, fillDot, roundedPath } from '../../lib/effects/connector.js';
import { animateStage, stageInitializer } from '../../lib/effects/animation-stage.js';
let nextId = 0;

function setup(stage) {
  const center = stage.querySelector('[data-reference-center]');
  const cards = ['left-top', 'left-bottom', 'right-top', 'right-bottom'].map(key => stage.querySelector(`[data-reference-card="${key}"]`));
  if (!center || cards.some(card => !card)) return () => {};
  const nodes = [center, ...cards];
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('stitch-connector', 'reference-connector');
  svg.setAttribute('aria-hidden', 'true');
  const id = `reference-${++nextId}`;
  svg.innerHTML = `<defs><clipPath id="${id}-dot"><circle r="4"/></clipPath></defs>`;
  const defs = svg.firstElementChild;
  const sides = [-1, 1].map((direction, side) => {
    const gradient = createGradient(defs, `${id}-${side}`, 'var(--reference-line-color, #d2d2d2)');
    const pulseGradient = createGradient(defs, `${id}-${side}-pulse`, 'var(--reference-pulse-color, var(--_primitives---colors--primary-blue, #3342ff))');
    const paths = Array.from({ length: 3 }, () => ({
      track: make('path', svg, { class: 'reference-connector__track', stroke: `url(#${id}-${side})` }),
      pulse: make('path', svg, { class: 'reference-connector__pulse', stroke: `url(#${id}-${side}-pulse)` })
    }));
    const dot = make('g', svg);
    make('circle', dot, { r: 4 });
    const fill = make('rect', dot, { class: 'reference-connector__fill', x: -4, y: -4, width: 0, height: 8, 'clip-path': `url(#${id}-dot)` });
    return { direction, gradient, pulseGradient, paths, dot, fill };
  });
  stage.prepend(svg);
  let time = 0, reduced = false;

  function draw() {
    const bounds = svg.getBoundingClientRect();
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const rects = nodes.map(node => {
      const r = node.getBoundingClientRect();
      return { left: (r.left - bounds.left) * width / bounds.width, right: (r.right - bounds.left) * width / bounds.width, y: (r.top + r.height / 2 - bounds.top) * height / bounds.height };
    });
    sides.forEach(({ direction: dir, gradient, pulseGradient, paths, dot, fill }, side) => {
      const source = { x: dir < 0 ? rects[0].left : rects[0].right, y: rects[0].y };
      const targets = rects.slice(1 + side * 2, 3 + side * 2).map(r => ({ x: dir < 0 ? r.right : r.left, y: r.y }));
      const outerX = (targets[0].x + targets[1].x) / 2;
      const junction = (source.x + outerX) / 2;
      [gradient, pulseGradient].forEach(paint => {
        paint.setAttribute('x1', source.x); paint.setAttribute('x2', outerX);
        paint.setAttribute('y1', source.y); paint.setAttribute('y2', source.y);
      });
      const geometry = [`M ${source.x} ${source.y} H ${junction}`, ...targets.map(target => {
        return roundedPath([{ x: junction, y: source.y }, { x: junction, y: target.y }, target], 18);
      })];
      geometry.forEach((d, i) => { setPath(paths[i].track, d); setPath(paths[i].pulse, d); });
      const lengths = paths.map(path => pathLength(path.track));
      const trunk = lengths[0];
      const branch = Math.max(...lengths.slice(1));
      const span = 34;
      const cycle = time % 4.8;
      // Both trunks reach their junction at 0.6s, then both forks split together.
      const head = cycle < 0.6 ? -4 + cycle / 0.6 * (trunk + 4) : trunk + (cycle - 0.6) / 1.5 * (branch + span);
      const tail = head - span;
      paths.forEach(({ pulse }, i) => {
        paintPulse(pulse, { head, span, length: trunk + branch, offset: i ? trunk : 0, active: !reduced && cycle < 2.1 });
      });
      dot.setAttribute('transform', `translate(${source.x} ${source.y})`);
      fillDot(fill, head, tail, 0, 'x', dir, !reduced);
    });
  }

  const stop = animateStage(stage, { nodes: nodes, update(state) {
    time = state.time; reduced = state.reduced;
    draw();
  } });
  return () => { stop(); svg.remove(); };
}

export const init = stageInitializer('[data-anim="reference"] [data-reference-stage]', setup);
