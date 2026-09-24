import { createCodeScrollEffect } from '../lib/effects/code-scroll.js';
import { getPrimaryEase } from '../lib/easing.js';

const initialized = window.__stitchFinancialGraphics ||= new WeakSet();

function init(root) {
  if (initialized.has(root)) return;
  initialized.add(root);
  const track = root.querySelector('[data-financial-json]');
  const typing = [...root.querySelectorAll('[data-financial-type]')];
  if (!track || !typing.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const codeScroll = createCodeScrollEffect(track);
  const labels = typing.map(node => ({node, text:node.textContent}));
  const labelLength = labels.reduce((sum, part) => sum + part.text.length, 0);

  const starts = [0, 550, 900, 1250, 1550, 1850, 2300, 3500];
  const animations = [...root.querySelectorAll('[data-financial-reveal]')].map((node,index) => {
    const animation = node.animate([
      {opacity:0, transform:`translateY(${index === 0 ? '28%' : '12%'})`},
      {opacity:1, transform:'translateY(0)'}
    ], {duration:index === 0 ? 770 : 550, easing:getPrimaryEase(), fill:'both'});
    animation.pause();
    animation.currentTime = 0;
    return {animation, start:starts[index] ?? 3500 + (index - 7) * 200};
  });

  function write(parts, count) {
    for (const part of parts) {
      const value = part.text.slice(0, Math.max(0,count));
      if (part.node.textContent !== value) part.node.textContent = value;
      count -= part.text.length;
    }
  }
  write(labels,0);
  codeScroll?.render(0);
  root.dataset.financialState = 'waiting';
  let elapsed = 0;
  let previous = null;
  let raf = 0;
  let visible = false;
  let disposed = false;
  let complete = false;

  function render() {
    if (!complete) {
      animations.forEach(({animation,start}) => { animation.currentTime = Math.max(0,elapsed-start); });
      write(labels,Math.floor(Math.min(1,Math.max(0,(elapsed-2500)/850))*labelLength));
      complete = elapsed >= 6200;
    }
    // Start typing and scrolling together as the JSON panel arrives.
    codeScroll?.render(Math.max(0, elapsed - 3500));
    root.dataset.financialState = elapsed < 3500 ? 'revealing' : 'typing-scrolling';
  }
  function frame(time) {
    raf = 0;
    if (!root.isConnected) { dispose(); return; }
    if (previous !== null) elapsed += time-previous;
    previous = time;
    render();
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = null;
    if (!disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .25);
    sync();
  }, {threshold:[0,.25]});
  observer.observe(root);
  document.addEventListener('visibilitychange',sync);

  function finish() {
    write(labels,labelLength);
    codeScroll?.showAll();
    animations.forEach(({animation}) => animation.cancel());
    track.style.removeProperty('transform');
    root.dataset.financialState = 'static';
    dispose();
  }
  function onMotionChange() { if (reduced.matches) finish(); }
  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    codeScroll?.dispose();
    document.removeEventListener('visibilitychange',sync);
    reduced.removeEventListener('change',onMotionChange);
  }
  reduced.addEventListener('change',onMotionChange);
}

function boot() { document.querySelectorAll('[data-financial-graphic]').forEach(init); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
