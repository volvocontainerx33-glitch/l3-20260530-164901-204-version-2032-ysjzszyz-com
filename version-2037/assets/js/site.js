
(function () {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  const debounce = (fn, wait = 160) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initMobileNav() {
    const btn = qs("[data-mobile-toggle]");
    const panel = qs("[data-mobile-panel]");
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });
    qsa("[data-close-mobile]").forEach((el) => {
      el.addEventListener("click", () => {
        panel.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHeroCarousel() {
    const wrap = qs("[data-carousel]");
    if (!wrap) return;
    const slides = qsa(".hero-slide", wrap);
    const dots = qsa("[data-carousel-dot]", wrap);
    const prev = qs("[data-carousel-prev]", wrap);
    const next = qs("[data-carousel-next]", wrap);
    if (!slides.length) return;
    let idx = 0;
    let timer = null;

    const activate = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === idx));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
    };

    const go = (step) => {
      activate(idx + step);
      restart();
    };

    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => activate(idx + 1), 5000);
    };

    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => {
      activate(i);
      restart();
    }));
    activate(0);
    restart();
  }

  function highlightCardList() {
    qsa("[data-hover-card]").forEach((card) => {
      card.addEventListener("mouseenter", () => card.classList.add("hover"));
      card.addEventListener("mouseleave", () => card.classList.remove("hover"));
    });
  }

  function initVideoPlayer() {
    const video = qs("[data-player]");
    if (!video) return;

    const m3u8 = video.dataset.m3u8 || "";
    const mp4 = video.dataset.mp4 || "";
    const poster = video.getAttribute("poster") || "";

    const applySource = (src, type) => {
      if (src) {
        video.src = src;
        video.dataset.loaded = "1";
      }
    };

    if (m3u8) {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_evt, data) {
          if (data && data.fatal && mp4) {
            applySource(mp4, "video/mp4");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        applySource(m3u8, "application/vnd.apple.mpegurl");
      } else if (mp4) {
        applySource(mp4, "video/mp4");
      }
    } else if (mp4) {
      applySource(mp4, "video/mp4");
    }

    const btn = qs("[data-play-button]");
    if (btn) {
      btn.addEventListener("click", () => {
        video.play().catch(() => {});
      });
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }
  }

  function initClientFilter() {
    const search = qs("[data-filter-input]");
    const cards = qsa("[data-filter-card]");
    const empty = qs("[data-filter-empty]");
    const count = qs("[data-filter-count]");
    const chips = qsa("[data-filter-chip]");
    const sort = qs("[data-filter-sort]");
    const scope = qs("[data-filter-scope]");

    if (!search || !cards.length) return;

    let activeChip = "all";
    const getCardScore = (card) => Number(card.dataset.score || "0");

    const apply = () => {
      const q = (search.value || "").trim().toLowerCase();
      const sortMode = sort ? sort.value : "hot";
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        const chip = card.dataset.group || "";
        const matchesQ = !q || text.includes(q);
        const matchesChip = activeChip === "all" || chip === activeChip;
        const show = matchesQ && matchesChip;
        card.style.display = show ? "" : "none";
        if (show) visible += 1;
      });

      if (sortMode && cards.length > 1) {
        const list = cards.map((card) => ({
          el: card,
          score: getCardScore(card),
          year: Number(card.dataset.year || "0"),
          title: card.dataset.title || "",
        }));
        list.sort((a, b) => {
          if (sortMode === "year") return b.year - a.year || b.score - a.score;
          if (sortMode === "title") return a.title.localeCompare(b.title, "zh-Hans-CN");
          return b.score - a.score || b.year - a.year;
        });
        list.forEach(({ el }) => el.parentElement && el.parentElement.appendChild(el));
      }

      if (count) count.textContent = String(visible);
      if (empty) empty.hidden = visible !== 0;
      if (scope) scope.textContent = activeChip === "all" ? "全部" : activeChip;
    };

    search.addEventListener("input", debounce(apply, 120));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        activeChip = chip.dataset.value || "all";
        apply();
      });
    });
    if (sort) sort.addEventListener("change", apply);
    apply();
  }

  function initSearchPage() {
    const root = qs("[data-search-app]");
    if (!root) return;
    const input = qs("[data-search-input]", root);
    const results = qs("[data-search-results]", root);
    const total = qs("[data-search-total]", root);
    const hint = qs("[data-search-hint]", root);
    const sort = qs("[data-search-sort]", root);
    const chips = qsa("[data-search-chip]", root);
    if (!input || !results) return;

    const dataUrl = root.dataset.moviesUrl;
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q && !input.value) input.value = q;
    } catch (e) {}
    let movies = [];
    let active = "all";

    const render = (list) => {
      results.innerHTML = list.map((movie) => `
        <a class="movie-card" href="${movie.url}" data-filter-card data-group="${movie.theme}" data-title="${movie.title}" data-year="${movie.year}" data-score="${movie.score}" data-search="${movie.search}">
          <div class="poster" style="${movie.posterStyle}">
            <span class="poster-badge">${movie.year} · ${movie.type}</span>
            <div class="poster-mark">${movie.mark}</div>
            <div class="poster-copy">
              ${movie.posterLines.map((line) => `<div class="poster-title-line">${line}</div>`).join("")}
            </div>
            <div class="poster-foot">${movie.region} · ${movie.genre}</div>
          </div>
          <div class="movie-card-body">
            <h3>${movie.title}</h3>
            <p class="movie-meta">${movie.type} · ${movie.region} · ${movie.year}</p>
            <p class="movie-desc">${movie.one_line}</p>
          </div>
        </a>
      `).join("");
      total.textContent = String(list.length);
      if (hint) hint.hidden = list.length > 0;
    };

    const filter = () => {
      const q = input.value.trim().toLowerCase();
      const mode = sort ? sort.value : "hot";
      let list = movies.filter((m) => (active === "all" || m.theme === active) && (!q || m.search.includes(q)));
      list.sort((a, b) => {
        if (mode === "year") return b.year - a.year || b.score - a.score;
        if (mode === "title") return a.title.localeCompare(b.title, "zh-Hans-CN");
        return b.score - a.score || b.year - a.year;
      });
      render(list.slice(0, 400));
    };

    fetch(dataUrl)
      .then((r) => r.json())
      .then((data) => {
        movies = data;
        filter();
      })
      .catch(() => {
        hint.hidden = false;
        hint.textContent = "影片数据加载失败，请检查 assets/data/movies.json。";
      });

    input.addEventListener("input", debounce(filter, 120));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        active = chip.dataset.value || "all";
        filter();
      });
    });
    if (sort) sort.addEventListener("change", filter);
  }

  ready(() => {
    initMobileNav();
    initHeroCarousel();
    highlightCardList();
    initVideoPlayer();
    initClientFilter();
    initSearchPage();
  });
})();
