import '../animations/hero/styles.css';
import { init as initHero } from '../animations/hero/index.js';

function boot() {
  initHero(document);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });
