(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navPanel = document.querySelector('.nav-panel');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-scroll-wrap]').forEach(function (wrap) {
    var row = wrap.querySelector('[data-scroll-row]');
    var left = wrap.querySelector('[data-scroll-left]');
    var right = wrap.querySelector('[data-scroll-right]');

    if (!row) {
      return;
    }

    if (left) {
      left.addEventListener('click', function () {
        row.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        row.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var typeValue = filterSelect ? filterSelect.value.trim() : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var typeText = card.getAttribute('data-type') || '';
      var passKeyword = !keyword || text.indexOf(keyword) !== -1;
      var passType = !typeValue || typeText.indexOf(typeValue) !== -1 || text.indexOf(typeValue.toLowerCase()) !== -1;
      card.classList.toggle('is-filtered-out', !(passKeyword && passType));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q');
  if (initialQuery && filterInput) {
    filterInput.value = initialQuery;
    applyFilter();
  }
})();
