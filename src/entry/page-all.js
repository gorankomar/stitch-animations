import '../animations/hero/styles.css';
import { init as initHero } from '../animations/hero/index.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  initHero(document);
});
