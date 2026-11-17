export function initFilmSubtitleMenu(root, trigger) {
  const menu = root.querySelector('[data-film-subtitle-menu]');
  if (!menu) return () => {};
  const options = Array.from(menu.querySelectorAll('[data-film-language]'));
  const abort = new AbortController();
  const on = (node, event, handler) => node.addEventListener(event, handler, { signal: abort.signal });
  const originalId = menu.id;
  menu.id ||= `film-subtitles-${crypto.randomUUID()}`;
  trigger.setAttribute('aria-controls', menu.id);
  const sync = () => {
    options.forEach(option => option.setAttribute('aria-checked', String(option.dataset.filmLanguage === trigger.value)));
    trigger.setAttribute('aria-label', `Subtitle language: ${options.find(option => option.dataset.filmLanguage === trigger.value)?.textContent.trim() || 'Off'}`);
    trigger.setAttribute('data-film-subtitles-active', String(Boolean(trigger.value)));
  };
  const close = (restoreFocus = false) => {
    menu.hidden = true;
    delete root.dataset.filmSubtitlesOpen;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({ preventScroll: true });
    root.dispatchEvent(new Event('film-subtitle-menu-change'));
  };
  const open = (edge) => {
    menu.hidden = false;
    root.dataset.filmSubtitlesOpen = 'true';
    trigger.setAttribute('aria-expanded', 'true');
    const selected = options.findIndex(option => option.dataset.filmLanguage === trigger.value);
    options[edge === 'last' ? options.length - 1 : edge === 'first' ? 0 : Math.max(0, selected)]?.focus({ preventScroll: true });
    root.dispatchEvent(new Event('film-subtitle-menu-change'));
  };
  for (const button of [trigger, ...options]) {
    on(button, 'click', event => event.preventDefault());
    on(button, 'keydown', event => {
      if (button.tagName !== 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        button.click();
      }
    });
  }
  options.forEach((option, index) => {
    on(option, 'click', () => {
      trigger.value = option.dataset.filmLanguage;
      trigger.dispatchEvent(new Event('change'));
      close(true);
    });
    on(option, 'keydown', event => {
      const next = event.key === 'ArrowDown' ? (index + 1) % options.length : event.key === 'ArrowUp' ? (index - 1 + options.length) % options.length : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); options[next].focus({ preventScroll: true }); }
    });
  });
  on(trigger, 'click', () => menu.hidden ? open() : close());
  on(trigger, 'keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open(event.key === 'ArrowUp' ? 'last' : undefined);
    }
  });
  on(root, 'keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); close(true); }
    if (event.key === 'Tab' && !menu.hidden) {
      event.preventDefault();
      close();
      const next = event.shiftKey ? trigger : root.querySelector('[data-film-fullscreen]');
      next?.focus({ preventScroll: true });
    }
  });
  on(document, 'pointerdown', event => {
    if (!menu.hidden && !menu.contains(event.target) && !trigger.contains(event.target)) close();
  });
  on(root, 'focusout', event => {
    if (!menu.hidden && !menu.contains(event.relatedTarget) && !trigger.contains(event.relatedTarget)) close();
  });
  on(trigger, 'change', sync);
  close();
  sync();
  return () => {
    abort.abort();
    close();
    trigger.removeAttribute('aria-controls');
    if (!originalId) menu.removeAttribute('id');
  };
}

export function initFilmSubtitles(root, video) {
  const selector = root.querySelector('[data-film-subtitles]');
  const overlay = root.querySelector('[data-film-caption]');
  const source = root.querySelector('[data-film-subtitle-data]');
  if (!selector || !overlay || !source) return () => {};
  const abort = new AbortController();
  const on = (node, event, handler) => node.addEventListener(event, handler, { signal: abort.signal });
  const tracks = JSON.parse(source.textContent).map(({ language, label, vtt }) => {
    const element = document.createElement('track');
    element.kind = 'subtitles';
    element.srclang = language;
    element.label = label;
    const url = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
    element.src = url;
    video.append(element);
    element.track.mode = 'disabled';
    return { element, url, language };
  });
  const render = () => {
    const selected = tracks.find(item => item.language === selector.value);
    const text = selected && !video.webkitDisplayingFullscreen
      ? Array.from(selected.element.track.activeCues || [], cue => cue.text).join('\n') : '';
    // One inline span lets the background follow each rendered line, including wrapping.
    const span = document.createElement('span');
    span.className = 'film-caption-text';
    span.textContent = text;
    overlay.replaceChildren(span);
    overlay.lang = selected?.language || '';
    overlay.dir = selected?.language === 'ar' ? 'rtl' : 'auto';
    overlay.hidden = !text;
  };
  const select = () => {
    tracks.forEach(({ element, language }) => {
      element.track.mode = language === selector.value ? (video.webkitDisplayingFullscreen ? 'showing' : 'hidden') : 'disabled';
    });
    render();
  };
  for (const { element } of tracks) {
    on(element, 'cuechange', render);
    on(element, 'error', () => {
      if (element.srclang === selector.value) {
        const status = root.querySelector('[data-film-status]');
        if (status) status.textContent = 'Subtitles could not load. Choose another language or try again.';
      }
    });
  }
  on(selector, 'change', select);
  on(video, 'webkitbeginfullscreen', select);
  on(video, 'webkitendfullscreen', select);
  on(video, 'seeked', render);
  selector.value = '';
  const disposeMenu = initFilmSubtitleMenu(root, selector);
  select();
  return () => {
    disposeMenu();
    abort.abort();
    tracks.forEach(({ element, url }) => {
      element.track.mode = 'disabled';
      element.remove();
      URL.revokeObjectURL(url);
    });
    selector.value = '';
    overlay.textContent = '';
    overlay.hidden = true;
  };
}

