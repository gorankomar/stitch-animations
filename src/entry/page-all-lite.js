import { byData } from '../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../lib/config.js';

const resolvers = [
  {
    selector: byData(ATTR.anim, DATA_ATTRS.hero),
    load: async () => {
      await import('../animations/hero/styles.css');
      const module = await import('../animations/hero/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.api),
    load: async () => {
      await import('../animations/api/styles.css');
      const module = await import('../animations/api/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.chart),
    load: async () => {
      await import('../animations/chart/styles.css');
      const module = await import('../animations/chart/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.dots),
    load: async () => {
      await import('../animations/dots/styles.css');
      const module = await import('../animations/dots/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.radial),
    load: async () => {
      await import('../animations/radial/styles.css');
      const module = await import('../animations/radial/index.js');
      module.init(document);
    }
  }
];

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all(
    resolvers.map(async ({ selector, load }) => {
      if (document.querySelector(selector)) {
        await load();
      }
    })
  );
});
