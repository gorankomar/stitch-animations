import { createCodeScrollEffect } from '../lib/effects/code-scroll.js';

const initialized = window.__stitchDueGraphics ||= new WeakSet();
function init(root) {
  if (initialized.has(root)) return;
  const track = root.querySelector('[data-due-track]');
  const card = root.querySelector('[data-due-card]');
  if (!track || !card) return;
  initialized.add(root);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const codeScroll = createCodeScrollEffect(track, {typingSelector:'[data-due-type]'});
  let elapsed=0, last=null, raf=0, visible=false, disposed=false, x=0, y=0, tx=0, ty=0;
  function dates() {
    root.querySelectorAll('[data-due-field]').forEach(field => {
      const output=field.querySelector('[data-due-date]');
      if (!output) return;
      const custom=field.getAttribute('data-date-override')?.trim();
      const day=new Date();
      const offset=Number(field.getAttribute('data-date-offset') || 0);
      day.setDate(day.getDate()+(Number.isFinite(offset)?offset:0));
      output.textContent=custom || [day.getDate(),day.getMonth()+1,day.getFullYear()].map(n=>String(n).padStart(2,'0')).join(' / ');
    });
  }
  dates();
  const dateTimer=setInterval(()=>{ if (!root.isConnected) dispose(); else dates(); },30000);
  function render(dt) {
    codeScroll?.render(elapsed);
    const ease=1-Math.exp(-dt/200);
    x+=(tx-x)*ease; y+=(ty-y)*ease;
    card.style.transform=`translate(${x}px,${y}px)`;
  }
  function frame(now) {
    raf=0;
    if(!root.isConnected){dispose();return;}
    const dt=last===null?0:Math.min(now-last,64);last=now;elapsed+=dt;
    render(dt);raf=requestAnimationFrame(frame);
  }
  function staticView() {
    codeScroll?.showAll();
    card.style.removeProperty('transform');
    x=y=tx=ty=0;
  }
  function sync() {
    cancelAnimationFrame(raf);raf=0;last=null;
    if(motion.matches) staticView();
    else if(visible&&!document.hidden&&!disposed) raf=requestAnimationFrame(frame);
    dates();
  }
  function move(event) {
    if(motion.matches||!fine.matches||event.pointerType==='touch')return;
    const rect=root.getBoundingClientRect(), max=rect.width*0.012;
    tx=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1))*max;
    ty=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1))*max;
  }
  function reset(){tx=ty=0;}
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:0});
  observer.observe(root);
  root.addEventListener('pointermove',move);root.addEventListener('pointerleave',reset);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  if(motion.matches)staticView();else render(0);
  function dispose(){disposed=true;cancelAnimationFrame(raf);clearInterval(dateTimer);observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',reset);codeScroll?.dispose();}
}
function boot(){document.querySelectorAll('[data-due-graphic]').forEach(init);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
