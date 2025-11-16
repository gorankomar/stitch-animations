import '../animations/radial/styles.css';
import { init as initRadial } from '../animations/radial/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initRadial(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
