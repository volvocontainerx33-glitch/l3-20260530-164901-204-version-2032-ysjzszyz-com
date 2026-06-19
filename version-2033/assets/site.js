function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (button && mobileNav) {
        button.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    initHeroCarousel();
    initCardTools();
});

function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
        return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
        });
    }

    window.setInterval(function () {
        show(index + 1);
    }, 6200);
}

function initCardTools() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
        return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-card-search]");
    var sort = document.querySelector("[data-card-sort]");

    function applySearch() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
            var terms = (card.getAttribute("data-terms") || "").toLowerCase();
            card.style.display = !keyword || terms.indexOf(keyword) !== -1 ? "" : "none";
        });
    }

    function applySort() {
        var value = sort ? sort.value : "default";
        var sorted = cards.slice();
        if (value === "year-desc") {
            sorted.sort(function (a, b) {
                return Number(b.dataset.year) - Number(a.dataset.year);
            });
        }
        if (value === "year-asc") {
            sorted.sort(function (a, b) {
                return Number(a.dataset.year) - Number(b.dataset.year);
            });
        }
        if (value === "title-asc") {
            sorted.sort(function (a, b) {
                return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
            });
        }
        sorted.forEach(function (card) {
            list.appendChild(card);
        });
    }

    if (search) {
        search.addEventListener("input", applySearch);
    }

    if (sort) {
        sort.addEventListener("change", function () {
            applySort();
            applySearch();
        });
    }
}

function initMoviePlayer(src) {
    ready(function () {
        var video = document.getElementById("moviePlayer");
        var button = document.querySelector("[data-play-button]");
        if (!video || !button || !src) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function playVideo() {
            loadVideo();
            button.classList.add("hide");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("hide");
                });
            }
        }

        button.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("hide");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("hide");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}
