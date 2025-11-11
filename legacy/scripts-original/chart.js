(() => {
  // ===== Config =====
  const LAG = 0.07;
  const DAYS = 21;
  const MIN_VAL = 60000;
  const MAX_VAL = 270000;
  const INTRO_VALUE = 170000;
  const INTRO_DURATION = 1000;
  const OBSERVE_RATIO = 0.5;

  // Tooltip tuning (PIXELS)
  const IDLE_EPSILON_PX = 0.6;
  const IDLE_FRAMES = 10;
  const EDGE_PAD = 52;
  const FLIP_ZONE = 70;
  const GAP_PX = 25;
  const ENTER_PX = 10;
  const DAILY_MIN = 4000;
  const DAILY_MAX = 27000;

  // Input gating
  const MOVE_THRESHOLD_PX = 18;
  const X_PAD = 16;

  // Big-number display duration (ms)
  const COUNTER_MS = 120;

  // ===== Elements =====
  const wrap = document.querySelector('.scale-graph_svg-block');
  const svg  = wrap.querySelector('svg');
  const guidePath = svg.querySelector('#scale-graph_path');
  const dotGroup  = svg.querySelector('#scale-graph_dot');
  const dashed    = svg.querySelector('#scale-graph_dashed-line');
  const numEl  = document.querySelector('.scale-graph_number');
  const pastEl = document.querySelector('[data-date="past"]');
  const todayEl= document.querySelector('[data-date="today"]');

  // Tooltip
  const tipEl      = document.querySelector('.scale-graph_tooltip');
  const tipDateEl  = document.querySelector('.scale-graph_tooltip-date');
  const tipCountEl = document.querySelector('.scale-graph_tooltip-count');

  // ===== Dates & formatting =====
  const today = new Date();
  const startDate = new Date(today); startDate.setDate(startDate.getDate() - DAYS);
  const fmtShort  = d => d.toLocaleDateString(undefined,{month:'short', day:'2-digit'});
  const fmtLong   = d => d.toLocaleDateString(undefined,{month:'short', day:'2-digit', year:'numeric'});
  const fmtNumber = n => n.toLocaleString('en-US');

  pastEl.textContent  = fmtShort(startDate);
  todayEl.textContent = fmtShort(today);

  // ===== Helpers =====
  function clientToSVG(xClient, yClient){
    const pt = svg.createSVGPoint(); pt.x = xClient; pt.y = yClient;
    const ctm = svg.getScreenCTM();
    return ctm ? pt.matrixTransform(ctm.inverse()) : { x: xClient, y: yClient };
  }
  function pointAtSVGX(path, xTarget){
    let lo = 0, hi = path.getTotalLength();
    for (let i=0;i<25;i++){
      const mid = (lo + hi) / 2;
      const p = path.getPointAtLength(mid);
      if (p.x < xTarget) lo = mid; else hi = mid;
    }
    const len = (lo + hi) / 2;
    const p = path.getPointAtLength(len);
    return { p, len };
  }
  function xr(){
    const bb = guidePath.getBBox();
    return {
      xMin: bb.x + X_PAD,
      xMax: bb.x + bb.width - X_PAD,
      yMin: bb.y,
      yMax: bb.y + bb.height
    };
  }
  function valueFromX(x){
    const { xMin, xMax } = xr();
    const t = Math.max(0, Math.min(1, (x - xMin) / (xMax - xMin)));
    return Math.round(MIN_VAL + t * (MAX_VAL - MIN_VAL));
  }
  function dateFromX(x){
    const { xMin, xMax } = xr();
    const t = Math.max(0, Math.min(1, (x - xMin) / (xMax - xMin)));
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.round(t * DAYS));
    return d;
  }
  function dailyFromY(y){
    const { yMin, yMax } = xr();
    const t = (y - yMin) / (yMax - yMin);
    const inv = 1 - Math.max(0, Math.min(1, t));
    return Math.max(DAILY_MIN, Math.round(DAILY_MIN + inv * (DAILY_MAX - DAILY_MIN)));
  }
  function svgPointToWrapXY(x, y){
    const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    const screen = pt.matrixTransform(svg.getScreenCTM());
    const rect = wrap.getBoundingClientRect();
    return { left: screen.x - rect.left, top: screen.y - rect.top, wrapRect: rect };
  }
  function xAtValue(val){
    const { xMin, xMax } = xr();
    const t = (val - MIN_VAL) / (MAX_VAL - MIN_VAL);
    return xMin + Math.max(0, Math.min(1, t)) * (xMax - xMin);
  }

  // Dot base
  const dotBB = dotGroup.getBBox();
  const dotBaseX = dotBB.x + dotBB.width/2;
  const dotBaseY = dotBB.y + dotBB.height/2;

  let targetX = xAtValue(MIN_VAL);
  let currentX = targetX;

  // Big number smoothing state
  let displayV = MIN_VAL;
  let lastPrinted = null;

  let introPlayed = false, introDriving = false;

  // Tooltip state
  let idleFrames = 0;
  let tipVisible = false;

  // Hide before first render
  dotGroup.style.visibility = 'hidden';
  dashed.style.visibility = 'hidden';
  if (tipEl){
    tipEl.setAttribute('aria-hidden','true');
    tipEl.style.setProperty('--x-shift','0px');
    tipEl.style.setProperty('--y-shift','-10px');
  }

  // Entrance offset per side (directions)
  function setStartOffsetForSide(side){
    if (side === 'center'){
      tipEl.style.setProperty('--x-shift', '0px');
      tipEl.style.setProperty('--y-shift', `-${ENTER_PX}px`);   // from top → down
    } else if (side === 'left'){
      tipEl.style.setProperty('--x-shift', `${ENTER_PX}px`);    // from right → left
      tipEl.style.setProperty('--y-shift', '0px');
    } else { // right
      tipEl.style.setProperty('--x-shift', `-${ENTER_PX}px`);   // from left → right
      tipEl.style.setProperty('--y-shift', '0px');
    }
  }

  // Exponential step for duration-based easing (~60fps)
  const COUNTER_STEP = 1 - Math.exp(-16 / COUNTER_MS);

  // ===== Tick =====
  function tick(){
    // Visual dot chases with LAG
    currentX += (targetX - currentX) * LAG;
    const { p } = pointAtSVGX(guidePath, currentX);

    // Move dot
    const dx = p.x - dotBaseX;
    const dy = p.y - dotBaseY;
    dotGroup.setAttribute('transform', `translate(${dx},${dy})`);

    // Dashed line — to the *real* bottom of viewBox (handles negative top)
    const vb = svg.viewBox.baseVal;
    const bottomY = vb.y + vb.height;
    dashed.setAttribute('d', `M ${p.x} ${p.y} V ${bottomY}`);

    // Big number: drive toward *target position* (fast, independent of dot lag)
    const targetV = valueFromX(targetX);
    displayV += (targetV - displayV) * COUNTER_STEP;
    const shown = Math.round(displayV);
    if (shown !== lastPrinted){
      lastPrinted = shown;
      numEl.textContent = `${fmtNumber(shown)}+`;
    }

    // For completeness (if you read it somewhere else)
    const dynDate = dateFromX(currentX); // non-critical; can be targetX too
    todayEl.setAttribute('data-dynamic-date', fmtLong(dynDate));

    // Reveal dot/dash after first paint
    if (dotGroup.style.visibility !== 'visible'){
      dotGroup.style.visibility = 'visible';
      dashed.style.visibility = 'visible';
    }

    // ===== Tooltip =====
    const isIdle = Math.abs(targetX - currentX) < IDLE_EPSILON_PX;
    idleFrames = isIdle ? Math.min(IDLE_FRAMES, idleFrames + 1) : 0;

    if (tipEl){
      if (idleFrames >= IDLE_FRAMES){
        // Decide side/position first (from current dot)
        const { left: dotL, top: dotT, wrapRect } = svgPointToWrapXY(p.x, p.y);
        const wrapW = wrapRect.width;

        // Measure tooltip if needed
        const wasHidden = tipEl.getAttribute('aria-hidden') === 'true';
        if (wasHidden){ tipEl.style.visibility = 'hidden'; tipEl.setAttribute('aria-hidden','false'); }
        const tipRect = tipEl.getBoundingClientRect();
        if (wasHidden){ tipEl.setAttribute('aria-hidden','true'); tipEl.style.visibility = ''; }
        const tipW = tipRect.width, tipH = tipRect.height;

        // Side decision (proximity first, overflow fallback)
        let side = 'center';
        if (dotL <= FLIP_ZONE) side = 'left';
        else if (dotL >= wrapW - FLIP_ZONE) side = 'right';
        else {
          const overflowRight = (dotL + tipW/2 + EDGE_PAD) > wrapW;
          const overflowLeft  = (dotL - tipW/2 - EDGE_PAD) < 0;
          if (overflowRight && !overflowLeft) side = 'right';
          else if (overflowLeft && !overflowRight) side = 'left';
        }
        tipEl.dataset.side = side;

        // Final anchor position (matches CSS transforms)
        if (side === 'center'){
          tipEl.style.left = `${dotL}px`;
          tipEl.style.top  = `${dotT - GAP_PX}px`;
          const tipLeftAbs = dotL - tipW/2;
          const anchorPct = ((dotL - tipLeftAbs) / tipW) * 100;
          tipEl.style.setProperty('--anchor-x', `${Math.max(8, Math.min(92, anchorPct))}%`);
        } else if (side === 'left'){
          tipEl.style.left = `${dotL + GAP_PX}px`;
          tipEl.style.top  = `${dotT}px`;
        } else {
          tipEl.style.left = `${dotL - GAP_PX}px`;
          tipEl.style.top  = `${dotT}px`;
        }

        // SHOW (only now set content so it stays fixed while visible)
        if (!tipVisible){
          // Snap the headline number to target so it doesn't creep while tooltip is open
          displayV = targetV; lastPrinted = null;
          numEl.textContent = `${fmtNumber(Math.round(displayV))}+`;

          // Freeze tooltip values at show time
          const tipDate = dateFromX(targetX);
          tipDateEl.textContent  = fmtLong(tipDate);
          tipCountEl.textContent = fmtNumber(dailyFromY(p.y));

          const prevTransition = tipEl.style.transition;
          tipEl.style.transition = 'none';
          setStartOffsetForSide(side);
          void tipEl.offsetWidth;            // reflow
          tipEl.style.transition = prevTransition || '';

          tipEl.style.setProperty('--x-shift', '0px');
          tipEl.style.setProperty('--y-shift', '0px');
          tipEl.setAttribute('aria-hidden','false');
          tipVisible = true;
        }
      } else if (tipVisible){
        tipEl.setAttribute('aria-hidden','true');
        tipVisible = false;
      }
    }

    requestAnimationFrame(tick);
  }

  // ===== Input (wrapper-wide) with X-threshold =====
  let lastInputClientX = null;

  function shouldAcceptMove(clientX){
    if (lastInputClientX === null){ lastInputClientX = clientX; return false; }
    const dx = Math.abs(clientX - lastInputClientX);
    if (dx >= MOVE_THRESHOLD_PX){ lastInputClientX = clientX; return true; }
    return false;
  }

  function setTargetFromEvent(e){
    if (introDriving) return;
    const t = (e.touches && e.touches[0]) || e;
    const clientX = t.clientX;
    if (!shouldAcceptMove(clientX)) return;

    const svgPt = clientToSVG(clientX, t.clientY);
    const { xMin, xMax } = xr();
    targetX = Math.max(xMin, Math.min(xMax, svgPt.x));
  }

  function primeBaseline(e){
    const t = (e.touches && e.touches[0]) || e;
    lastInputClientX = t.clientX;
  }

  wrap.addEventListener('pointerenter', primeBaseline);
  wrap.addEventListener('pointerdown', primeBaseline);
  wrap.addEventListener('touchstart', primeBaseline, { passive:true });

  wrap.addEventListener('pointermove', setTargetFromEvent);
  wrap.addEventListener('touchmove',  setTargetFromEvent, { passive:true });

  // ===== Intro =====
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function runIntro(){
    if (introPlayed) return; introPlayed = true;

    const startX = xAtValue(MIN_VAL);
    const endX   = xAtValue(INTRO_VALUE);

    currentX = startX;
    targetX  = startX;

    const t0 = performance.now();
    introDriving = true;

    function step(now){
      const t = Math.min(1, (now - t0) / INTRO_DURATION);
      const k = easeOutCubic(t);
      targetX = startX + (endX - startX) * k;
      if (t < 1){ requestAnimationFrame(step); }
      else { introDriving = false; targetX = endX; }
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= OBSERVE_RATIO) runIntro();
    });
  }, { threshold: [OBSERVE_RATIO] });
  io.observe(wrap);

  requestAnimationFrame(tick);
})();