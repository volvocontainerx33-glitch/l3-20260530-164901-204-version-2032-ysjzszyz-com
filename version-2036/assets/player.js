(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hls = null;
    var ready = false;

    function attach() {
      if (ready || !source) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('hidden');
      }
      video.controls = true;
      var playAction = video.play();
      if (playAction && playAction.catch) {
        playAction.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
