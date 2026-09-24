import './styles.css';

const EASE = 'cubic-bezier(.22,.75,.18,1)';

export function init(root = document) {
  const disposers = [...root.querySelectorAll('[data-collections-stage]')].map(setup);
  return () => disposers.forEach(dispose => dispose());
}

function setup(stage) {
  const cards = [...stage.querySelectorAll('[data-collection-card]')];
  if (!cards.length) return () => {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originals = cards.map(card => card.getAttribute('style'));
  let order = [...cards];
  let running = false;
  let disposed = false;
  let visible = false;
  let generation = 0;
  const active = new Set();
  const slot = index => {
    const depth = cards.length === 1 ? 0 : index / (cards.length - 1);
    return `translate(${-24 * depth}%, ${-28 * depth}%)`;
  };
  const layout = () => order.forEach((card, index) => {
    card.style.transform = slot(index);
    card.style.opacity = '1';
    card.style.zIndex = String(cards.length - index);
  });
  const sync = () => active.forEach(animation => {
    if (visible && !document.hidden) animation.play();
    else animation.pause();
  });
  async function animate(card, frames, duration, delay = 0) {
    const animation = card.animate(frames, { duration, delay, easing: EASE, fill: 'both' });
    active.add(animation);
    sync();
    try { await animation.finished; }
    finally { active.delete(animation); animation.cancel(); }
  }
  const hold = duration => animate(stage, [{ opacity: 1 }, { opacity: 1 }], duration);
  async function run() {
    if (running || disposed || motion.matches) return;
    running = true;
    const token = ++generation;
    try {
      cards.forEach(card => { card.style.opacity = '1'; });
      await Promise.all(order.map((card, index) => animate(card, [
        { transform: `${slot(index)} translateY(125%)`, opacity: 0 },
        { transform: slot(index), opacity: 1 }
      ], 900, (cards.length - index - 1) * 100)));
      await hold(1600);
      while (!disposed && token === generation && cards.length > 1) {
        const outgoing = order[0];
        const offscreen = 'translate(145%, 145%)';
        await Promise.all([
          animate(outgoing, [{ transform: slot(0) }, { transform: offscreen }], 850),
          ...order.slice(1).map((card, index) => animate(card, [
            { transform: slot(index + 1) }, { transform: slot(index) }
          ], 850))
        ]);
        order = [...order.slice(1), outgoing];
        layout();
        // Reinsert only once the outgoing window is completely outside the frame.
        await animate(outgoing, [
          { transform: `${slot(cards.length - 1)} translateY(18%)`, opacity: 0 },
          { transform: slot(cards.length - 1), opacity: 1 }
        ], 550);
        await hold(3500);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Collections animation:', error);
    } finally { if (token === generation) running = false; }
  }
  const reset = () => {
    generation++;
    active.forEach(animation => animation.cancel());
    active.clear();
    running = false;
    layout();
    if (!motion.matches) {
      cards.forEach(card => { card.style.opacity = '0'; });
      if (visible) run();
    }
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
    sync();
    if (visible) run();
  }, { threshold: [0, 0.25] });
  reset();
  observer.observe(stage);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', reset);
  return () => {
    disposed = true;
    generation++;
    observer.disconnect();
    active.forEach(animation => animation.cancel());
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', reset);
    cards.forEach((card, index) => {
      if (originals[index] === null) card.removeAttribute('style');
      else card.setAttribute('style', originals[index]);
    });
  };
}
