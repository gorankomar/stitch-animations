import { animateStage, stageInitializer } from '../lib/effects/animation-stage.js';

// Modulo repeats a complete nine-flag sequence including its trailing gap.
export function loopPosition(distance, phase, time, speed, direction) {
  if (!(distance > 0)) return 0;
  const position = phase + time * speed * direction;
  return ((position % distance) + distance) % distance - distance;
}

const controller = Symbol.for('stitch.countryFlags');
export const init = stageInitializer('[data-country-flags]', stage => {
  if (stage[controller]) return stage[controller];
  const rows = [...stage.querySelectorAll('[data-country-flags-row]')].map(row => {
    const track = row.querySelector('.country-flags_track');
    const sequence = track?.querySelector('.country-flags_sequence');
    if (!sequence) return null;
    const copies = [sequence.cloneNode(true), sequence.cloneNode(true)];
    copies.forEach(copy => {
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
      track.append(copy);
    });
    return { track, sequence, copies, distance: 0, phase: Number(row.dataset.phase || 0),
      direction: row.dataset.direction === 'right' ? 1 : -1 };
  }).filter(Boolean);
  const speed = Math.max(0, Number(stage.dataset.speed) || 12);
  function render(time, reduced, dirty) {
    rows.forEach(row => {
      if (dirty || !row.distance) row.distance = row.sequence.getBoundingClientRect().width;
      row.track.style.transform = `translate3d(${loopPosition(row.distance, row.phase, reduced ? 0 : time, speed, row.direction)}px,0,0)`;
    });
  }
  render(0, false, true);
  const dispose = animateStage(stage, { threshold: 0, nodes: rows.map(row => row.sequence),
    update: ({ time, reduced, dirty }) => render(time, reduced, dirty) });
  const cleanup = () => {
    if (!stage[controller]) return;
    dispose();
    rows.forEach(row => { row.copies.forEach(copy => copy.remove()); row.track.style.removeProperty('transform'); });
    delete stage[controller];
  };
  stage[controller] = cleanup;
  return cleanup;
});
if (typeof document !== 'undefined') {
  const boot = () => {
    init();
    // Webflow Preview renders components after evaluating page custom code.
    // Mount newly inserted stages as well as those present at DOMContentLoaded.
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === 1) init(node);
      }));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}
