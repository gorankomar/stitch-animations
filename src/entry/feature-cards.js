import '../animations/cards/styles.css';
import { init as initCards } from '../animations/cards/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initCards(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
