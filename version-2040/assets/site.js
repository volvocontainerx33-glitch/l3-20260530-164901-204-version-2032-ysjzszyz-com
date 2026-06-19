
(function () {
  const SITE_TITLE = "日韩精选影片";

  function q(selector, root = document) {
    return root.querySelector(selector);
  }

  function qa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function currentPath() {
    return location.pathname.replace(/\/index\.html?$/i, "/").replace(/\/+$/, "/");
  }

  function setActiveNav() {
    const path = currentPath();
    qa("[data-nav-link]").forEach((link) => {
      const target = new URL(link.getAttribute("href"), location.href).pathname.replace(/\/+$/, "/");
      if (path === target) {
        link.classList.add("active");
      }
    });
  }

  function setupMobileMenu() {
    const toggle = q("[data-mobile-toggle]");
    const panel = q("[data-mobile-nav]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
      panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });
  }

  function getCardText(card) {
    return (card.getAttribute("data-title") || "") + " " +
      (card.getAttribute("data-keywords") || "") + " " +
      (card.textContent || "");
  }

  function posterForItem(item) {
    const seed = String(item.id || item.title || "0");
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const colors = [
      ["#1f2937", "#b45309"],
      ["#312e81", "#f59e0b"],
      ["#065f46", "#0f172a"],
      ["#7c2d12", "#1e40af"],
      ["#5b21b6", "#b45309"]
    ];
    const pair = colors[h % colors.length];
    const title = String(item.title || "影片").slice(0, 16);
    const region = String(item.region || "");
    const year = String(item.year || "");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${pair[0]}"/>
            <stop offset="100%" stop-color="${pair[1]}"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="36" fill="url(#g)"/>
        <text x="60" y="180" fill="#fff" font-size="44" font-weight="700" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">${title}</text>
        <text x="60" y="240" fill="#fff" fill-opacity=".8" font-size="28" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">${region} · ${year}</text>
        <text x="60" y="980" fill="#fff" fill-opacity=".72" font-size="26" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">日韩精选影片</text>
      </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function setupFilters() {
    qa("[data-filter-panel]").forEach((panel) => {
      const input = q("[data-filter-input]", panel);
      const selects = qa("select[data-filter-select]", panel);
      const cards = qa("[data-filter-item]", document);
      if (!input && selects.length === 0) return;

      const apply = () => {
        const term = (input && input.value || "").trim().toLowerCase();
        const year = selects.find((s) => s.name === "year")?.value || "";
        const region = selects.find((s) => s.name === "region")?.value || "";
        const type = selects.find((s) => s.name === "type")?.value || "";
        let visible = 0;
        cards.forEach((card) => {
          const text = getCardText(card).toLowerCase();
          const cardYear = card.getAttribute("data-year") || "";
          const cardRegion = card.getAttribute("data-region") || "";
          const cardType = card.getAttribute("data-type") || "";
          const ok =
            (!term || text.includes(term)) &&
            (!year || cardYear === year) &&
            (!region || cardRegion === region) &&
            (!type || cardType === type);
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        const counter = q("[data-filter-count]", panel);
        if (counter) counter.textContent = String(visible);
      };

      if (input) input.addEventListener("input", apply);
      selects.forEach((s) => s.addEventListener("change", apply));
      apply();
    });
  }

  function setupCarousels() {
    qa("[data-carousel]").forEach((carousel) => {
      const track = q("[data-carousel-track]", carousel);
      const prev = q("[data-carousel-prev]", carousel);
      const next = q("[data-carousel-next]", carousel);
      if (!track) return;

      const step = () => Math.max(track.clientWidth * 0.72, 280);

      const move = (dir) => {
        track.scrollBy({ left: dir * step(), behavior: "smooth" });
      };

      if (prev) prev.addEventListener("click", () => move(-1));
      if (next) next.addEventListener("click", () => move(1));

      let timer = window.setInterval(() => {
        if (document.hidden) return;
        const maxScroll = track.scrollWidth - track.clientWidth - 4;
        if (maxScroll <= 0) return;
        if (track.scrollLeft >= maxScroll) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          move(1);
        }
      }, 5200);

      track.addEventListener("mouseenter", () => window.clearInterval(timer), { once: true });
      track.addEventListener("touchstart", () => window.clearInterval(timer), { once: true });
    });
  }

  function setupPlayers() {
    qa("video[data-hls]").forEach((video) => {
      const hlsUrl = video.getAttribute("data-hls");
      const mp4Url = video.getAttribute("data-mp4") || video.getAttribute("src");
      if (hlsUrl && video.canPlayType && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
      } else if (mp4Url) {
        video.src = mp4Url;
      }
      video.preload = "metadata";
      video.playsInline = true;
      video.setAttribute("controls", "controls");
    });
  }

  function makeCard(item, basePath) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = item.path;
    a.setAttribute("data-filter-item", "1");
    a.setAttribute("data-title", item.title);
    a.setAttribute("data-keywords", [
      item.title,
      item.region,
      item.type,
      item.genre,
      (item.tags || []).join(" "),
      item.year,
      item.bucket || ""
    ].join(" "));
    a.setAttribute("data-year", item.year);
    a.setAttribute("data-region", item.region);
    a.setAttribute("data-type", item.type);
    const poster = item.poster || posterForItem(item);
    a.innerHTML = `
      <div class="card-media">
        <img src="${poster}" alt="${item.title}">
        <div class="overlay">
          <span class="rank-pill">${item.year}</span>
          <span class="badge">${item.region}</span>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title clamp-2">${item.title}</h3>
        <div class="card-meta">
          <span>${item.type}</span>
          <span>${item.genre}</span>
        </div>
        <p class="card-text clamp-3">${item.oneLine || ""}</p>
      </div>
    `;
    return a;
  }

  function setupSearchPage() {
    const mount = q("#search-results");
    const input = q("#global-search");
    const sort = q("#search-sort");
    const counter = q("#search-count");
    const data = window.MOVIE_INDEX || [];
    if (!mount || !input || !sort) return;

    function match(item, term) {
      if (!term) return true;
      const text = [
        item.title,
        item.region,
        item.type,
        item.genre,
        item.year,
        (item.tags || []).join(" "),
        item.oneLine || "",
        item.category || ""
      ].join(" ").toLowerCase();
      return text.includes(term.toLowerCase());
    }

    function score(item) {
      const h = parseInt(String(item.id).slice(-2), 10) || 0;
      return item.year * 100 + h;
    }

    function render() {
      const term = input.value.trim();
      const items = data
        .filter((item) => match(item, term))
        .sort((a, b) => {
          if (sort.value === "year-asc") return a.year - b.year;
          if (sort.value === "title") return a.title.localeCompare(b.title, "zh-Hans-CN");
          return score(b) - score(a);
        })
        .slice(0, 240);

      mount.innerHTML = "";
      items.forEach((item, index) => {
        const el = document.createElement("a");
        el.className = "card";
        el.href = item.path;
        el.innerHTML = `
          <div class="card-media">
            <img src="${item.poster || posterForItem(item)}" alt="${item.title}">
            <div class="overlay">
              <span class="rank-pill">${String(index + 1).padStart(2, "0")}</span>
              <span class="badge">${item.year}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title clamp-2">${item.title}</h3>
            <div class="card-meta">
              <span>${item.region}</span>
              <span>${item.type}</span>
              <span>${item.genre}</span>
            </div>
            <p class="card-text clamp-3">${item.oneLine || ""}</p>
          </div>
        `;
        mount.appendChild(el);
      });

      if (counter) {
        counter.textContent = String(items.length);
      }
    }

    const params = new URLSearchParams(location.search);
    if (params.get("q")) input.value = params.get("q");
    render();
    input.addEventListener("input", render);
    sort.addEventListener("change", render);
  }

  function setupLazyPosterFallback() {
    qa("img[data-poster-alt]").forEach((img) => {
      img.addEventListener("error", () => {
        const title = img.getAttribute("data-title") || SITE_TITLE;
        const region = img.getAttribute("data-region") || "";
        const year = img.getAttribute("data-year") || "";
        const bg1 = img.getAttribute("data-bg1") || "#1f2937";
        const bg2 = img.getAttribute("data-bg2") || "#b45309";
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${bg1}"/>
                <stop offset="100%" stop-color="${bg2}"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" rx="36" fill="url(#g)"/>
            <text x="60" y="200" fill="#fff" font-size="44" font-weight="700" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">${title}</text>
            <text x="60" y="250" fill="#fff" fill-opacity=".82" font-size="28" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">${region} · ${year}</text>
            <text x="60" y="980" fill="#fff" fill-opacity=".75" font-size="26" font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">${SITE_TITLE}</text>
          </svg>`;
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMobileMenu();
    setupFilters();
    setupCarousels();
    setupPlayers();
    setupSearchPage();
    setupLazyPosterFallback();
  });
})();
