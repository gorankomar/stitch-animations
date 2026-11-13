// Shared orange/gray orbit, sampled by the owning visibility clock (seconds).
const properties = ['--copilot-shadow-x', '--copilot-shadow-y', '--copilot-glow-x', '--copilot-glow-y', '--copilot-glow-alpha'];
export function renderCopilotShadow(element, seconds, scale = 1) {
  const angle = seconds * 2 * Math.PI / 5.5;
  [3.856 * Math.sin(angle), 3.856 * Math.cos(angle), -3 * Math.sin(angle), 3 * (1 - Math.cos(angle))]
    .forEach((offset, index) => element.style.setProperty(properties[index], offset * scale + 'cqi'));
  const pulse = 1 - Math.abs((seconds % 2.75) / 1.375 - 1);
  element.style.setProperty(properties[4], .35 + .25 * pulse);
}
export function clearCopilotShadow(element) {
  properties.forEach(property => element.style.removeProperty(property));
}
