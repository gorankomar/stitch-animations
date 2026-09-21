import './styles.css';
import { NS, setPath, pathLength, paintPulse, roundedPath } from '../../lib/effects/connector.js';
import { animateStage, stageInitializer } from '../../lib/effects/animation-stage.js';

function setup(stage) {
  const rows = [...stage.querySelectorAll('[data-access-row]')];
  let reduced = false;
  const controllers = rows.map((row, index) => {
    const label = row.querySelector('[data-access-label]');
    const options = [...row.querySelectorAll('[data-access-option]')];
    const selected = options.findIndex(option => option.dataset.accessOption === row.dataset.accessRow);
    if (!label || selected < 0) return null;
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('stitch-connector', 'access-connector'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = options.map(() => '<path class="access-connector__track"/><path class="access-connector__arrow"/>').join('') + '<path class="access-connector__pulse"/>';
    row.prepend(svg);
    const pulse = svg.lastElementChild;
    const overlay = document.createElementNS(NS, 'svg');
    overlay.classList.add('stitch-connector', 'access-connector', 'access-connector--overlay');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.append(pulse, pulse.cloneNode());
    row.append(overlay);
    const pulses = [...overlay.children];
    const logo = row.querySelector('[data-access-logo]');
    const avatarGroup = row.querySelector('[data-access-avatars]');
    const avatars = avatarGroup ? [...avatarGroup.children] : [];
    const pieces = [...row.querySelectorAll('[data-access-reveal]')].flatMap(node => node === avatarGroup ? avatars : [node]);
    avatars.forEach((node, i) => {
      node.setAttribute('data-access-reveal', '');
      node.style.setProperty('--access-enter-x', `${24 + i * 22}px`);
    });
    avatarGroup?.removeAttribute('data-access-reveal');
    pieces.forEach((node, step) => node.style.setProperty('--access-delay', `${index * 0.18 + step * 0.15}s`));
    return { row, label, options, selected, svg, overlay, pulses, logo, pieces, avatars, avatarGroup, index, length: 0 };
  }).filter(Boolean);
  let time = 0;
  const introDuration = 0.6 + Math.max(0, ...controllers.map(c => c.index * 0.18 + (c.pieces.length - 1) * 0.15));

  function draw() {
    controllers.forEach(c => {
      const bounds = c.svg.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const width = c.row.clientWidth, height = c.row.clientHeight;
      c.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      c.overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
      const point = (rect, edge) => ({ x: (rect[edge] - bounds.left) * width / bounds.width, y: (rect.top + rect.height / 2 - bounds.top) * height / bounds.height });
      const source = point(c.label.getBoundingClientRect(), 'right');
      c.options.forEach((option, i) => {
        const target = point(option.querySelector('[data-access-status]').getBoundingClientRect(), 'left');
        target.x -= 6;
        const junction = target.x - Math.min(42, width * 0.07);
        const d = roundedPath([source, { x: junction, y: source.y }, { x: junction, y: target.y }, target], 12);
        setPath(c.svg.children[i * 2], d);
        c.svg.children[i * 2 + 1].setAttribute('d', `M ${target.x - 5} ${target.y - 5} L ${target.x} ${target.y} L ${target.x - 5} ${target.y + 5}`);
        if (i === c.selected) {
          c.pulses.forEach((pulse, side) => {
            let route = d;
            if (c.logo) {
              const rect = c.logo.getBoundingClientRect();
              const left = point(rect, 'left'), right = point(rect, 'right');
              // Follow the middle of the existing 2px logo border.
              left.x += 1; right.x -= 1;
              const rx = (right.x - left.x) / 2;
              const ry = rect.height * height / bounds.height / 2 - 1;
              const onward = roundedPath([{ x: right.x, y: source.y }, { x: junction, y: source.y }, { x: junction, y: target.y }, target], 12).replace(/^M [^ ]+ [^ ]+/, '');
              route = `M ${source.x} ${source.y} L ${left.x} ${left.y} A ${rx} ${ry} 0 0 ${side} ${right.x} ${right.y} L ${right.x} ${source.y} ${onward}`;
            }
            setPath(pulse, route);
          });
          c.length = pathLength(c.pulses[0]);
        }
      });
    });
  }

  function paint() {
    const cycle = Math.max(0, time - introDuration) % 5.5;
    controllers.forEach(c => {
      const local = cycle - c.index * 0.5;
      const head = local / 2.1 * c.length;
      const span = 44;
      c.pulses.forEach(pulse => {
        paintPulse(pulse, { head, span, length: c.length, active: !reduced && time >= introDuration && local >= 0 && head < c.length + span });
      });
      c.options.forEach((option, i) => {
        const granted = i === c.selected && (reduced || (time >= introDuration && local >= 2.1));
        option.classList.toggle('is-granted', granted);
        option.querySelector('[data-access-status]').setAttribute('aria-label', granted ? 'Allowed' : 'Not allowed');
      });
    });
  }
  stage.classList.add('access-is-pending');
  const stop = animateStage(stage, {
    nodes: controllers.flatMap(c => [c.row, c.label, ...c.options, ...(c.logo ? [c.logo] : [])]),
    threshold: 0.15,
    start() { stage.classList.add('access-is-ready'); },
    update(state) {
      time = state.time; reduced = state.reduced;
      // Access geometry is static once its entrance finishes.
      if (state.dirty || time <= introDuration + 0.1) draw();
      paint();
    }
  });
  return () => {
    stop();
    stage.classList.remove('access-is-pending', 'access-is-ready');
    controllers.forEach(c => { c.svg.remove(); c.overlay.remove(); c.avatars.forEach(node => { node.removeAttribute('data-access-reveal'); node.style.removeProperty('--access-enter-x'); }); c.avatarGroup?.setAttribute('data-access-reveal', ''); c.pieces.forEach(node => node.style.removeProperty('--access-delay')); c.options.forEach(option => { option.classList.remove('is-granted'); option.querySelector('[data-access-status]').setAttribute('aria-label', 'Not allowed'); }); });
  };
}
export const init = stageInitializer('[data-anim="access"] [data-access-stage]', setup);
