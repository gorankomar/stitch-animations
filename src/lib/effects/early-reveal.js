// Self-contained: serialized into the synchronous page-head bootstrap.
export function installEarlyReveal(win = window, doc = document) {
  if (win.__stitchEarlyReveal) return win.__stitchEarlyReveal;
  const html = doc.documentElement;
  const roots = '[data-reveal-start="early"]';
  const target = '[data-reveal]:not([data-reveal="false"]):not([data-reveal-mode="hard"])';
  const media = win.matchMedia('(prefers-reduced-motion: reduce)');
  const deadline = win.performance.now() + 1800;
  const leases = new Map();
  let armed = !media.matches;
  const style = doc.createElement('style');
  style.id = 'stitch-early-reveal-styles';
  style.textContent = `html[data-stitch-reveal-early="pending"] ${roots}:not([data-reveal-early-state]) ${target}:not(.is-reveal-ready){opacity:0!important}
${roots}[data-reveal-early-state="expired"] ${target}{opacity:1!important;transform:none!important;transition:none!important}
@media(prefers-reduced-motion:reduce){${roots} ${target}{opacity:1!important;transform:none!important;transition:none!important}}`;
  doc.head.appendChild(style);
  const expire = root => {
    const lease = leases.get(root);
    if (lease) { win.clearTimeout(lease.guard); win.clearTimeout(lease.finish); }
    leases.delete(root);
    root.dataset.revealEarlyState = 'expired';
    root.querySelectorAll(target).forEach(el => el.classList.remove('is-reveal-ready'));
  };
  const disarm = () => {
    armed = false;
    html.removeAttribute('data-stitch-reveal-early');
    doc.querySelectorAll(roots).forEach(root => {
      if (!root.dataset.revealEarlyState) expire(root);
    });
  };
  const bootTimer = win.setTimeout(disarm, 1800);
  const api = {
    claim(root) {
      if (!armed || media.matches || win.performance.now() >= deadline || root.dataset.revealEarlyState) {
        expire(root);
        return false;
      }
      root.dataset.revealEarlyState = 'running';
      leases.set(root, { guard: win.setTimeout(() => expire(root), 8000) });
      return true;
    },
    scheduled(root, duration) {
      const lease = leases.get(root);
      if (!lease) return;
      win.clearTimeout(lease.guard);
      lease.guard = win.setTimeout(() => expire(root), duration + 1000);
      lease.finish = win.setTimeout(() => {
        win.clearTimeout(lease.guard);
        leases.delete(root);
        root.dataset.revealEarlyState = 'complete';
      }, duration);
    },
    release: expire
  };
  win.__stitchEarlyReveal = api;
  media.addEventListener('change', () => {
    if (!media.matches) return;
    win.clearTimeout(bootTimer);
    disarm();
    doc.querySelectorAll(roots).forEach(expire);
  });
  if (armed) html.setAttribute('data-stitch-reveal-early', 'pending');
  return api;
}

export function earlyRevealHead() {
  return `<!-- Stitch early Reveal: place in page HEAD, before body paint. -->\n<script>(${installEarlyReveal.toString()})(window,document);</script>\n`;
}
