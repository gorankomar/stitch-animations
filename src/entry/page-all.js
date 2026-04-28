import '../animations/hero/styles.css';
import '../animations/api/styles.css';
import '../animations/chart/styles.css';
import '../animations/dots/styles.css';
import '../animations/orbit/styles.css';
import '../animations/radial/styles.css';
import '../animations/cards/styles.css';
import '../animations/deposits/styles.css';

import { init as initHero } from '../animations/hero/index.js';
import { init as initApi } from '../animations/api/index.js';
import { init as initChart } from '../animations/chart/index.js';
import { init as initDots } from '../animations/dots/index.js';
import { init as initDotsBulge } from '../animations/dots-bulge/index.js';
import { init as initOrbit } from '../animations/orbit/index.js';
import { init as initRadial } from '../animations/radial/index.js';
import { init as initCards } from '../animations/cards/index.js';
import { init as initDeposits } from '../animations/deposits/index.js';
import { init as initSmallCards } from '../animations/small-cards/index.js';
import { init as initWindowGraphic } from '../animations/window-graphic/index.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  initAutoReveals(document);
  [
    initHero,
    initApi,
    initChart,
    initDots,
    initDotsBulge,
    initOrbit,
    initRadial,
    initCards,
    initDeposits,
    initSmallCards,
    initWindowGraphic
  ].forEach((fn) => fn(document));
});
