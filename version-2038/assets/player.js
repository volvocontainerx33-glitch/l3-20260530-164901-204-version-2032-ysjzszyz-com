function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-play-button]');
  const src = video ? video.getAttribute('data-video') : '';
  let attached = false;
  let hlsInstance = null;

  function attach() {
    if (!video || !src || attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function play() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
        attached = false;
      }
    });
  }
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
