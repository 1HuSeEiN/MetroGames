document.addEventListener('DOMContentLoaded', () => {

  const isMobile = () => window.innerWidth <= 768;

  /* ===== 1. PARTICLE CANVAS (Performance Optimized) ===== */
  const canvas = document.getElementById('particleCanvas');
  let ctx, W, H, particles = [], animationId;

  if (canvas) {
    ctx = canvas.getContext('2d');

    function resizeCanvas() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initParticles();
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = Math.random() * 1.6 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = (Math.random() - 0.5) * 0.35;
        this.opacity = Math.random() * 0.45 + 0.1;
        const blues = ['#1565c0','#1e88e5','#42a5f5','#64b5f6','#00bcd4'];
        this.color = blues[Math.floor(Math.random() * blues.length)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticles() {
      particles = [];
      // On mobile devices use 30 particles, on desktop 100 for optimal 60-120fps
      const count = isMobile() ? 28 : 100;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    // Draw connecting lines only on desktop to save battery & prevent frame drops on phones
    function drawConnections() {
      if (isMobile()) return; // Skip heavy O(N^2) checks on mobile
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = '#1e88e5';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animationId = requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
      clearTimeout(window._pResizeTimer);
      window._pResizeTimer = setTimeout(resizeCanvas, 200);
    });
    animateParticles();
  }


  /* ===== 2. NAVBAR SCROLL & ACTIVE LINKS ===== */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobTabs = document.querySelectorAll('.mob-tab[data-target]');

  function updateActiveLink() {
    let current = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (!current && window.scrollY < 200) current = 'home';

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    mobTabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-target') === current);
    });
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    if (backToTop) {
      if (scrollY > 350) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    updateActiveLink();
  }, { passive: true });


  /* ===== 3. MOBILE DRAWER MENU & BACKDROP OVERLAY ===== */
  const burger = document.getElementById('burger');
  const navLinksEl = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    if (burger) burger.classList.add('open');
    if (navLinksEl) navLinksEl.classList.add('open');
    if (navOverlay) navOverlay.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (burger) burger.classList.remove('open');
    if (navLinksEl) navLinksEl.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Close menu when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ESC to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });


  /* ===== 4. COUNTER ANIMATION ===== */
  const counterEls = document.querySelectorAll('.stat-num');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      countersAnimated = true;
      counterEls.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1600;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current);
        }, 16);
      });
    }
  }
  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();


  /* ===== 5. SCROLL REVEAL ===== */
  const revealEls = document.querySelectorAll(
    '.about-card, .service-card, .price-card, .contact-item, .video-card-frame, .section-header'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, isMobile() ? 40 : index * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ===== 6. HERO LOGO PARALLAX (Desktop only) ===== */
  const heroLogo = document.querySelector('.hero-logo-large');
  if (heroLogo && !isMobile()) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroLogo.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    }, { passive: true });
  }


  /* ===== 7. CURSOR GLOW EFFECT (Desktop Only) ===== */
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isFinePointer) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(21, 101, 192, 0.09) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: left 0.15s ease, top 0.15s ease;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }


  /* ===== 8. GAMES TICKER PAUSE & TOUCH SUPPORT ===== */
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    // Desktop hover
    tickerInner.addEventListener('mouseenter', () => {
      tickerInner.style.animationPlayState = 'paused';
    });
    tickerInner.addEventListener('mouseleave', () => {
      tickerInner.style.animationPlayState = 'running';
    });

    // Touch support on mobile: touch to pause, lift to resume
    tickerInner.addEventListener('touchstart', () => {
      tickerInner.style.animationPlayState = 'paused';
    }, { passive: true });

    tickerInner.addEventListener('touchend', () => {
      tickerInner.style.animationPlayState = 'running';
    }, { passive: true });
  }


  /* ===== 9. VIDEO SHOWCASE CONTROLS & AUTO-PAUSE ===== */
  const video = document.getElementById('metroShowcaseVideo');
  const videoCard = document.getElementById('videoCardFrame');
  const soundBtn = document.getElementById('videoSoundBtn');
  const fullscreenBtn = document.getElementById('videoFullscreenBtn');
  const playIndicator = document.getElementById('videoPlayIndicator');

  if (video) {
    // 1. Sound Toggle (Mute / Unmute)
    if (soundBtn) {
      const soundMutedIcon = soundBtn.querySelector('.sound-icon-muted');
      const soundUnmutedIcon = soundBtn.querySelector('.sound-icon-unmuted');

      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering video card play/pause
        video.muted = !video.muted;
        if (video.muted) {
          if (soundMutedIcon) soundMutedIcon.style.display = 'inline';
          if (soundUnmutedIcon) soundUnmutedIcon.style.display = 'none';
        } else {
          if (soundMutedIcon) soundMutedIcon.style.display = 'none';
          if (soundUnmutedIcon) soundUnmutedIcon.style.display = 'inline';
        }
      });
    }

    // 2. Fullscreen Toggle
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          if (videoCard && videoCard.requestFullscreen) {
            videoCard.requestFullscreen();
          } else if (video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen(); // Safari iOS native
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }

    // 3. Tap/Click Video Frame to Play or Pause
    let indicatorTimer;
    function showIndicator(isPaused) {
      if (!playIndicator) return;
      const playIcon = playIndicator.querySelector('.play-icon');
      const pauseIcon = playIndicator.querySelector('.pause-icon');

      if (isPaused) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
      } else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }

      playIndicator.classList.add('show-indicator');
      clearTimeout(indicatorTimer);
      indicatorTimer = setTimeout(() => {
        playIndicator.classList.remove('show-indicator');
      }, 650);
    }

    if (videoCard) {
      videoCard.addEventListener('click', () => {
        if (video.paused) {
          video.play().then(() => {
            showIndicator(false);
          }).catch(() => {});
        } else {
          video.pause();
          showIndicator(true);
        }
      });
    }

    // 4. Power Saving: Auto-Pause Video when out of viewport
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      });
    }, { threshold: 0.25 });

    videoObserver.observe(video);
  }


  console.log('🎮 Metro Games Mobile & Desktop Engine Ready! 🚀');

});
