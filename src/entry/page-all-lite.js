import { byData } from '../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../lib/config.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';

const resolvers = [
  {
    selector: byData(ATTR.anim, DATA_ATTRS.hero),
    load: async () => {
      const module = await import('../animations/hero/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.api),
    load: async () => {
      const module = await import('../animations/api/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.chart),
    load: async () => {
      const module = await import('../animations/chart/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.dots),
    load: async () => {
      const module = await import('../animations/dots/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.dotsBulge),
    load: async () => {
      const module = await import('../animations/dots-bulge/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.orbit),
    load: async () => {
      const module = await import('../animations/orbit/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.radial),
    load: async () => {
      const module = await import('../animations/radial/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.cards),
    load: async () => {
      const module = await import('../animations/cards/index.js');
      module.init(document);
    }
  }
];

document.addEventListener('DOMContentLoaded', async () => {
  initAutoReveals(document);
  await Promise.all(
    resolvers.map(async ({ selector, load }) => {
      if (document.querySelector(selector)) {
        await load();
      }
    })
  );
});
