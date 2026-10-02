const ease = t => t * t * (3 - 2 * t);

// Both directions traverse the same path. Change stacking only at full clearance.
export function walletSwapPose(progress, offset, grayHeight, gap) {
  const clear = grayHeight + gap;
  const first = ease(Math.min(1, progress * 2));
  const second = ease(Math.max(0, progress * 2 - 1));
  return {
    blueY: progress <= 0.5 ? clear * first : clear + (offset - clear) * second,
    grayY: -offset * first,
    blueFront: progress >= 0.5
  };
}

export function createWalletSwap(root) {
  const blue = root.querySelector('.product-variety_blue');
  const gray = root.querySelector('.product-variety_gray');
  if (!blue || !gray) return {setEnabled() {}, dispose() {}};
  const saved = [blue, gray].map(el => ({translate: el.style.translate, zIndex: el.style.zIndex}));
  let enabled = false, target = 0, progress = 0, frame = 0, previous = 0;
  let offset = 0, height = 0, gap = 0;
  const render = () => {
    const pose = walletSwapPose(progress, offset, height, gap);
    blue.style.translate = `0 ${pose.blueY}px`;
    gray.style.translate = `0 ${pose.grayY}px`;
    blue.style.zIndex = pose.blueFront ? '2' : '0';
    gray.style.zIndex = '1';
  };
  const measure = () => {
    // Native flex flow determines the two resting positions, unaffected by motion.
    offset = blue.offsetHeight + parseFloat(getComputedStyle(gray).marginTop || '0');
    height = gray.offsetHeight;
    gap = Math.max(4, blue.offsetWidth * 0.04);
    if (progress) render();
  };
  const tick = now => {
    frame = 0;
    const step = previous ? Math.min(now - previous, 50) / 900 : 0;
    previous = now;
    progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step);
    render();
    if (progress !== target) frame = requestAnimationFrame(tick);
    else previous = 0;
  };
  const aim = value => {
    target = value;
    if (!frame && progress !== target) frame = requestAnimationFrame(tick);
  };
  const enter = () => { if (enabled) aim(1); };
  const leave = () => aim(0);
  const restore = () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0; progress = 0; target = 0;
    [blue, gray].forEach((el, index) => {
      el.style.translate = saved[index].translate;
      el.style.zIndex = saved[index].zIndex;
    });
  };
  measure();
  const resize = new ResizeObserver(measure);
  resize.observe(blue); resize.observe(gray);
  root.addEventListener('pointerenter', enter);
  root.addEventListener('pointerleave', leave);
  return {
    setEnabled(value) {
      if (enabled === value) return;
      enabled = value;
      if (!value) restore();
      else if (root.matches(':hover')) enter();
    },
    dispose() {
      restore(); resize.disconnect();
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
    }
  };
}
