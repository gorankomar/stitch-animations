import { init as initWindowGraphic } from '../animations/window-graphic/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';
import { initZoomLenses } from '../lib/effects/zoom-lens.js';

function boot() {
  initAutoReveals(document);
  initWindowGraphic(document);
  initZoomLenses(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
