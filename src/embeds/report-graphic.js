import { createRevealController, resolveRevealTimings } from '../lib/effects/reveal-groups.js';

// Bundled into Report Graphic's Webflow embed, so slots remain native and motion
// travels with every instance without depending on a page-specific module loader.
const initialized = window.__stitchReportGraphics ||= new WeakSet();
function updateAuditTimes(root) {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  root.querySelectorAll('[data-audit-minutes-ago]').forEach(cell => {
    const minutes = Number(cell.dataset.auditMinutesAgo);
    const time = new Date(now.getTime() - minutes * 60000);
    const date = `${time.getFullYear()}/${pad(time.getMonth() + 1)}/${pad(time.getDate())}`;
    const clock = `${pad(time.getHours() % 12 || 12)}:${pad(time.getMinutes())} ${time.getHours() < 12 ? 'AM' : 'PM'}`;
    cell.textContent = `${date} ${clock}`;
  });
}

function boot() {
  document.querySelectorAll('[data-report-graphic]').forEach((root) => {
    if (initialized.has(root)) return;
    initialized.add(root);
    updateAuditTimes(root);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-reveal'));
      return;
    }
    const timings = resolveRevealTimings();
    // Playground may not contain Global Styles; match its established defaults.
    if (!getComputedStyle(document.documentElement).getPropertyValue('--reveal-duration-default').trim()) {
      timings.duration = 770;
      timings.opacityRatio = .34;
      timings.opacityDuration = Math.round(770 * .34);
    }
    const controller = createRevealController({ root, timings });
    root.classList.add('is-report-ready');
    const start = () => {
      updateAuditTimes(root);
      controller.ensure();
    };
    if (!('IntersectionObserver' in window)) { start(); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .25)) {
        observer.disconnect();
        start();
      }
    }, { threshold: .25 });
    observer.observe(root);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
