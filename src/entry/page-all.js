import '../animations/hero/styles.css';
import '../animations/api/styles.css';
import '../animations/chart/styles.css';
import '../animations/dots/styles.css';
import '../animations/radial/styles.css';

import { init as initHero } from '../animations/hero/index.js';
import { init as initApi } from '../animations/api/index.js';
import { init as initChart } from '../animations/chart/index.js';
import { init as initDots } from '../animations/dots/index.js';
import { init as initRadial } from '../animations/radial/index.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  [initHero, initApi, initChart, initDots, initRadial].forEach((fn) => fn(document));
});
