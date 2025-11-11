import { remToPx } from '../motion.js';

const hasWindow = typeof window !== 'undefined';

export function createSpringFollower({
  wrap,
  track,
  block,
  ripple,
  maxOffset = remToPx(0.5),
  smooth = 0.06,
  stopEps = 0.08
}) {
  if (!wrap || !track || !hasWindow) return () => {};

  let rect = wrap.getBoundingClientRect();
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let raf = null;

  const updateRect = () => {
    rect = wrap.getBoundingClientRect();
  };

  const tick = () => {
    curX += (targetX - curX) * smooth;
    curY += (targetY - curY) * smooth;
    track.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    if (Math.abs(targetX - curX) > stopEps || Math.abs(targetY - curY) > stopEps) {
      raf = window.requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  const start = () => {
    if (raf == null) {
      raf = window.requestAnimationFrame(tick);
    }
  };

  const onPointerMove = (event) => {
    const p = event.touches ? event.touches[0] : event;
    const nx = ((p.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((p.clientY - rect.top) / rect.height) * 2 - 1;
    targetX = Math.max(-1, Math.min(1, nx)) * maxOffset;
    targetY = Math.max(-1, Math.min(1, ny)) * maxOffset;
    start();
  };

  const release = () => {
    targetX = 0;
    targetY = 0;
    start();
  };

  const press = () => {
    if (block) {
      block.classList.remove('is-pressing');
      block.offsetWidth;
      block.classList.add('is-pressing');
    }
    if (ripple) {
      ripple.classList.remove('is-ripple');
      ripple.offsetWidth;
      ripple.classList.add('is-ripple');
    }
  };

  const onRippleEnd = () => ripple?.classList.remove('is-ripple');
  const onBlockEnd = () => block?.classList.remove('is-pressing');

  wrap.addEventListener('pointerenter', updateRect, { passive: true });
  wrap.addEventListener('pointermove', onPointerMove, { passive: true });
  wrap.addEventListener('pointerleave', release, { passive: true });
  wrap.addEventListener('touchstart', updateRect, { passive: true });
  wrap.addEventListener('touchmove', onPointerMove, { passive: true });
  wrap.addEventListener('touchend', release, { passive: true });
  wrap.addEventListener('click', press);
  window.addEventListener('resize', updateRect);
  ripple?.addEventListener('animationend', onRippleEnd);
  block?.addEventListener('animationend', onBlockEnd);

  return () => {
    wrap.removeEventListener('pointerenter', updateRect);
    wrap.removeEventListener('pointermove', onPointerMove);
    wrap.removeEventListener('pointerleave', release);
    wrap.removeEventListener('touchstart', updateRect);
    wrap.removeEventListener('touchmove', onPointerMove);
    wrap.removeEventListener('touchend', release);
    wrap.removeEventListener('click', press);
    window.removeEventListener('resize', updateRect);
    ripple?.removeEventListener('animationend', onRippleEnd);
    block?.removeEventListener('animationend', onBlockEnd);
    if (raf) {
      window.cancelAnimationFrame(raf);
    }
  };
}
