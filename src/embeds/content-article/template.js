(() => {
  function initializeArticle(article) {
    const body = article.querySelector('.content-article-body .w-richtext');
    const intro = article.querySelector('.content-article-intro');
    const toc = article.querySelector('.content-article-toc');
    const list = toc?.querySelector('ol');
    const trigger = toc?.querySelector('.content-article-toc-trigger');
    const caption = trigger?.querySelector('.content-article-toc-caption');
    const value = trigger?.querySelector('.content-article-toc-value');
    const compact = window.matchMedia('(max-width: 991px)');
    if (!body || !intro || !list || article.hasAttribute('data-content-article-initialized')) return;
    article.setAttribute('data-content-article-initialized', '');

    const readTime = article.querySelector('[data-content-article-read-time="minutes"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const navbar = document.querySelector('.header-fix, .navbar');
    const locale = document.documentElement.lang || undefined;
    const segmenter = window.Intl?.Segmenter && new Intl.Segmenter(locale, { granularity: 'word' });
    const minuteFormat = new Intl.NumberFormat(locale);
    let sections = [];
    let links = [];
    let active = -1;
    let frame;
    let fragmentRestored = false;
    let labels = [];
    let selection;

    function showValue(label) {
      if (value?.firstChild?.nodeType === Node.TEXT_NODE) value.firstChild.nodeValue = label;
      else if (value) value.textContent = label;
    }

    function setMenu(open) {
      trigger?.setAttribute('aria-expanded', String(open));
      toc.classList.toggle('content-article-toc-open', open);
      list.inert = compact.matches && !open;
    }

    function jumpTo(section, smooth) {
      section.scrollIntoView({
        block: 'start',
        behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant',
      });
    }

    if (trigger) {
      list.id ||= 'content-article-toc-links';
      trigger.setAttribute('aria-controls', list.id);
      if (trigger.tagName !== 'BUTTON') {
        trigger.setAttribute('role', 'button');
        trigger.addEventListener('keydown', event => {
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          if (!event.repeat) trigger.click();
        });
      }
      trigger.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        setMenu(trigger.getAttribute('aria-expanded') !== 'true');
      });
      setMenu(false);
      toc.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || trigger.getAttribute('aria-expanded') !== 'true') return;
        event.preventDefault();
        setMenu(false);
        trigger.focus({ preventScroll: true });
      });
      document.addEventListener('pointerdown', event => {
        if (!toc.contains(event.target)) setMenu(false);
      });
      toc.addEventListener('focusout', event => {
        if (!toc.contains(event.relatedTarget)) setMenu(false);
      });
      compact.addEventListener('change', () => {
        setMenu(false);
        updateOffsets();
      });
    }

    function sizeMenu() {
      if (!trigger || !labels.length) return;
      const font = getComputedStyle(trigger);
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return;
      context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
      const longest = Math.max(...labels.map(label => context.measureText(label).width));
      const captionWidth = context.measureText(caption?.textContent || '').width;
      toc.style.setProperty('--content-article-toc-label-width', Math.ceil(longest + captionWidth) + 'px');
    }

    function refreshArticle() {
      const text = body.innerText.trim();
      const headings = [...body.querySelectorAll('h2')].filter(heading => heading.textContent.trim());
      toc.hidden = headings.length === 0;
      if (toc.hidden) setMenu(false);
      sections = toc.hidden ? [] : [intro, ...headings];
      labels = sections.map((section, index) => index === 0 ? 'Introduction' : section.textContent.trim());
      const existingIds = new Set([...document.querySelectorAll('[id]')].map(element => element.id));
      list.replaceChildren();
      active = -1;

      links = sections.map((section, index) => {
        const label = labels[index];
        if (!section.id) {
          const slug = label.normalize('NFKC').toLowerCase()
            .replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
          let id = slug;
          for (let suffix = 2; existingIds.has(id); suffix++) id = slug + '-' + suffix;
          existingIds.add(id);
          section.id = id;
        }
        if (!section.hasAttribute('tabindex')) section.tabIndex = -1;

        const link = document.createElement('a');
        link.className = 'content-article-toc-link';
        link.href = '#' + encodeURIComponent(section.id);
        link.textContent = label;
        const item = document.createElement('li');
        item.className = 'content-article-toc-item';
        item.append(link);
        list.append(item);
        link.addEventListener('click', event => {
          if (event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.defaultPrevented) return;
          event.preventDefault();
          event.stopPropagation();
          if (compact.matches) {
            list.querySelector('[data-content-article-toc-selected]')?.removeAttribute('data-content-article-toc-selected');
            selection = section.id;
            link.setAttribute('data-content-article-toc-selected', '');
            showValue(label);
          }
          setMenu(false);
          // Keep fragment history on the published page. Preview uses an embedded canvas.
          if (window.self === window.top && location.hash !== link.hash) history.pushState(null, '', link.hash);
          if (event.detail === 0) section.focus({ preventScroll: true });
          jumpTo(section, true);
        });
        return link;
      });
      const selectedIndex = sections.findIndex(section => section.id === selection);
      if (selectedIndex >= 0) {
        links[selectedIndex].setAttribute('data-content-article-toc-selected', '');
        showValue(labels[selectedIndex]);
      } else {
        selection = undefined;
      }

      let words = 0;
      if (segmenter) {
        for (const part of segmenter.segment(text)) {
          if (part.isWordLike) words++;
        }
      } else {
        words = (text.match(/[\p{L}\p{N}]+/gu) || []).length;
      }
      if (readTime) {
        const minutes = Math.max(1, Math.round(words / 200));
        const formatted = minuteFormat.format(minutes) + '\u00a0';
        if (readTime.firstChild?.nodeType === Node.TEXT_NODE) readTime.firstChild.nodeValue = formatted;
        else readTime.textContent = formatted;
      }

      if (!fragmentRestored && links.length) {
        fragmentRestored = true;
        try {
          if (location.hash) {
            const id = decodeURIComponent(location.hash.slice(1));
            const target = sections.find(section => section.id === id);
            if (target) jumpTo(target, false);
          }
        } catch {
          // A malformed fragment is unrelated to the article anchors.
        }
      }
      sizeMenu();
      updateOffsets();
    }

    const copy = article.querySelector('[data-content-article-copy-url]');
    const label = copy?.querySelector('[data-content-article-copy-label]');
    if (copy && label) {
      const original = label.textContent;
      label.setAttribute('aria-live', 'polite');
      copy.setAttribute('role', 'button');
      copy.addEventListener('keydown', event => {
        if (event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) copy.click();
      });
      let reset;
      copy.addEventListener('click', async event => {
        event.preventDefault();
        clearTimeout(reset);
        let result;
        try {
          await copyUrl();
          result = 'success';
        } catch {
          result = 'error';
        }
        const message = copy.querySelector(`[data-content-article-copy-${result}]`)?.textContent.trim();
        label.textContent = message || original;
        reset = setTimeout(() => { label.textContent = original; }, 2200);
      });
    }

    function update() {
      frame = undefined;
      if (!links.length) return;
      const offset = (parseFloat(getComputedStyle(sections[1] || intro).scrollMarginTop) || 0) + 1;
      const index = Math.max(0, sections.findLastIndex(section => section.getBoundingClientRect().top <= offset));
      if (index !== active) {
        links[active]?.removeAttribute('aria-current');
        links[index].setAttribute('aria-current', 'location');
        active = index;
        if (!selection) showValue(labels[index]);
      }
      if (compact.matches || !list.clientHeight) return;
      const rowBottom = links[index].parentElement.getBoundingClientRect().bottom;
      const rail = list.getBoundingClientRect();
      list.style.setProperty('--content-article-progress', (rowBottom - rail.top) / rail.height);
    }

    function scheduleUpdate() {
      if (frame === undefined) frame = requestAnimationFrame(update);
    }

    function updateOffsets() {
      const navbarHeight = navbar?.getBoundingClientRect().height || 0;
      article.style.setProperty('--content-article-anchor-offset', `calc(${navbarHeight}px + 1rem)`);
      article.style.setProperty('--content-article-heading-offset', `calc(${navbarHeight}px + 2rem)`);
      scheduleUpdate();
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', updateOffsets);
    document.fonts?.ready.then(sizeMenu);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(updateOffsets);
      observer.observe(article);
      observer.observe(list);
      if (navbar) observer.observe(navbar);
    }

    // Designer Preview can populate the CMS rich text after the embed first runs.
    new MutationObserver(refreshArticle).observe(body, { childList: true, characterData: true, subtree: true });
    updateOffsets();
    refreshArticle();
  }

  async function copyUrl() {
    // Try the synchronous copy while user activation is available in Preview.
    if (window.self === window.top && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(location.href);
        return;
      } catch { /* Try the selection-based fallback. */ }
    }
    const field = document.createElement('textarea');
    const focused = document.activeElement;
    field.value = location.href;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;inset:0 auto auto 0;opacity:0';
    document.body.append(field);
    try {
      field.select();
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
    } finally {
      field.remove();
      focused?.focus({ preventScroll: true });
    }
  }

  function initialize() {
    document.querySelectorAll('.content-article').forEach(initializeArticle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
