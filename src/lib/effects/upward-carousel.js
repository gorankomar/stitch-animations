// Legacy default: five slots. Configured stacks use visibleSlots + two hidden recycling slots.
export function sampleUpwardCarousel(time, index, duration, ease, {spacing = 50, adjacentScale = .82, adjacentOpacity = .4, visibleSlots = 3, scaleMode = "adjacent", hiddenScale = .72} = {}) {
  const hold = duration * 3, move = duration * 2, step = hold + move;
  const turn = Math.floor(time / step);
  const progress = Math.max(0, (time % step - hold) / move);
  const count = Math.max(1, Math.floor(visibleSlots)) + 2;
  const slot = ((index - turn) % count + count) % count;
  if (visibleSlots !== 3 || scaleMode === 'edges') {
    const n = count - 2;
    // Ordered visible rows, incoming below, outgoing above. Only hidden rows recycle.
    const pose = k => k < n
      ? { y: k * spacing, scale: scaleMode === 'edges' ? 1 : (k === Math.floor(n / 2) ? 1 : adjacentScale), opacity: 1 }
      : { y: (k === n ? n : -1) * spacing, scale: hiddenScale, opacity: 0 };
    const a = pose(slot), b = pose((slot + count - 1) % count), t = ease(progress);
    return { y: a.y + (b.y-a.y)*t, scale: a.scale + (b.scale-a.scale)*t, opacity: a.opacity + (b.opacity-a.opacity)*progress };
  }
  const poses = [
    {y:0,scale:1,opacity:1}, {y:spacing,scale:adjacentScale,opacity:adjacentOpacity},
    {y:spacing*2,scale:hiddenScale,opacity:0}, {y:-spacing*2,scale:hiddenScale,opacity:0},
    {y:-spacing,scale:adjacentScale,opacity:adjacentOpacity}
  ];
  const a = poses[slot], b = poses[(slot + 4) % 5];
  const t = ease(progress);
  return {y:a.y+(b.y-a.y)*t, scale:a.scale+(b.scale-a.scale)*t, opacity:a.opacity+(b.opacity-a.opacity)*progress};
}
