import { createRevealController } from '../lib/effects/reveal-groups.js';
import { createValueCounter, parseCounterTextTemplate } from '../lib/effects/value-counter.js';
import { createFollowGroup } from '../lib/effects/follow-group.js';
import { whenVisible } from '../lib/effects/threshold.js';

const initialized = window.__stitchPaymentWallets ||= new WeakSet();
export function init(scope = document) {
  scope.querySelectorAll('[data-payment-wallet]').forEach(root => {
    if (initialized.has(root) || document.documentElement.classList.contains('wf-design-mode')) return;
    initialized.add(root);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const numbers = [...root.querySelectorAll('[data-pw-counter]')].map(element => {
      const target = parseCounterTextTemplate(element)?.value ?? 0;
      return {element, target, counter:createValueCounter({element, initialValue:0, decimals:2, prefix:'$', duration:150, snapEpsilon:.005})};
    });
    root.classList.add('is-pw-ready');
    const reveal = createRevealController({root, selector:'[data-pw-reveal]', className:'is-pw-revealed', timings:{duration:700, stagger:0, opacityRatio:.7}});
    whenVisible(root, () => {
      reveal.ensure();
      numbers.forEach(({element,target,counter}) => {
        setTimeout(() => counter.setTarget(target), parseFloat(element.dataset.revealDelay) || 0);
      });
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) createFollowGroup({root});
    }, {threshold:.25});
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), {once:true});
else init();
