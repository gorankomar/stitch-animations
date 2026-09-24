import { createValueCounter } from '../lib/effects/value-counter.js';

const initialized = window.__stitchBalanceGraphics ||= new WeakSet();
function boot() {
  document.querySelectorAll('[data-balance-graphic]').forEach(root => {
    if (initialized.has(root)) return;
    initialized.add(root);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = [...root.querySelectorAll('[data-balance-account]')];
    const counters = cards.map(card => [...card.querySelectorAll('[data-balance-number]')].map(element => {
      const target = Number(card.dataset[element.dataset.balanceNumber]) || 0;
      const counter = createValueCounter({element, initialValue:reduced ? target : 0, duration:180, decimals:2, prefix:'', suffix:'', snapEpsilon:.005});
      return {counter,target};
    }));
    root.setAttribute('aria-label', cards.map(card => `${card.querySelector('.balance-account_name').textContent}: $${Number(card.dataset.balance).toFixed(2)}`).join('; '));
    if (reduced) return;
    root.classList.add('is-balance-ready');
    let started = false;
    function enter() {
      root.classList.add('is-balance-in-view');
      if (started) return;
      started = true;
      root.classList.add('is-balance-visible');
      counters.forEach((group,index) => setTimeout(() => group.forEach(({counter,target}) => counter.setTarget(target)), 200 + index * 450));
    }
    if (!('IntersectionObserver' in window)) {enter();return;}
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= .25) enter();
        else root.classList.remove('is-balance-in-view');
      });
    }, {threshold:[0,.25]});
    observer.observe(root);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
