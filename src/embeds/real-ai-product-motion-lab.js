import { animateStage } from '../lib/effects/animation-stage.js';
import { getDefaultDurationMs, getPrimaryEase } from '../lib/easing.js';
import { renderCopilotShadow } from '../lib/effects/copilot-shadow.js';
import { twinGlowsShadow, singleTrailOutline } from '../lib/effects/product-working.js';

// Local comparison only. None of these studies are mounted by a shared entry.
let paused = false;
let iconsEnabled = true;
const play = document.querySelector('#lab-play');
const icons = document.querySelector('#lab-icons');
const controllers = [];
const defaultMs = getDefaultDurationMs();
const ease = getPrimaryEase();
const tau = Math.PI * 2;

function renderTwinGlows(t, set) {
  set('--lab-shadow', twinGlowsShadow(t));
}

function renderOutline(id, t, set) {
  if (id === 'O1') {
    set('--lab-outline', singleTrailOutline(t));
  return Math.max(0, t % 3.6 - 1.2) * 1000;
  } else if (id === 'O2') {
  const angle = t * 360 / 4.4;
  set('--lab-outline', `conic-gradient(from ${angle}deg, transparent 0deg, #ff7f6299 42deg, transparent 64deg, transparent 180deg, #ff7f6277 222deg, transparent 244deg, transparent 360deg)`);
  return (t % 2.2) / 2.2 * defaultMs;
  } else {
  const cycle = t % 3.8;
  const sweep = Math.min(360, cycle / 2.4 * 360);
  const alpha = cycle < 2.8 ? 1 : Math.max(0, 1 - (cycle - 2.8) / 1);
  set('--lab-outline', `conic-gradient(from -90deg, rgb(255 127 98 / .65) 0deg ${sweep}deg, transparent ${sweep}deg 360deg)`);
  set('--lab-alpha', alpha);
  return Math.min(defaultMs, cycle / 2.4 * defaultMs);
  }
}

for (const card of document.querySelectorAll('[data-lab-variant]')) {
  const id = card.dataset.labVariant;
  const wrap = card.querySelector('.lab-bar-wrap');
  const effect = card.querySelector('.lab-effect');
  const icon = card.querySelector('.lp-product-sparkle');
  const iconTurn = id === 'S3' ? .25 : id === 'O2' ? .5 : 1;
  const spin = icon.animate([{ transform: 'rotate(0turn)' }, { transform: `rotate(${iconTurn}turn)` }],
    { duration: defaultMs, easing: ease, fill: 'both' });
  spin.pause();
  spin.currentTime = 0;
  let elapsed = 0;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = (name, value) => effect.style.setProperty(name, value);

  function render() {
    const t = reduced ? 0 : elapsed;
    let iconTime;
    set('--lab-alpha', 1);
    if (id === 'S1') {
      // Reuse Copilot's exact orbit, at a compact radius and a slightly quicker clock.
      renderCopilotShadow(wrap, t * 1.35, .18);
      set('--lab-shadow', `var(--copilot-shadow-x) var(--copilot-shadow-y) 2.5cqi -.9cqi rgb(0 0 0 / .055), var(--copilot-glow-x) var(--copilot-glow-y) 2.9cqi -.8cqi rgb(234 106 18 / .22)`);
      iconTime = Math.max(0, t % 3.4 - 2.35) * 1000;
    } else if (id === 'S2') {
      renderTwinGlows(t, set);
      iconTime = (t % 2.8) / 2.8 * defaultMs;
    } else if (id === 'S3') {
      const phase = (t % 3.4) / 3.4;
      const pulse = 1 - Math.abs(phase * 2 - 1);
      set('--lab-shadow', `${Math.sin(t * tau / 5) * .35}cqi .4cqi 1.8cqi -.55cqi rgb(234 106 18 / .3), 0 .5cqi 1.6cqi -.6cqi rgb(0 0 0 / .05)`);
      set('--lab-alpha', .45 + pulse * .55);
      iconTime = Math.min(defaultMs, (t % 1.9) * 1000);
    } else if (id.startsWith('C')) {
      renderTwinGlows(t, set);
      const outline = card.querySelector('.lab-combo-outline');
      renderOutline('O' + id.slice(1), t, (name, value) => outline.style.setProperty(name, value));
      iconTime = (t % 2.8) / 2.8 * defaultMs;
    } else {
      iconTime = renderOutline(id, t, set);
    }
    spin.currentTime = reduced || !iconsEnabled ? 0 : Math.min(defaultMs, iconTime);
  }
  render();
  const stop = animateStage(card, {
    update({ dt, reduced: isReduced }) {
      reduced = isReduced;
      if (!paused && !reduced) elapsed += dt;
      render();
    }
  });
  controllers.push({ render, dispose() { stop(); spin.cancel(); } });
}

play.addEventListener('click', () => {
  paused = !paused;
  play.textContent = paused ? 'Resume motion' : 'Pause motion';
  play.setAttribute('aria-pressed', String(paused));
});
icons.addEventListener('change', () => {
  iconsEnabled = icons.checked;
  controllers.forEach(controller => controller.render());
});
window.addEventListener('pagehide', () => controllers.forEach(controller => controller.dispose()), { once: true });
