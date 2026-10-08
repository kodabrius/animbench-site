(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  // Split marked headings into words so they can rise one by one
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    words.forEach(function (word, i) {
      var outer = document.createElement('span');
      var inner = document.createElement('span');
      outer.className = 'word';
      outer.setAttribute('aria-hidden', 'true');
      inner.textContent = word;
      inner.style.setProperty('--i', i);
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('is-split');
  });

  // Header: hairline once scrolled; hides on scroll down, returns on scroll up
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  function onHeaderScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (!reduceMotion) {
      var goingDown = y > lastY;
      header.classList.toggle('is-hidden', goingDown && y > 240 && !header.contains(document.activeElement));
    }
    lastY = y;
  }
  if (header) {
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // Reveal blocks as they enter the viewport
  var revealed = document.querySelectorAll('.reveal');
  if (!reduceMotion && supportsIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Showreel grows from 90% to full size as it scrolls into view
  var reel = document.querySelector('.showreel video');
  if (reel && !reduceMotion) {
    var ticking = false;
    var updateReel = function () {
      var rect = reel.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = Math.min(Math.max((vh - rect.top) / (vh * 0.9), 0), 1);
      reel.style.transform = 'scale(' + (0.9 + 0.1 * progress).toFixed(4) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateReel); }
    }, { passive: true });
    window.addEventListener('resize', updateReel);
    updateReel();
  }

  // Marquee: duplicate the track once so the loop is seamless
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  // Feature groups: spotlight follows the cursor
  document.querySelectorAll('.group').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Looping clips: respect reduced motion, offer pause, and only play when visible
  document.querySelectorAll('video[data-loop]').forEach(function (video) {
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

    if (!reduceMotion && supportsIO) {
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
