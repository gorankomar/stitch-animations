(function () {
  // Respect reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const REM = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  // Tweakables
  const MAX = 0.5 * REM;   // how far it drifts
  const SMOOTH = 0.06;     // lower = more floaty; higher = snappier
  const STOP_EPS = 0.08;   // when to stop the RAF

  document.querySelectorAll('.api-graphic_wrap').forEach(wrap => {
    const track = wrap.querySelector('.api-graphic_track');
    const block = wrap.querySelector('.api-graphic_block');
		const ripple = wrap.querySelector('.api-graphic_ripple');

    if (!track || !block) return;

    let rect = wrap.getBoundingClientRect();
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let rafId = null;

    const updateRect = () => { rect = wrap.getBoundingClientRect(); };

    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const nx = ((p.clientX - rect.left) / rect.width) * 2 - 1;  // [-1,1]
      const ny = ((p.clientY - rect.top)  / rect.height) * 2 - 1; // [-1,1]
      targetX = Math.max(-1, Math.min(1, nx)) * MAX;
      targetY = Math.max(-1, Math.min(1, ny)) * MAX;
      start();
    };

    const onLeave = () => { targetX = 0; targetY = 0; start(); };

    const tick = () => {
      // gentle low-pass toward target
      curX += (targetX - curX) * SMOOTH;
      curY += (targetY - curY) * SMOOTH;

      track.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

      if (Math.abs(targetX - curX) > STOP_EPS || Math.abs(targetY - curY) > STOP_EPS) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const start = () => { if (rafId == null) rafId = requestAnimationFrame(tick); };

    // Click -> bounce (scale) — no @property; just toggle a class
    const press = () => {
			// restart the scale wobble
			block.classList.remove('is-pressing');
			block.offsetWidth; // reflow
			block.classList.add('is-pressing');

			// border ripple
			if (ripple) {
				ripple.classList.remove('is-ripple');
				ripple.offsetWidth;
				ripple.classList.add('is-ripple');
			}
		};

    // Events
    wrap.addEventListener('pointerenter', updateRect, { passive: true });
    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave, { passive: true });
		ripple?.addEventListener('animationend', () => ripple.classList.remove('is-ripple'));
    wrap.addEventListener('click', press);
    window.addEventListener('resize', updateRect);
    wrap.addEventListener('touchstart', updateRect, { passive: true });
    wrap.addEventListener('touchmove', onMove, { passive: true });
    wrap.addEventListener('touchend', onLeave, { passive: true });
    block.addEventListener('animationend', () => block.classList.remove('is-pressing'));
  });
})();