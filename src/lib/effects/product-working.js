// Selected S2 + O1 study. Caller owns a visibility-aware clock and linear opacity.
export function twinGlowsShadow(seconds) {
  const angle = seconds * Math.PI * 2 / 2.8;
  const x = Math.cos(angle) * 1.1;
  const y = Math.sin(angle) * .65;
  return `${x}cqi ${y}cqi 1.7cqi -.55cqi rgb(234 106 18 / .25), ${-x}cqi ${-y}cqi 1.6cqi -.5cqi rgb(255 127 98 / .15), 0 .65cqi 1.6cqi -.55cqi rgb(0 0 0 / .04)`;
}

export function singleTrailOutline(seconds) {
  const angle = seconds * 360 / 3.6;
  return `conic-gradient(from ${angle}deg, transparent 0deg, rgb(255 127 98 / .06) 15deg, rgb(255 127 98 / .8) 70deg, transparent 88deg, transparent 360deg)`;
}

export function renderProductWorking(element, seconds, opacity) {
  element.style.setProperty('--product-working-shadow', twinGlowsShadow(seconds));
  element.style.setProperty('--product-working-outline', singleTrailOutline(seconds));
  element.style.setProperty('--product-working-opacity', Math.max(0, Math.min(1, opacity)));
}

export function clearProductWorking(element) {
  ['--product-working-shadow', '--product-working-outline', '--product-working-opacity']
    .forEach(property => element.style.removeProperty(property));
}
