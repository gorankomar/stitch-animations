import './styles.css';
import { createRepelFloat } from '../../lib/effects/repel-float.js';
import { NS, setPath, pathLength, paintPulse, fillDot, roundedPath } from '../../lib/effects/connector.js';
import { animateStage, stageInitializer } from '../../lib/effects/animation-stage.js';
let connectorId = 0;

function setup(stage) {
  const bubbles = ['from', 'to'].map(name => stage.querySelector(`[data-webhook-${name}]`));
  if (bubbles.some(node => !node)) return () => {};
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('stitch-connector', 'webhook-connector');
  svg.setAttribute('aria-hidden', 'true');
  const id = `webhook-dot-${++connectorId}`;
  svg.innerHTML = `<defs><clipPath id="${id}"><circle r="4"/></clipPath></defs>
    <path class="webhook-connector__track"/><path class="webhook-connector__pulse"/>
    <g><circle r="4"/><rect class="webhook-connector__fill" x="-4" y="4" width="8" height="0" clip-path="url(#${id})"/></g>
    <g><circle r="4"/><rect class="webhook-connector__fill" x="-4" y="4" width="8" height="0" clip-path="url(#${id})"/></g>`;
  stage.prepend(svg);
  const [, track, pulse, start, end] = svg.children;
  const dotFills = [start.lastElementChild, end.lastElementChild];
  const clamp = value => Math.max(0, Math.min(1, value));
  let time = 0, reduced = false;
  const floating = createRepelFloat(stage, bubbles, () => ({ travel: 26, ease: 5 }));

  function draw() {
    const bounds = svg.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const width = stage.clientWidth, height = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const rects = bubbles.map(node => node.getBoundingClientRect());
    const x1 = (rects[0].left + rects[0].width / 2 - bounds.left) * width / bounds.width;
    const y1 = (rects[0].bottom - bounds.top) * height / bounds.height;
    const x2 = (rects[1].left + rects[1].width / 2 - bounds.left) * width / bounds.width;
    const y2 = (rects[1].top - bounds.top) * height / bounds.height;
    const mid = (y1 + y2) / 2;
    const d = roundedPath([{ x: x1, y: y1 }, { x: x1, y: mid }, { x: x2, y: mid }, { x: x2, y: y2 }], 24);
    setPath(track, d);
    setPath(pulse, d);
    start.setAttribute('transform', `translate(${x1} ${y1})`);
    end.setAttribute('transform', `translate(${x2} ${y2})`);
    const length = pathLength(track);
    if (!length) return;
    const cycle = time % 4.5;
    const span = length * 0.12;
    // Start above the source dot and finish after the tail clears the destination.
    const head = -4 + clamp(cycle / 2.2) * (length + 8 + span);
    const tail = head - span;
    const active = !reduced && cycle < 2.2;
    paintPulse(pulse, { head, span, length, active });
    fillDot(dotFills[0], active ? head : -4, active ? tail : -4, 0);
    fillDot(dotFills[1], active ? head : -4, active ? tail : -4, length);
  }

  const stop = animateStage(stage, { nodes: bubbles, update(state) {
    time = state.time; reduced = state.reduced;
    floating.update(time, state.dt, reduced); draw();
  } });
  return () => { stop(); floating.dispose(); svg.remove(); };
}

export const init = stageInitializer('[data-anim="webhook"] [data-webhook-stage]', setup);
