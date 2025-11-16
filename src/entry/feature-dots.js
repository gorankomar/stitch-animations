import '../animations/dots/styles.css';
import { init as initDots } from '../animations/dots/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initDots(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
