import '../animations/chart/styles.css';
import { init as initChart } from '../animations/chart/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function boot() {
  initAutoReveals(document);
  initChart(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
