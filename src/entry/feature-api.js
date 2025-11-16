import '../animations/api/styles.css';
import { init as initApi } from '../animations/api/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initApi(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