export function createFilmIdle({ eligible, render, delay = 2500, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let timer;
  let previous = false;
  const clear = () => { if (timer !== undefined) clearTimer(timer); timer = undefined; };
  const activity = () => {
    clear();
    render(false);
    previous = eligible();
    if (previous) timer = setTimer(() => { timer = undefined; if (eligible()) render(true); }, delay);
  };
  return {
    activity,
    sync() { if (eligible() !== previous) activity(); },
    dispose() { clear(); render(false); }
  };
}

export function formatFilmTime(value) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function initFilmPlayer(root) {
  if (root.dataset.filmReady) return () => {};
  const video = root.querySelector('[data-film-video]');
  const background = root.querySelector('[data-real-ai-background-video="film"]');
  const start = root.querySelector('[data-film-start]');
  const controls = root.querySelector('[data-film-controls]');
  const play = root.querySelector('[data-film-toggle]');
  const mute = root.querySelector('[data-film-mute]');
  const seek = root.querySelector('[data-film-seek]');
  const volume = root.querySelector('[data-film-volume]');
  const fullscreen = root.querySelector('[data-film-fullscreen]');
  const status = root.querySelector('[data-film-status]');
  if (![video, start, controls, play, mute, seek, volume, fullscreen, status].every(Boolean)) return () => {};
  const disposeSubtitles = initFilmSubtitles(root, video);
  const abort = new AbortController();
  const on = (node, event, handler) => node.addEventListener(event, handler, { signal: abort.signal });
  let started = false;
  let dragging = false;
  let previousVolume = 1;
  let pendingPlay = 0;
  let savedOverflow;
  let interacting = false;
  const isExpanded = () => document.fullscreenElement === root || video.webkitDisplayingFullscreen || root.dataset.filmExpanded === 'true';
  const idle = createFilmIdle({
    eligible: () => Boolean(started && isExpanded() && !video.paused && !interacting && root.dataset.filmSubtitlesOpen !== 'true'),
    render: hidden => { if (hidden) root.dataset.filmIdle = 'true'; else delete root.dataset.filmIdle; }
  });
  on(root, 'pointermove', idle.activity);
  on(root, 'pointerdown', () => { interacting = true; idle.activity(); });
  on(document, 'pointerup', () => { interacting = false; idle.activity(); });
  on(document, 'pointercancel', () => { interacting = false; idle.activity(); });
  on(root, 'keydown', idle.activity);
  on(root, 'focusin', idle.activity);
  on(root, 'film-subtitle-menu-change', idle.activity);
  const setExpanded = expanded => {
    if (expanded) {
      savedOverflow = document.body.style.overflow;
      root.dataset.filmExpanded = 'true';
      document.body.style.overflow = 'hidden';
    } else {
      delete root.dataset.filmExpanded;
      if (savedOverflow !== undefined) document.body.style.overflow = savedOverflow;
      savedOverflow = undefined;
    }
  };
  const icons = (button, name) => button.querySelectorAll('[data-film-icon]').forEach(icon => {
    icon.hidden = icon.dataset.filmIcon !== name;
  });
  const update = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    let bufferedEnd = current;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= current + .1) bufferedEnd = Math.max(bufferedEnd, video.buffered.end(i));
    }
    root.style.setProperty('--film-buffered', `${duration ? bufferedEnd / duration * 100 : 0}%`);
    if (!dragging) root.style.setProperty('--film-progress', `${duration ? current / duration * 100 : 0}%`);
    if (!dragging) seek.value = duration ? current / duration * 100 : 0;
    root.querySelector('[data-film-time]').textContent = `${formatFilmTime(current)} // ${formatFilmTime(Math.ceil(duration))}`;
    seek.setAttribute('aria-valuetext', `${formatFilmTime(current)} of ${formatFilmTime(Math.ceil(duration))}`);
    play.setAttribute('aria-label', video.paused ? (video.ended ? 'Replay film' : 'Play film') : 'Pause film');
    icons(play, video.paused ? 'play' : 'pause');
    root.dataset.filmPaused = String(video.paused);
    const silent = video.muted || video.volume === 0;
    mute.setAttribute('aria-label', silent ? 'Unmute film' : 'Mute film');
    mute.setAttribute('aria-pressed', String(silent));
    icons(mute, silent ? 'mute' : 'sound');
    volume.value = silent ? 0 : video.volume * 100;
    volume.style.setProperty('--film-volume', `${volume.value}%`);
    const expanded = isExpanded();
    icons(fullscreen, expanded ? 'exitfullscreen' : 'fullscreen');
    fullscreen.setAttribute('aria-label', expanded ? 'Exit fullscreen' : 'Enter fullscreen');
    idle.sync();
  };
  const attemptPlay = () => {
    const attempt = ++pendingPlay;
    status.textContent = '';
    if (video.error) video.load();
    video.playsInline = true;
    const promise = video.play();
    promise?.catch(error => {
      if (attempt !== pendingPlay || error.name === 'AbortError') return;
      status.textContent = 'Playback could not start. Press Play to try again.';
      update();
    });
  };
  const begin = () => {
    if (started) return;
    started = true;
    root.dataset.filmStarted = 'true';
    background?.pause();
    start.hidden = true;
    controls.inert = false;
    controls.removeAttribute('aria-hidden');
    video.removeAttribute('aria-hidden');
    video.muted = false;
    video.loop = false;
    video.playsInline = true;
    attemptPlay();
    play.focus({ preventScroll: true });
  };
  const toggle = () => {
    if (!started) return begin();
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      attemptPlay();
    } else {
      pendingPlay++;
      video.pause();
    }
  };
  for (const button of [start, play, mute, fullscreen]) {
    on(button, 'click', event => event.preventDefault());
    on(button, 'keydown', event => {
      if (button.tagName !== 'BUTTON' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        button.click();
      }
    });
  }
  on(start, 'click', begin);
  on(play, 'click', toggle);
  on(video, 'click', toggle);
  on(mute, 'click', () => {
    if (video.volume === 0) video.volume = previousVolume || 1;
    video.muted = !video.muted;
    update();
  });
  on(volume, 'input', () => {
    const value = Math.min(1, Math.max(0, Number(volume.value) / 100));
    video.volume = value;
    video.muted = value === 0;
    if (value) previousVolume = value;
    update();
  });
  on(seek, 'pointerdown', () => { dragging = true; });
  on(document, 'pointerup', () => { dragging = false; update(); });
  on(seek, 'input', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Number(seek.value) / 100 * video.duration;
      root.style.setProperty('--film-progress', `${seek.value}%`);
      update();
    }
  });
  on(seek, 'change', () => { dragging = false; update(); });
  on(fullscreen, 'click', async () => {
    status.textContent = '';
    try {
      if (root.dataset.filmExpanded === 'true') setExpanded(false);
      else if (document.fullscreenElement) await document.exitFullscreen();
      else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
      else if (root.requestFullscreen) await root.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else setExpanded(true);
    } catch { setExpanded(true); }
    update();
  });
  on(document, 'keydown', event => {
    if (event.key === 'Escape' && root.dataset.filmExpanded === 'true') {
      setExpanded(false);
      update();
      fullscreen.focus({ preventScroll: true });
    }
  });
  for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'progress', 'play', 'pause', 'ended', 'volumechange', 'seeked', 'webkitbeginfullscreen', 'webkitendfullscreen']) on(video, event, update);
  on(document, 'fullscreenchange', update);
  on(video, 'error', () => {
    status.textContent = 'The film could not load. Press Play to try again.';
    update();
  });
  controls.inert = true;
  controls.setAttribute('aria-hidden', 'true');
  root.dataset.filmReady = 'true';
  update();
  return () => {
    pendingPlay++;
    abort.abort();
    disposeSubtitles();
    idle.dispose();
    video.pause();
    setExpanded(false);
    delete root.dataset.filmReady;
    delete root.dataset.filmStarted;
    delete root.dataset.filmPaused;
    start.hidden = false;
    controls.inert = true;
    controls.setAttribute('aria-hidden', 'true');
    video.setAttribute('aria-hidden', 'true');
    root.style.removeProperty('--film-progress');
    root.style.removeProperty('--film-buffered');
  };
}

export function init(root = document) {
  const disposers = Array.from(root.querySelectorAll('[data-film-player]'), initFilmPlayer);
  return () => disposers.forEach(dispose => dispose());
}
