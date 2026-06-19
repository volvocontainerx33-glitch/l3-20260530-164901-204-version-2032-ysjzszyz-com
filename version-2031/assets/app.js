(function () {
    var header = document.querySelector('[data-header]');
    var nav = document.querySelector('[data-nav]');
    var navToggle = document.querySelector('[data-nav-toggle]');

    function onScroll() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startHero();
            });
        }

        startHero();
    }

    var listPage = document.querySelector('[data-list-page]');
    if (listPage) {
        var input = document.querySelector('[data-local-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
        var activeCategory = 'all';
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function filterCards() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = activeCategory === 'all' || category === activeCategory;
                var show = matchQuery && matchCategory;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-category') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                filterCards();
            });
        });

        filterCards();
    }

    function attachPlayer(box) {
        var video = box.querySelector('video[data-stream]');
        var trigger = box.querySelector('[data-play-trigger]');
        if (!video || !trigger) {
            return;
        }

        function prepareVideo() {
            var streamUrl = video.getAttribute('data-stream');
            if (!streamUrl || video.getAttribute('data-ready') === '1') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = streamUrl;
            }
            video.setAttribute('data-ready', '1');
        }

        function playVideo() {
            prepareVideo();
            trigger.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    trigger.classList.remove('is-hidden');
                });
            }
        }

        trigger.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                trigger.classList.remove('is-hidden');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
