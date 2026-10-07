import { byData } from '../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../lib/config.js';
import { initAutoReveals } from '../lib/effects/auto-reveal.js';
import { initZoomLenses } from '../lib/effects/zoom-lens.js';

const resolvers = [
  {selector: '[data-top-ups]', load: () => import('../embeds/top-ups.js')},
  {selector: '[data-peer-to-peer-transfers]', load: () => import('../embeds/peer-to-peer-transfers.js')},
  {selector: '[data-digital-wallet]', load: () => import('../embeds/digital-wallet.js')},
  {selector: '[data-rules-flow]', load: () => import('../embeds/rules-flow.js')},
  {selector: '[data-3ds-enabled-security]', load: () => import('../embeds/3ds-enabled-security.js')},
  {selector: '[data-dynamic-funding]', load: () => import('../embeds/dynamic-funding.js')},
  {selector: '[data-instant-virtual-cards]', load: () => import('../embeds/instant-virtual-cards.js')},
  {selector: '[data-income-verification]', load: () => import('../embeds/income-verification.js')},
  {selector: '[data-email-statement]', load: () => import('../embeds/email-statement.js')},
  {selector: '[data-revolving-credit]', load: () => import('../embeds/revolving-credit.js')},
  {selector: '[data-real-time-approvals]', load: () => import('../embeds/real-time-approvals.js')},
  {selector: '[data-buy-now-pay-later]', load: () => import('../embeds/buy-now-pay-later.js')},
  {selector: '[data-credit-check]', load: () => import('../embeds/credit-check.js')},
  {selector: '[data-user-onboarding]', load: () => import('../embeds/user-onboarding.js')},
  {selector: '[data-consumer-verification], [data-consumer-verification-fluid]', load: () => import('../embeds/consumer-verification.js')},
  {selector: '[data-omnichannel-origination]', load: () => import('../embeds/omnichannel-origination.js')},
  {selector: '[data-country-flags]', load: () => import('../embeds/country-flags.js')},
  {selector: '[data-product-variety]', load: () => import('../embeds/product-variety.js')},
  {selector: '[data-card-controls]', load: () => import('../embeds/card-controls.js')},
  {selector: '[data-secure-auth]', load: () => import('../embeds/secure-auth.js')},
  {selector: '[data-create-card]', load: () => import('../embeds/create-card.js')},
  {selector: '[data-due-graphic]', load: () => import('../embeds/due-date-graphic.js')},
  {selector: '[data-financial-graphic]', load: () => import('../embeds/financial-graphic.js')},
  {
    selector: '[data-anim="collections"]',
    load: async () => {
      const module = await import('../animations/collections/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.access),
    load: async () => {
      const module = await import('../animations/access/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.reference),
    load: async () => {
      const module = await import('../animations/reference/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.webhook),
    load: async () => {
      const module = await import('../animations/webhook/index.js');
      module.init(document);
    }
  },
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
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.deposits),
    load: async () => {
      const module = await import('../animations/deposits/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.smallCards),
    load: async () => {
      const module = await import('../animations/small-cards/index.js');
      module.init(document);
    }
  },
  {
    selector: byData(ATTR.anim, DATA_ATTRS.windowGraphic),
    load: async () => {
      const module = await import('../animations/window-graphic/index.js');
      module.init(document);
    }
  }
];

async function boot() {
  initAutoReveals(document);
  initZoomLenses(document);
  await Promise.all(
    resolvers.map(async ({ selector, load }) => {
      if (document.querySelector(selector)) {
        await load();
      }
    })
  );
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
else boot();
