// Five slots: active, below, hidden incoming, hidden outgoing, above.
export function sampleUpwardCarousel(time, index, duration, ease, {spacing = 50, adjacentScale = .82, adjacentOpacity = .4} = {}) {
  const hold = duration * 3, move = duration * 2, step = hold + move;
  const turn = Math.floor(time / step);
  const progress = Math.max(0, (time % step - hold) / move);
  const slot = ((index - turn) % 5 + 5) % 5;
  const poses = [
    {y:0,scale:1,opacity:1}, {y:spacing,scale:adjacentScale,opacity:adjacentOpacity},
    {y:spacing*2,scale:.72,opacity:0}, {y:-spacing*2,scale:.72,opacity:0},
    {y:-spacing,scale:adjacentScale,opacity:adjacentOpacity}
  ];
  const a = poses[slot], b = poses[(slot + 4) % 5];
  const t = ease(progress);
  return {y:a.y+(b.y-a.y)*t, scale:a.scale+(b.scale-a.scale)*t, opacity:a.opacity+(b.opacity-a.opacity)*progress};
}
