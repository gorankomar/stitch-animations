import '../animations/orbit/styles.css';
import { init as initOrbit } from '../animations/orbit/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initOrbit(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
