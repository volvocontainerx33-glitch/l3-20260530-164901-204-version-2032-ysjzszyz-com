
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function setupHeader() {
    const header = qs('[data-site-header]');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setupMenu() {
    const btn = qs('[data-menu-btn]');
    const nav = qs('[data-site-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    qsa('a', nav).forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  function setupHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) return;
    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    if (!slides.length) return;
    let idx = 0;
    let timer = null;

    function render(nextIdx) {
      idx = (nextIdx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }
    function play() {
      pause();
      timer = window.setInterval(() => render(idx + 1), 5000);
    }
    function pause() { if (timer) window.clearInterval(timer); timer = null; }

    if (prev) prev.addEventListener('click', () => { render(idx - 1); play(); });
    if (next) next.addEventListener('click', () => { render(idx + 1); play(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { render(i); play(); }));
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', play);
    render(0);
    play();
  }

  function setupFilters() {
    qsa('[data-filter-form]').forEach(form => {
      const input = qs('[data-filter-input]', form);
      const select = qs('[data-filter-select]', form);
      const items = qsa('[data-filter-item]', document);
      const count = qs('[data-filter-count]', form);
      if (!input && !select) return;

      function match(item, text, type) {
        const hay = (item.getAttribute('data-search-text') || item.textContent || '').toLowerCase();
        const itemType = (item.getAttribute('data-type') || '').toLowerCase();
        const itemBucket = (item.getAttribute('data-bucket') || '').toLowerCase();
        const okText = !text || hay.includes(text);
        const okType = !type || type === 'all' || itemType.includes(type.toLowerCase()) || itemBucket.includes(type.toLowerCase());
        return okText && okType;
      }

      function apply() {
        const text = (input ? input.value : '').trim().toLowerCase();
        const type = select ? select.value : 'all';
        let visible = 0;
        items.forEach(item => {
          const show = match(item, text, type);
          item.classList.toggle('hidden', !show);
          if (show) visible += 1;
        });
        if (count) count.textContent = visible.toLocaleString();
      }

      if (input) input.addEventListener('input', apply);
      if (select) select.addEventListener('change', apply);
      apply();
    });
  }

  function setupBackTop() {
    const btn = qs('[data-backtop]');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const onScroll = () => btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupMenu();
    setupHeroCarousel();
    setupFilters();
    setupBackTop();
  });
})();
