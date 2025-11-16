import '../animations/dots/styles.css';
import { init as initDotsBulge } from '../animations/dots-bulge/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initDotsBulge(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
