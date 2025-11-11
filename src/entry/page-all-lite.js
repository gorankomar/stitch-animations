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
