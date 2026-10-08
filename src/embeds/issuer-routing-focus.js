// Emphasize one complete route without changing reusable component internals.
const routes = {
  cards: ['cards'],
  ksa: ['cards', 'ksa', 'visa', 'mada'],
  eu: ['cards', 'eu', 'apple-pay', 'stripe'],
  visa: ['cards', 'ksa', 'visa'],
  mada: ['cards', 'ksa', 'mada'],
  'apple-pay': ['cards', 'eu', 'apple-pay'],
  stripe: ['cards', 'eu', 'stripe']
};
export function issuerFocusRoute(name) { return routes[name] || []; }

export function createIssuerFocus(root) {
  const items = Object.keys(routes).map(name => [name, root.querySelector(`.ir-position-${name}`)]).filter(([, node]) => node);
  if (items.length !== 7) return () => {};
  const links = [
    ...[...root.querySelectorAll('[data-ir-pulse]')].map(node => {
      const name = node.dataset.irPulse;
      const key = name === 'stem' ? 'stem' : name.endsWith('-top') ? (name.startsWith('ksa') ? 'visa' : 'apple-pay') : name.endsWith('-bottom') ? (name.startsWith('ksa') ? 'mada' : 'stripe') : name.startsWith('ksa') ? 'ksa' : 'eu';
      return [key, node];
    }),
    ...[...root.querySelectorAll('.ir-line-country-connectors g > path')].map((node, i) => [i === 0 ? 'ksa' : 'eu', node]),
    ...[...root.querySelectorAll('.ir-line-ksa-connectors g > path')].map((node, i) => [i === 0 ? 'visa' : 'mada', node]),
    ...[...root.querySelectorAll('.ir-line-eu-connectors g > path')].map((node, i) => [i === 0 ? 'apple-pay' : 'stripe', node])
  ];
  // Group connector segments outside their animated paths so focus opacity
  // never competes with the reveal or pulse clock.
  const groups = [], moved = [], byParent = new Map();
  for (const [key, node] of links) {
    const parent = node.parentNode;
    let keys = byParent.get(parent);
    if (!keys) byParent.set(parent, keys = new Map());
    let group = keys.get(key);
    if (!group) {
      group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      parent.insertBefore(group, node); keys.set(key, group); groups.push([key, group]);
    }
    moved.push([node, parent, node.nextSibling]); group.appendChild(node);
  }
  const saved = [...items, ...groups].map(([, node]) => [node, node.style.opacity, node.style.filter, node.style.transition]);
  const media = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  const apply = name => {
    if (disposed) return;
    const route = issuerFocusRoute(name);
    const focused = route.length > 0;
    const duration = reduced.matches ? '0ms' : 'var(--motion-duration-fast)';
    for (const [key, node] of items) {
      node.style.transition = `opacity ${duration} linear, filter ${duration} var(--motion-ease-primary)`;
      const dim = focused && !route.includes(key);
      node.style.opacity = dim ? '.5' : saved.find(([element]) => element === node)[1];
      node.style.filter = dim ? 'grayscale(1)' : saved.find(([element]) => element === node)[2];
    }
    for (const [key, node] of groups) {
      node.style.transition = `opacity ${duration} linear, filter ${duration} var(--motion-ease-primary)`;
      const dim = focused && (name === 'cards' || (key !== 'stem' && !route.includes(key)));
      node.style.opacity = dim ? '.5' : '';
      node.style.filter = dim ? 'grayscale(1)' : '';
    }
  };
  const listeners = items.map(([name, node]) => {
    const enter = event => { if (media.matches && event.pointerType !== 'touch') apply(name); };
    const leave = () => apply(null);
    node.addEventListener('pointerenter', enter); node.addEventListener('pointerleave', leave);
    return () => { node.removeEventListener('pointerenter', enter); node.removeEventListener('pointerleave', leave); };
  });
  const clear = () => apply(null);
  media.addEventListener('change', clear);
  return () => {
    if (disposed) return;
    disposed = true; listeners.forEach(remove => remove()); media.removeEventListener('change', clear);
    [...moved].reverse().forEach(([node, parent, next]) => parent.insertBefore(node, next?.parentNode === parent ? next : null));
    groups.forEach(([, group]) => group.remove());
    saved.forEach(([node, opacity, filter, transition]) => { node.style.opacity = opacity; node.style.filter = filter; node.style.transition = transition; });
  };
}
