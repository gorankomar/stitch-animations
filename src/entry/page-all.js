import '../embeds/worldwide-markets.js';
import '../embeds/dynamic-transaction-switching.js';
import '../embeds/new-schemes.js';
import '../embeds/issuer-routing.js';
import '../embeds/fallback-retry.js';
import '../embeds/top-ups.js';
import '../embeds/peer-to-peer-transfers.js';
import '../embeds/digital-wallet.js';
import '../embeds/3ds-enabled-security.js';
import '../embeds/dynamic-funding.js';
import '../embeds/instant-virtual-cards.js';
import '../embeds/income-verification.js';
import '../embeds/email-statement.js';
import '../embeds/real-time-approvals.js';
import '../embeds/buy-now-pay-later.js';
import '../embeds/credit-check.js';
import '../embeds/user-onboarding.js';
import '../embeds/rules-flow.js';
import '../embeds/consumer-verification.js';
import '../embeds/omnichannel-origination.js';
import '../embeds/country-flags.js';
import '../embeds/product-variety.js';
import '../embeds/card-controls.js';
import '../embeds/secure-auth.js';
import '../embeds/create-card.js';
import '../embeds/due-date-graphic.js';
import '../embeds/financial-graphic.js';
import { init as initCollections } from '../animations/collections/index.js';
import '../animations/access/styles.css';
import { init as initAccess } from '../animations/access/index.js';
import '../animations/reference/styles.css';
import { init as initReference } from '../animations/reference/index.js';
import '../animations/webhook/styles.css';
import { init as initWebhook } from '../animations/webhook/index.js';
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
import { initZoomLenses } from '../lib/effects/zoom-lens.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  initAutoReveals(document);
  initZoomLenses(document);
  [
    initCollections,
    initAccess,
    initReference,
    initWebhook,
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

import '../embeds/revolving-credit.js';
