import { initFilmPlayer } from './player.js';

export function initCMSVideos({ root = document, markup, initPlayer = initFilmPlayer, observe = true } = {}) {
  const selector = '[data-stitch-video="real-ai"]';
  const mounted = new Map();
  const mount = scope => {
    const markers = [...(scope.matches?.(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
    for (const marker of markers) {
      if (mounted.has(marker) || marker.hasAttribute('data-film-ready')) continue;
      const originalHTML = marker.innerHTML;
      const originalClass = marker.getAttribute('class');
      marker.classList.add('stitch-cms-video');
      marker.setAttribute('data-film-player', 'true');
      marker.innerHTML = markup;
      const dispose = initPlayer(marker);
      mounted.set(marker, () => {
        dispose();
        marker.innerHTML = originalHTML;
        marker.removeAttribute('data-film-player');
        if (originalClass === null) marker.removeAttribute('class');
        else marker.setAttribute('class', originalClass);
      });
      const background = marker.querySelector('[data-real-ai-background-video="film"]');
      if (background) {
        background.muted = true;
        background.defaultMuted = true;
        background.loop = true;
        background.autoplay = true;
        background.playsInline = true;
        background.play()?.catch(() => {});
      }
    }
  };
  mount(root);
  const observer = observe ? new MutationObserver(records => {
    for (const [marker, dispose] of mounted) {
      if (!marker.isConnected) { mounted.delete(marker); dispose(); }
    }
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector))) mount(node);
      }
    }
    for (const [marker, dispose] of mounted) {
      if (!marker.isConnected) { dispose(); mounted.delete(marker); }
    }
  }) : null;
  observer?.observe(root.body || root, { childList: true, subtree: true });
  return () => {
    observer?.disconnect();
    for (const dispose of mounted.values()) dispose();
    mounted.clear();
  };
}
