(() => {
  // ===== DOM + basics =====
  const NS  = 'http://www.w3.org/2000/svg';
  const SVG = document.getElementById('radial_svg');
  const WRAP = document.querySelector('.radial_wrap');
  const SIZE = 768, CX = SIZE/2, CY = SIZE/2;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // ===== THEME =====
  const THEME = { color: 'var(--color-scheme-1--border)', baseThickness: 1, solidMultiplier: 2 };

  // ===== GEOMETRY =====
  const CONFIG = {
    canvasSize: SIZE,
    tiny:   { radius: 290, length: 2,  density: 1.4, opacity: .5 },
    solid:  { radius: 300,                           opacity: .2 },
    micro1: { radius: 330, length: 6,  density: 1.4, opacity: .3 },
    micro2: { radius: 360, length: 16, density: .7,  opacity: .25 },
    major:  { radius: 368, length: 61, count: 36,    opacity: 1 },
    marker: { enabled:true, atDeg:180, radius:287, base:3, height:5, radialOffset:0 }
  };

  // ===== UX tuning =====
  const STEP_MICRO = 1 / CONFIG.micro1.density;       // ~0.714°
  const STEP_MAJOR = 360 / CONFIG.major.count;        // 10° if 36

  // Drag feel
  const DRAG_SENSITIVITY = 0.30;       // deg/px
  const DRAG_DIRECTION   = -1;         // -1 => left drag rotates left
  const SNAP_DURING_DRAG_TO_MICRO = false;

  // Inertia (mobile boosted)
  const INERTIA_ENABLED  = true;
  const INERTIA_GAIN     = isCoarse ? 0.9  : 0.55;    // more carry on mobile
  const FRICTION_PER_MS  = isCoarse ? 0.998: 0.996;   // slower decay on mobile
  const MAX_VELOCITY     = 0.8;        // deg/ms cap
  const VELOCITY_MIN     = 0.003;      // treat as zero
  const RELEASE_MIN_MS   = 400;
  const RELEASE_MAX_MS   = 3200;
  const RELEASE_SLOWNESS = 2.3;        // scale final duration
  const SMALL_DRAG_PX    = 6;          // skip inertia if tiny drag
  const DIRECTIONAL_FINAL= true;       // snap forward/back by release dir

  // Intro
  const INTRO_DEG        = 48;         // small hint spin
  const INTRO_MS         = 2500;
  const OBSERVE_RATIO    = 0.35;

  // Easing
  const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
  const easeOutExpo  = t => 1 - Math.pow(2, -10 * t);
  const easeOutQuad  = t => 1 - (1 - t) * (1 - t);
  const INTRO_EASE   = easeOutQuint;
  const RELEASE_EASE = easeOutExpo;

  // ===== SVG helpers =====
  function setStroke(el, thickness, opacity, color){
    el.setAttribute('stroke', color ?? THEME.color);
    el.setAttribute('stroke-width', thickness ?? THEME.baseThickness);
    el.setAttribute('opacity', opacity ?? 1);
    el.setAttribute('vector-effect', 'non-scaling-stroke');
  }
  const line = (x1,y1,x2,y2, th, op, col, cap='round') => {
    const el = document.createElementNS(NS, 'line');
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
    el.setAttribute('stroke-linecap', cap);
    setStroke(el, th, op, col);
    return el;
  };
  const circle = (r, th, op, col) => {
    const el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', CX); el.setAttribute('cy', CY);
    el.setAttribute('r', r); el.setAttribute('fill', 'none');
    el.setAttribute('stroke-linecap', 'butt');
    setStroke(el, th, op, col);
    return el;
  };
  const polarLine = (rOut, len, deg, th, op, col) => {
    const a  = (deg - 90) * Math.PI/180, r1 = rOut - len, r2 = rOut;
    const x1 = CX + r1 * Math.cos(a), y1 = CY + r1 * Math.sin(a);
    const x2 = CX + r2 * Math.cos(a), y2 = CY + r2 * Math.sin(a);
    return line(x1,y1,x2,y2, th, op, col, 'round');
  };
  function ringByDensity({ radius, length, density, opacity, thickness, color }){
    const total = Math.max(1, Math.round(360 * density));
    const g = document.createElementNS(NS, 'g');
    for (let i=0;i<total;i++){
      const deg = (i / total) * 360;
      g.appendChild(polarLine(radius, length, deg,
        thickness ?? THEME.baseThickness, opacity, color ?? THEME.color));
    }
    return g;
  }
  function ringByCount({ radius, length, count, opacity, thickness, color }){
    const step = 360 / count;
    const g = document.createElementNS(NS, 'g');
    for (let i=0;i<count;i++){
      const deg = i * step;
      g.appendChild(polarLine(radius, length, deg,
        thickness ?? THEME.baseThickness, opacity, color ?? THEME.color));
    }
    return g;
  }
  function addMarker({ atDeg, radius, base, height, color, opacity, radialOffset=0 }){
    const a = (atDeg - 90) * Math.PI/180, rC = radius + radialOffset;
    const cx = CX + rC * Math.cos(a), cy = CY + rC * Math.sin(a);
    const tx = -Math.sin(a), ty = Math.cos(a); // tangent
    const rx =  Math.cos(a), ry = Math.sin(a); // radial
    const half = base/2;
    const px1 = cx + tx * (-half), py1 = cy + ty * (-half);
    const px2 = cx + tx * ( half),  py2 = cy + ty * ( half);
    const px3 = cx + rx * height,   py3 = cy + ry * height;
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', `${px1},${py1} ${px2},${py2} ${px3},${py3}`);
    poly.setAttribute('fill', color ?? THEME.color);
    poly.setAttribute('opacity', opacity ?? 1);
    return poly;
  }

  // ===== Build SVG =====
  SVG.setAttribute('viewBox', `0 0 ${CONFIG.canvasSize} ${CONFIG.canvasSize}`);
  const root  = document.createElementNS(NS, 'g');
  const rotor = document.createElementNS(NS, 'g'); rotor.setAttribute('id','rotor');
  SVG.appendChild(root);

  root.appendChild(ringByDensity({ ...CONFIG.tiny,  thickness:THEME.baseThickness, color:THEME.color }));
  if (CONFIG.marker?.enabled) root.appendChild(addMarker({ ...CONFIG.marker, color: THEME.color }));
  root.appendChild(circle(CONFIG.solid.radius, THEME.baseThickness * THEME.solidMultiplier, CONFIG.solid.opacity, THEME.color));
  rotor.appendChild(ringByDensity({ ...CONFIG.micro1, thickness:THEME.baseThickness, color:THEME.color }));
  rotor.appendChild(ringByDensity({ ...CONFIG.micro2, thickness:THEME.baseThickness, color:THEME.color }));
  rotor.appendChild(ringByCount   ({ ...CONFIG.major,  thickness:THEME.baseThickness, color:THEME.color }));
  root.appendChild(rotor);

  // ===== Rotation state =====
  let angle = 0, raf = null;
  const applyAngle = a => rotor.setAttribute('transform', `rotate(${a} ${CX} ${CY})`);
  const quantize = (a, step) => Math.round(a / step) * step;
  const ceilTo   = (a, step) => Math.ceil(a / step) * step;
  const floorTo  = (a, step) => Math.floor(a / step) * step;

  // ===== Intro (0.35 observer) =====
  let introPlayed = false;
  function playIntro(force = false){
    if (introPlayed && !force) return;
    introPlayed = true;
    const start = angle;
    const end   = quantize(start + INTRO_DEG, STEP_MAJOR);
    const t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = (now)=>{
      const t = Math.min(1, (now - t0) / INTRO_MS);
      const a = start + (end - start) * (easeOutQuint(t));
      angle = a; applyAngle(angle);
      if (t < 1) raf = requestAnimationFrame(step);
      else { angle = end; applyAngle(angle); raf = null; }
    };
    raf = requestAnimationFrame(step);
  }

  new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (e.isIntersecting && e.intersectionRatio >= OBSERVE_RATIO){
        playIntro();
      }
    }
  }, { threshold: [OBSERVE_RATIO], root: null }).observe(WRAP);

  // ===== Drag + predictive inertia =====
  let dragging=false, startX=0, startY=0, startAngle=0, lastTS=0, lastAng=0, velocity=0, accumDX=0, lockedDir=null;

  function down(ev){
    dragging = true;
    const touch = ev.touches?.[0] ?? ev;
    startX = touch.clientX; startY = touch.clientY;
    accumDX = 0; lockedDir = null;
    startAngle = angle; lastTS = performance.now(); lastAng = angle; velocity = 0;
    cancelAnimationFrame(raf);
    SVG.setPointerCapture?.(ev.pointerId ?? 1);
    ev.preventDefault();
  }

  function move(ev){
    if (!dragging) return;
    const touch = ev.touches?.[0] ?? ev;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // lock to horizontal (give vertical scroll back)
    if (!lockedDir){
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) lockedDir = 'x';
      else if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { dragging=false; return; }
      else return;
    }
    if (lockedDir !== 'x') return;

    accumDX = dx;

    const raw = startAngle + (dx * DRAG_SENSITIVITY * DRAG_DIRECTION);
    const liveAngle = SNAP_DURING_DRAG_TO_MICRO ? quantize(raw, STEP_MICRO) : raw;

    // estimate velocity (deg/ms)
    const now = performance.now();
    const dt = now - lastTS || 16;
    velocity = (liveAngle - lastAng) / dt;
    velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
    lastTS = now; lastAng = liveAngle;

    angle = liveAngle;
    applyAngle(angle);
  }

  function up(ev){
    if (!dragging) return; dragging=false;
    SVG.releasePointerCapture?.(ev.pointerId ?? 1);

    // tiny drags → quick snap to nearest major
    if (!INERTIA_ENABLED || Math.abs(accumDX) < SMALL_DRAG_PX || Math.abs(velocity) < VELOCITY_MIN){
      tweenTo(quantize(angle, STEP_MAJOR), RELEASE_MIN_MS, easeOutQuad);
      return;
    }

    // predictive stop
    const v0  = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity)) * INERTIA_GAIN; // deg/ms
    const dir = Math.sign(v0) || 1;
    const k   = -Math.log(FRICTION_PER_MS);
    const extra = v0 / (k || 1e-6);
    const aStop = angle + extra;

    let target = quantize(aStop, STEP_MAJOR);
    if (DIRECTIONAL_FINAL){
      if (dir > 0) target = Math.max(ceilTo(angle, STEP_MAJOR), Math.floor(aStop / STEP_MAJOR) * STEP_MAJOR);
      else         target = Math.min(floorTo(angle, STEP_MAJOR), Math.ceil(aStop / STEP_MAJOR) * STEP_MAJOR);
    }

    // duration from physics, scaled
    const delta = Math.abs(target - angle);
    let dur;
    if (delta < 1e-3 || Math.abs(v0) < 1e-6) dur = RELEASE_MIN_MS;
    else {
      const x = Math.min(0.98, (k * delta) / Math.abs(v0));
      dur = (-Math.log(1 - x) / (k || 1e-6));
      dur = Math.max(RELEASE_MIN_MS, Math.min(RELEASE_MAX_MS, dur));
    }
    dur = Math.min(RELEASE_MAX_MS, dur * RELEASE_SLOWNESS);

    tweenTo(target, dur, RELEASE_EASE);
  }

  function tweenTo(target, ms, easing = easeOutQuad){
    const start = angle, t0 = performance.now();
    if (ms <= 0){ angle = target; applyAngle(angle); return; }
    cancelAnimationFrame(raf);
    const step = (now)=>{
      const t = Math.min(1, (now - t0) / ms);
      angle = start + (target - start) * (easing(t));
      applyAngle(angle);
      if (t < 1) raf = requestAnimationFrame(step);
      else raf = null;
    };
    raf = requestAnimationFrame(step);
  }

  // events
  SVG.addEventListener('pointerdown',  down);
  SVG.addEventListener('pointermove',  move);
  SVG.addEventListener('pointerup',    up);
  SVG.addEventListener('pointercancel',up);
  SVG.addEventListener('touchstart',   down, {passive:false});
  SVG.addEventListener('touchmove',    move, {passive:false});
  SVG.addEventListener('touchend',     up,   {passive:false});
  SVG.addEventListener('dragstart', e => e.preventDefault());
})();