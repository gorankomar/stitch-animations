import { byData, qsa } from '../../lib/dom.js';
import { ATTR, DATA_ATTRS } from '../../lib/config.js';
import { ensureSectionReveal } from '../../lib/effects/reveal-groups.js';
import { whenVisible } from '../../lib/effects/threshold.js';
import { createDotsField } from '../../lib/effects/dots-field.js';
import {
  createValueCounter,
  parseCounterTextTemplate,
  readCounterDataset
} from '../../lib/effects/value-counter.js';
import './styles.css';

const BALANCE_VALUE = null; // Set to a Number to override the markup amount.

export function init(root = document) {
  if (typeof window === 'undefined') return () => {};

  const sections = qsa(byData(ATTR.anim, DATA_ATTRS.deposits), root);
  if (!sections.length) return () => {};

  const cleanups = sections.map((section) => whenVisible(section, () => setupDepositsSection(section)));

  return () => cleanups.forEach((dispose) => dispose && dispose());
}

function setupDepositsSection(section) {
  const revealController = ensureSectionReveal(section);
  revealController.ensure();

  const dotsCanvas = section.querySelector('.features-graphic_cc_dots-canvas');
  const dotsSensor = section.querySelector('.features-graphic_cc_dots-sensor');
  const timeDisplays = section.querySelectorAll('[data-deposits-time]');
  const balanceLabel = section.querySelector('.deposits_phone-balance_value');
  const balanceTemplate = parseCounterTextTemplate(balanceLabel);
  const balanceConfig = readCounterDataset(balanceLabel);
  const targetBalance =
    typeof BALANCE_VALUE === 'number' && Number.isFinite(BALANCE_VALUE)
      ? BALANCE_VALUE
      : Number.isFinite(balanceConfig?.value)
        ? balanceConfig.value
        : balanceTemplate?.value;

  const balanceInitial = Number.isFinite(balanceConfig?.initialValue)
    ? balanceConfig.initialValue
    : 0;

  const balanceCounter = balanceLabel
    ? createValueCounter({
        element: balanceLabel,
        initialValue: balanceInitial
      })
    : null;

  if (balanceCounter && Number.isFinite(targetBalance)) {
    balanceCounter.setTarget(targetBalance);
  }

  const disposeDots =
    dotsCanvas && dotsSensor
      ? createDotsField({
          canvas: dotsCanvas,
          sensor: dotsSensor,
          pointerTarget: section
        })
      : () => {};

  const disposeTime = setupLiveTime(timeDisplays);

  return () => {
    disposeDots();
    disposeTime();
    balanceCounter?.dispose();
    revealController.cancel();
  };
}

function setupLiveTime(displays) {
  if (!displays.length) return () => {};

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const update = () => {
    const label = formatter.format(new Date());
    displays.forEach((node) => (node.textContent = label));
  };

  update();
  const interval = window.setInterval(update, 3000);

  return () => window.clearInterval(interval);
}
