import { init as initWindowGraphic } from '../animations/window-graphic/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initWindowGraphic(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
