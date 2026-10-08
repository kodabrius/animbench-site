(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header gets a hairline once the page scrolls
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal sections as they enter the viewport
  var revealed = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Looping clips: respect reduced motion, offer pause, and only play when visible
  var clips = document.querySelectorAll('video[data-loop]');
  clips.forEach(function (video) {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    }

    var toggle = video.parentElement.querySelector('.clip-toggle');
    if (toggle) {
      var sync = function () {
        var paused = video.paused;
        toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
        toggle.textContent = paused ? toggle.dataset.play : toggle.dataset.pause;
      };
      toggle.addEventListener('click', function () {
        if (video.paused) {
          video.dataset.userPaused = 'false';
          video.play();
        } else {
          video.dataset.userPaused = 'true';
          video.pause();
        }
      });
      video.addEventListener('play', sync);
      video.addEventListener('pause', sync);
      sync();
    }

    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (video.dataset.userPaused !== 'true') { video.play().catch(function () {}); }
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: 0.15 }).observe(video);
    }
  });
})();
