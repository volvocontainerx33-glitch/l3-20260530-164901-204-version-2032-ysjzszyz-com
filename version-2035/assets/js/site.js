(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    });

    document.querySelectorAll(".rail-shell").forEach(function (shell) {
        var rail = shell.querySelector("[data-rail]");
        var prev = shell.querySelector("[data-rail-prev]");
        var next = shell.querySelector("[data-rail-next]");

        function move(direction) {
            if (!rail) {
                return;
            }
            rail.scrollBy({ left: direction * 420, behavior: "smooth" });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
            });
        }
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var root = panel.parentElement;
        var grid = root ? root.querySelector("[data-filter-grid]") : null;
        var emptyState = root ? root.querySelector("[data-empty-state]") : null;
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");

        function getText(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function applyFilters() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = getText(card);
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && card.getAttribute("data-region") !== region) {
                    matched = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    matched = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
}());

function initPlayer(videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var started = false;

    if (!video || !overlay || !url) {
        return;
    }

    function attach() {
        if (started) {
            return;
        }
        started = true;
        overlay.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {
                overlay.classList.remove("is-hidden");
                started = false;
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    overlay.classList.remove("is-hidden");
                    started = false;
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    hls.destroy();
                    hls = null;
                    video.src = url;
                }
            });
            return;
        }

        video.src = url;
        video.play().catch(function () {
            overlay.classList.remove("is-hidden");
            started = false;
        });
    }

    overlay.addEventListener("click", attach);
    video.addEventListener("click", function () {
        if (!started) {
            attach();
        }
    });
}
