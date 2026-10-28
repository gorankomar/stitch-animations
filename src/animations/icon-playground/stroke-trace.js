// Definition geometry controls clipping/masks; it must never become visible artwork.
export function isArtworkPath(path){return !path.closest('defs, clipPath, mask, [data-effect-backing]');}
// Directional routes follow the original Figma geometry. Arrowhead branches start
// together at the tip only after their shaft reaches that shared junction.
export function traceRoutes(key, paths) {
  if (key === 'transactions') return [
    { d: 'M2.66667 6.66667C2.85904 5.51255 3.8576 4.66667 5.02764 4.66667H13.3333', part: 'transfer-forward', start: 0, end: .7 },
    { d: 'M13.3333 4.66667L10.6667 7.33333', part: 'transfer-forward', start: .7, end: 1 },
    { d: 'M13.3333 4.66667L10.6667 2', part: 'transfer-forward', start: .7, end: 1 },
    { d: 'M13.3333 9.33333C13.1409 10.4874 12.1423 11.3333 10.9723 11.3333H2.66659', part: 'transfer-back', start: 0, end: .7 },
    { d: 'M2.66659 11.3333L5.33325 8.66667', part: 'transfer-back', start: .7, end: 1 },
    { d: 'M2.66659 11.3333L5.33325 14', part: 'transfer-back', start: .7, end: 1 }
  ];
  const routes = paths.flatMap(path => (path.getAttribute('d').match(/M[^M]*/g) || []).map(d => ({d, part: path.getAttribute('class') || '', start: 0, end: 1})));
  if (key === 'card-upload') {
    return routes.filter(route => !route.part.includes('detail-part')).concat([
      {d:'M8 13.3333V8.66667',part:'detail-part',start:0,end:.65},
      {d:'M8 8.66667L10 10.6667',part:'detail-part',start:.65,end:1},
      {d:'M8 8.66667L6 10.6667',part:'detail-part',start:.65,end:1}
    ]);
  }
  return routes;
}
export function routeProgress(progress, start, end) {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

// Morphing a path can leave a visible dash seam in SVG's normalized length
// calibration. Completed traces must be solid strokes, not full-length dashes.
export function traceDashState(amount) {
 return amount>=1-1e-6 ? {array:'none',offset:0} : {array:'1 1',offset:1-amount};
}
