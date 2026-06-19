import { H as Hls } from './hls-vendor-dru42stk.js';

function preparePlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var message = shell.querySelector('[data-player-message]');
  var source = shell.getAttribute('data-stream');
  var hls = null;

  function showMessage(text) {
    if (message) {
      message.textContent = text;
      message.classList.add('show');
    }
  }

  function attachSource() {
    if (!video || !source) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        showMessage('视频加载失败，请稍后重试');
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    showMessage('当前浏览器无法加载该视频源');
  }

  function togglePlay() {
    if (!video) {
      return;
    }

    if (video.paused) {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showMessage('请再次点击播放');
        });
      }
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener('click', togglePlay);
  }

  if (video) {
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      shell.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('playing');
    });
    video.addEventListener('error', function () {
      showMessage('视频加载失败，请稍后重试');
    });
  }

  attachSource();

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-stream]')).forEach(preparePlayer);
