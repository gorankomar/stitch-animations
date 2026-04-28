import { init as initSmallCards } from '../animations/small-cards/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initSmallCards(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
