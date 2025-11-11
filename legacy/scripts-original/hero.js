(() => {
  const wraps = document.querySelectorAll('.stacked-windows_wrap');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const wrap = entry.target;

      // allow per-wrapper overrides
      const stagger = wrap.dataset.stagger || getComputedStyle(wrap).getPropertyValue('--stagger').trim() || '0.25s';
      const enterDur = wrap.dataset.dur || getComputedStyle(wrap).getPropertyValue('--enter-dur').trim() || '1.5s';

      // set CSS vars from data-* if provided
      wrap.style.setProperty('--stagger', stagger);
      wrap.style.setProperty('--enter-dur', enterDur);

      // index children for stagger
      const cards = wrap.querySelectorAll('.stacked-windows_img-wrap');
      cards.forEach((el, i) => el.style.setProperty('--i', i));

      // trigger entrance
      wrap.classList.add('is-inview');
      io.unobserve(wrap);

      // compute when entrance is fully done, then enable fast hover
      const toMs = s => (s.endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000);
      const maxDelay = (cards.length - 1) * toMs(stagger);
      const total = toMs(enterDur) + maxDelay + 50; // tiny buffer
      setTimeout(() => wrap.classList.add('is-ready'), total);
    });
  }, { threshold: 0.25 });

  wraps.forEach(wrap => io.observe(wrap));
})();