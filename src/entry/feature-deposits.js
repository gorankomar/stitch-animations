import '../animations/deposits/styles.css';
import { init as initDeposits } from '../animations/deposits/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initDeposits(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
