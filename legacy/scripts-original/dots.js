(() => {
  const canvas = document.getElementById('dots');
  const sensor = document.getElementById('sensor');
  const ctx = canvas.getContext('2d');

  // ——— Tweakables ———
  const OPT = {
    bgColor: 'transparent',
    dotColor: 'rgba(196,200,208,.92)',
    baseSize: 1.2,
    sizeBoost: -0.2,
    gap: 20,
    radius: 210,
    offsetMax: 34,
    spring: 0.07,
    damping: 0.52,
    // Ripple
    click: {
      speed: 900, wavelength: 340, timeDecay: 3.4, distFalloff: 0.0012,
      amp: 0.12, sizeScale: 12, offsetScale: 60,
      centerDipRadius: 7, centerDipAmp: 1.2
    },
    // Mobile release easing
    retreatMs: 350
  };

  // ——— Setup ———
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w = 0, h = 0, points = [];

  const OFF = { x: -9999, y: -9999 };
  const target = { x: OFF.x, y: OFF.y };
  const pointer = { x: OFF.x, y: OFF.y, vx: 0, vy: 0 };

  // State
  let retreating = false, rStart = 0, rFromX = 0, rFromY = 0;

  // Ripples
  const ripples = [];
  const nowSec = () => performance.now() / 1000;
  const nowMs  = () => performance.now();

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const pad = OPT.radius + OPT.offsetMax + OPT.gap;
    const startX = -pad, startY = -pad, endX = w + pad, endY = h + pad;
    const cols = Math.ceil((endX - startX) / OPT.gap) + 1;
    const rows = Math.ceil((endY - startY) / OPT.gap) + 1;

    points = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      points.push({ x: startX + c * OPT.gap, y: startY + r * OPT.gap });
    }
  }

  const easeOutQuad = t => 1 - (1 - t) * (1 - t);

  function pointerInfluence(px, py) {
    const dx = px - pointer.x, dy = py - pointer.y;
    const d2 = dx*dx + dy*dy, R = OPT.radius;
    if (d2 >= R*R) return null;
    const d = Math.sqrt(d2) || 0.0001;
    const t = 1 - d / R, infl = easeOutQuad(t);
    return { infl, nx: dx/d, ny: dy/d };
  }

  function rippleValueAt(px, py, tNow) {
    if (!ripples.length) return 0;
    const c = OPT.click, k = (2 * Math.PI) / c.wavelength;
    let sum = 0;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r0 = ripples[i], dt = tNow - r0.t0;
      if (dt < 0) continue;
      if (dt > 1.7) { ripples.splice(i, 1); continue; }

      const dx = px - r0.x, dy = py - r0.y, dist = Math.hypot(dx, dy);
      const phase = k * (dist - c.speed * dt);
      const timeEnv = Math.exp(-c.timeDecay * dt);
      const distEnv = Math.exp(-c.distFalloff * dist);
      sum += c.amp * Math.sin(phase) * timeEnv * distEnv;

      const tC = Math.min(1, dist / c.centerDipRadius);
      const smooth = tC * tC * (3 - 2 * tC);
      sum += -(1 - smooth) * c.centerDipAmp * timeEnv;
    }
    return sum;
  }

  function beginRetreat() {
    retreating = true;
    rStart = nowMs();
    rFromX = target.x; rFromY = target.y;
  }

  function step() {
    // animate target to OFF on retreat (mobile release)
    if (retreating) {
      const t = Math.min(1, (nowMs() - rStart) / OPT.retreatMs);
      const e = easeOutQuad(t);
      target.x = rFromX + (OFF.x - rFromX) * e;
      target.y = rFromY + (OFF.y - rFromY) * e;
      if (t >= 1) retreating = false;
    }

    // spring follow
    const ax = (target.x - pointer.x) * OPT.spring;
    const ay = (target.y - pointer.y) * OPT.spring;
    pointer.vx = (pointer.vx + ax) * OPT.damping;
    pointer.vy = (pointer.vy + ay) * OPT.damping;
    pointer.x += pointer.vx; pointer.y += pointer.vy;

    // draw
    if (OPT.bgColor !== 'transparent') { ctx.fillStyle = OPT.bgColor; ctx.fillRect(0,0,w,h); }
    else { ctx.clearRect(0,0,w,h); }

    ctx.fillStyle = OPT.dotColor;
    const tNow = nowSec();

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let px = p.x, py = p.y, r = OPT.baseSize;

      const inf = pointerInfluence(p.x, p.y);
      if (inf) {
        const { infl, nx, ny } = inf;
        const push = infl * OPT.offsetMax;
        px = p.x + nx * push; py = p.y + ny * push;
        r = OPT.baseSize + OPT.sizeBoost * infl;
      }

      const rv = rippleValueAt(p.x, p.y, tNow);
      if (rv !== 0) {
        // radial pull/push from nearest ripple center
        let best = null, bestD2 = Infinity;
        for (let j = 0; j < ripples.length; j++) {
          const dx = p.x - ripples[j].x, dy = p.y - ripples[j].y;
          const d2 = dx*dx + dy*dy; if (d2 < bestD2) { bestD2 = d2; best = ripples[j]; }
        }
        if (best) {
          const dx = p.x - best.x, dy = p.y - best.y;
          const dd = Math.hypot(dx, dy) || 0.0001;
          const nx = dx / dd, ny = dy / dd;
          px += nx * (-rv * OPT.click.offsetScale);
          py += ny * (-rv * OPT.click.offsetScale);
        }
        r += rv * OPT.click.sizeScale;
      }

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.1, r), 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  // ——— Desktop (mouse) ———
  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX; target.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mousedown', (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, t0: nowSec() });
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    beginRetreat();
  }, { passive: true });

  // ——— Touch (via sensor + Pointer Events) ———
  // Active only on touch devices because #sensor gets pointer-events:auto there.
  sensor.addEventListener('pointerdown', (e) => {
    retreating = false;
    sensor.setPointerCapture?.(e.pointerId);
    target.x = e.clientX; target.y = e.clientY;
  }, { passive: true });

  sensor.addEventListener('pointermove', (e) => {
    // Coalesced events give buttery motion on high-freq hardware
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      target.x = ev.clientX; target.y = ev.clientY;
    }
    // Prevent scroll/zoom while interacting on touch
    if (e.pointerType !== 'mouse') e.preventDefault();
  }, { passive: false });

  sensor.addEventListener('pointerup', (e) => {
    // Treat quick taps as ripples
    ripples.push({ x: e.clientX, y: e.clientY, t0: nowSec() });
    beginRetreat();
    sensor.releasePointerCapture?.(e.pointerId);
  }, { passive: false });

  sensor.addEventListener('pointercancel', () => { beginRetreat(); }, { passive: false });
  sensor.addEventListener('pointerleave',  () => { beginRetreat(); }, { passive: false });

  window.addEventListener('blur', () => { beginRetreat(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) beginRetreat(); });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  window.DottedBG = { OPT, resize, ripples };
  resize();
  step();
})();