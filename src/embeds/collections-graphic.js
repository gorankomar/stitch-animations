// Portable motion for the Figma-sized graphic; native Webflow images own the layout.
const initialized = window.__stitchCollectionsGraphics || (window.__stitchCollectionsGraphics = new WeakSet());
function setup(stage) {
  if (initialized.has(stage)) return;
  initialized.add(stage);
  const cards = [...stage.querySelectorAll('[data-collections-window]')];
  if (!cards.length) return;
  let order = [...cards];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let active = new Set(), visible = false, stopped = false, started = false;
  const slot = index => {
    const depth = cards.length > 1 ? index / (cards.length - 1) : 0;
    return `translate(${-18.992248 * depth}cqw, ${-18.604651 * depth}cqw)`;
  };
  const layout = () => order.forEach((card, index) => {
    card.style.transform = slot(index);
    card.style.zIndex = String(cards.length - index);
    card.style.opacity = '1';
  });
  const sync = () => active.forEach(a => visible && !document.hidden ? a.play() : a.pause());
  async function animate(node, frames, duration, delay = 0) {
    const a = node.animate(frames, {duration, delay, easing:'cubic-bezier(.22,.75,.18,1)', fill:'both'});
    active.add(a); sync();
    try { await a.finished; } finally { active.delete(a); a.cancel(); }
  }
  const hold = duration => animate(stage,[{opacity:1},{opacity:1}],duration);
  async function run() {
    if (started || stopped || media.matches) return;
    started = true;
    layout();
    try {
      stage.dataset.collectionsState = 'revealing';
      await Promise.all(order.map((card,index) => animate(card,[
        {transform:`${slot(index)} translateY(125%)`,opacity:0},
        {transform:slot(index),opacity:1}
      ],900,(cards.length-index-1)*100)));
      stage.dataset.collectionsState = 'holding';
      await hold(1600);
      while (!stopped && cards.length > 1 && stage.isConnected) {
        stage.dataset.collectionsState = 'swapping';
        const outgoing = order[0];
        await Promise.all([
          animate(outgoing,[{transform:slot(0)},{transform:'translate(145cqw,145cqw)'}],850),
          ...order.slice(1).map((card,index) => animate(card,[{transform:slot(index+1)},{transform:slot(index)}],850))
        ]);
        order = [...order.slice(1),outgoing];
        layout();
        await animate(outgoing,[{transform:`${slot(cards.length-1)} translateY(18%)`,opacity:0},{transform:slot(cards.length-1),opacity:1}],550);
        stage.dataset.collectionsState = 'holding';
        await hold(3500);
      }
    } catch(error) { if(error.name !== 'AbortError') console.error('Collections:',error); }
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
    sync();
    if (visible) run();
  },{threshold:[0,.25]});
  function reduce() {
    if(!media.matches) return;
    stopped = true;
    active.forEach(a=>a.cancel()); active.clear();
    layout(); stage.dataset.collectionsState = 'static';
    observer.disconnect();
    document.removeEventListener('visibilitychange',sync);
    media.removeEventListener('change',reduce);
  }
  layout();
  if(media.matches) { stage.dataset.collectionsState='static'; return; }
  cards.forEach(card=>card.style.opacity='0');
  stage.dataset.collectionsState = 'waiting';
  observer.observe(stage);
  document.addEventListener('visibilitychange',sync);
  media.addEventListener('change',reduce);
}
function init(){document.querySelectorAll('[data-collections-graphic]').forEach(setup);}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
