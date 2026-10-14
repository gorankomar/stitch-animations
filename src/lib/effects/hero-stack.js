import { qsa } from '../dom.js';
import { createStackedWindowsController } from './stacked-windows.js';

// CSS owns final geometry and image visibility. JS owns only enhancement/lifecycle.
export function createHeroStackController(section, revealController) {
  const wraps = qsa('.stacked-windows_wrap', section);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const disposeLayouts = [];
  let readyTimer;
  let disposed = false;
  const restore = () => {
    window.clearTimeout(readyTimer);
    revealController.cancel();
    wraps.forEach(wrap => wrap.classList.remove('is-inview', 'is-ready'));
  };
  const onPreference = () => { if (reduced.matches) restore(); };
  try {
    wraps.forEach(wrap => disposeLayouts.push(createStackedWindowsController(wrap)));
    if (!reduced.matches && section.dataset.revealEarlyState !== 'expired') {
      const remaining = revealController.ensure();
      // Missing/late early setup may expire during ensure(). Keep that static.
      if (section.dataset.revealEarlyState !== 'expired') {
        wraps.forEach(wrap => wrap.classList.add('is-inview'));
        readyTimer = window.setTimeout(() => {
          if (!disposed && !reduced.matches && section.dataset.revealEarlyState !== 'expired') {
            wraps.forEach(wrap => wrap.classList.add('is-ready'));
          }
        }, remaining + 50);
      }
    } else if (reduced.matches) restore();
    reduced.addEventListener('change', onPreference);
  } catch (error) {
    restore();
    disposeLayouts.forEach(dispose => dispose());
    throw error;
  }
  return () => {
    disposed = true;
    reduced.removeEventListener('change', onPreference);
    restore();
    disposeLayouts.forEach(dispose => dispose());
  };
}
