const doc = typeof document !== 'undefined' ? document : undefined;

export function qs(selector, root = doc) {
  return root?.querySelector?.(selector) ?? null;
}

export function qsa(selector, root = doc) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(selector));
}

export function byData(attr, value) {
  return `[data-${attr}="${value}"]`;
}

export function getDataNumber(el, attr, fallback) {
  if (!el?.dataset) return fallback;
  const raw = el.dataset[attr];
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

export function getDataBoolean(el, attr, fallback = false) {
  if (!el?.dataset) return fallback;
  if (attr in el.dataset) {
    const value = el.dataset[attr];
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

export function toggleData(el, attr, value) {
  if (!el?.dataset) return;
  if (value === undefined) {
    delete el.dataset[attr];
    return;
  }
  el.dataset[attr] = String(value);
}
