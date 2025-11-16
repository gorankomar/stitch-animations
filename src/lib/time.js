export function toMs(value, fallback = 0) {
  if (!value && value !== 0) return fallback;
  const trimmed = String(value).trim();
  const num = Number.parseFloat(trimmed);
  if (!Number.isFinite(num)) return fallback;
  return trimmed.endsWith('ms') ? num : num * 1000;
}
