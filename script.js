/* =====================================================
   script.js — Kabilan M Portfolio
   Single-Page Section Switcher + all features
   ===================================================== */

// ── Element References ──────────────────────────────────────
const typedTextEl       = document.getElementById('typed-text');
const yearNode          = document.getElementById('year');
const navToggle         = document.getElementById('navToggle');
const siteNav           = document.getElementById('siteNav');
const themeToggle       = document.getElementById('themeToggle');
const scrollProgressBar = document.querySelector('.scroll-progress span');
const scrollTopBtn      = document.getElementById('scrollTopBtn');
const contactForm       = document.getElementById('contactForm');
const filterButtons     = document.querySelectorAll('.filter-btn');
const projectCards      = document.querySelectorAll('.project-card[data-category]');
const skillBars         = document.querySelectorAll('.skill-fill[data-level]');
const toastEl           = document.getElementById('toast');
const heroCanvas        = document.getElementById('heroCanvas');
const statPills         = document.querySelectorAll('.stat-pill[data-counter]');
const allSections       = document.querySelectorAll('[data-section]');
const navLinks          = document.querySelectorAll('[data-nav-link]');
const brandLink         = document.querySelector('.brand[data-target]');

const typedPhrases = [
  'software solutions.',
  'responsive web experiences.',
  'secure applications.',
  'practical networking tools.',
  'cybersecurity projects.',
];

// Track which section is currently visible
let currentSection = 'home';
// Track which sections have had their animations triggered
const animatedSections = new Set(['home']);

// ── Section Switcher ─────────────────────────────────────────
function showSection(targetId) {
  if (targetId === currentSection) return;

  // Hide all sections
  allSections.forEach(sec => sec.hidden = true);

  // Show target
  const target = document.querySelector(`[data-section="${targetId}"]`);
  if (!target) return;

  target.hidden = false;

  // Re-trigger animation by cloning trick
  target.style.animation = 'none';
  // Force reflow
  void target.offsetWidth;
  target.style.animation = '';

  currentSection = targetId;

  // Scroll page to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update nav active state
  navLinks.forEach(link => {
    const isActive = link.dataset.target === targetId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // Trigger skill bars when skills section shown
  if (targetId === 'skills' && !animatedSections.has('skills')) {
    animatedSections.add('skills');
    setTimeout(() => animateSkillBars(), 100);
  }

  // Trigger stat counters when home shown again (if not already done)
  if (targetId === 'home' && !animatedSections.has('home-counted')) {
    animatedSections.add('home-counted');
    setTimeout(() => animateCounters(), 200);
  }

  // Update browser URL hash (without scrolling)
  history.replaceState(null, '', `#${targetId}`);
}

// ── Init Section Navigation ──────────────────────────────────
function initSectionNav() {
  // Handle all [data-target] links anywhere on the page
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-target]');
    if (!trigger) return;
    const target = trigger.dataset.target;
    if (!target) return;
    e.preventDefault();
    showSection(target);

    // Close mobile nav if open
    if (siteNav && navToggle) {
      siteNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // On load, check URL hash
  const hash = location.hash.replace('#', '');
  if (hash && document.querySelector(`[data-section="${hash}"]`)) {
    // Show the requested section
    allSections.forEach(sec => sec.hidden = true);
    const target = document.querySelector(`[data-section="${hash}"]`);
    if (target) {
      target.hidden = false;
      currentSection = hash;
    }
    navLinks.forEach(link => {
      const isActive = link.dataset.target === hash;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  } else {
    // Default: show home only
    allSections.forEach(sec => {
      sec.hidden = sec.dataset.section !== 'home';
    });
    currentSection = 'home';
  }

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const currentHash = location.hash.replace('#', '');
    const validTarget = currentHash && document.querySelector(`[data-section="${currentHash}"]`);
    showSection(validTarget ? currentHash : 'home');
  });
}

// ── Theme Toggle ─────────────────────────────────────────────
function setTheme(theme) {
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  if (isDark) {
    document.body.dataset.theme = 'dark';
  } else {
    delete document.body.dataset.theme;
  }
  localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  const icon  = themeToggle.querySelector('i');
  const label = themeToggle.querySelector('span');
  if (icon)  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function initThemeToggle() {
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  setTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}

// ── Typed Text ───────────────────────────────────────────────
function initTypedText() {
  if (!typedTextEl) return;
  if (window.Typed) {
    new Typed('#typed-text', {
      strings:    typedPhrases,
      typeSpeed:  42,
      backSpeed:  22,
      backDelay:  1400,
      loop:       true,
      showCursor: true,
      cursorChar: '|',
    });
    return;
  }
  // Fallback manual typewriter
  let phraseIndex = 0, charIndex = 0, deleting = false;
  const tick = () => {
    const current = typedPhrases[phraseIndex];
    typedTextEl.textContent = deleting
      ? current.slice(0, charIndex--)
      : current.slice(0, charIndex++);
    if (!deleting && charIndex > current.length) {
      deleting = true;
      setTimeout(tick, 1300);
      return;
    }
    if (deleting && charIndex < 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % typedPhrases.length;
      charIndex = 0;
    }
    setTimeout(tick, deleting ? 28 : 46);
  };
  tick();
}

// ── AOS Init ─────────────────────────────────────────────────
function initAOS() {
  if (window.AOS) {
    window.AOS.init({ duration: 650, once: true, offset: 60 });
  }
}

// ── Mobile Nav ───────────────────────────────────────────────
function initMobileNav() {
  if (!navToggle || !siteNav) return;

  const toggle = (force) => {
    const isOpen = force !== undefined ? force : !siteNav.classList.contains('open');
    siteNav.classList.toggle('open', isOpen);
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) toggle(false);
  });
}

// ── Scroll progress (within a section) ───────────────────────
function initScrollState() {
  const update = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    if (scrollProgressBar) scrollProgressBar.style.width = `${progress}%`;
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollTop > 300);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
}

// ── Skill Bars ───────────────────────────────────────────────
function animateSkillBars() {
  if (!skillBars.length) return;
  skillBars.forEach(bar => {
    bar.style.width = '0%';
    // Force reflow so transition fires
    void bar.offsetWidth;
    bar.style.width = bar.dataset.level || '80%';
  });
}

// ── Stat Counter Animation ───────────────────────────────────
function animateCounters() {
  statPills.forEach(pill => {
    const target   = parseFloat(pill.dataset.counter || '0');
    const suffix   = pill.dataset.suffix || '';
    const strong   = pill.querySelector('strong');
    if (!strong) return;

    const isDecimal = target % 1 !== 0;
    const duration  = 1200;
    const steps     = 40;
    const increment = target / steps;
    let current     = 0;
    let step        = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      strong.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  });
}

// ── Project Filters ──────────────────────────────────────────
function initProjectFilters() {
  if (!filterButtons.length || !projectCards.length) return;
  const setFilter = (filter) => {
    projectCards.forEach(card => {
      const cats = String(card.dataset.category || '').split(',').map(c => c.trim());
      card.classList.toggle('is-hidden', filter !== 'all' && !cats.includes(filter));
    });
  };
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      setFilter(btn.dataset.filter || 'all');
    });
  });
  setFilter('all');
}

// ── Toast Notification ───────────────────────────────────────
function showToast(message, duration = 3500) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ── Contact Form ─────────────────────────────────────────────
function initContactForm() {
  if (!contactForm) return;
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data    = new FormData(contactForm);
    const name    = String(data.get('name')    || '').trim();
    const email   = String(data.get('email')   || '').trim();
    const subject = String(data.get('subject') || 'Portfolio enquiry').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !message) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }

    const mailto = `mailto:yourname@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    showToast('✅ Opening your email client…');
    contactForm.reset();
  });
}

// ── Hero Particle Canvas ─────────────────────────────────────
function initHeroCanvas() {
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  let particles = [];
  let raf;

  const resize = () => {
    heroCanvas.width  = heroCanvas.offsetWidth;
    heroCanvas.height = heroCanvas.offsetHeight;
  };

  const isDark = () => document.body.dataset.theme === 'dark';

  const spawn = () => {
    particles = Array.from({ length: 38 }, () => ({
      x:  Math.random() * heroCanvas.width,
      y:  Math.random() * heroCanvas.height,
      r:  Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o:  Math.random() * 0.5 + 0.15,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    const color = isDark() ? '120,160,255' : '37,99,235';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > heroCanvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > heroCanvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.o})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };

  const ro = new ResizeObserver(() => { resize(); spawn(); });
  ro.observe(heroCanvas.parentElement || document.body);
  resize();
  spawn();
  draw();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
}

// ── Year ─────────────────────────────────────────────────────
function setYear() {
  if (yearNode) yearNode.textContent = new Date().getFullYear();
}

// ── Bootstrap ────────────────────────────────────────────────
function initPortfolio() {
  initSectionNav();      // Must be first
  initThemeToggle();
  initTypedText();
  initAOS();
  initMobileNav();
  initScrollState();
  animateCounters();     // Run counters on home load
  initProjectFilters();
  initContactForm();
  initHeroCanvas();
  initProjectCarousels(); // Start project image sliders
  initLightbox();         // Start full-screen image viewer modal
  protectInformation();   // Protect text and media from copy/saving
  setYear();
}

// ── Project Carousel Script ──────────────────────────────────
function initProjectCarousels() {
  const carousels = document.querySelectorAll('.project-carousel');
  carousels.forEach(carousel => {
    const images = carousel.querySelectorAll('.carousel-img');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');
    const dots = carousel.querySelectorAll('.carousel-dot');
    
    if (!images.length) return;
    
    let currentIndex = 0;
    
    const updateCarousel = (index) => {
      images.forEach((img, idx) => {
        img.classList.toggle('active', idx === index);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
      currentIndex = index;
    };
    
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = images.length - 1;
        updateCarousel(nextIndex);
      });
      
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let nextIndex = currentIndex + 1;
        if (nextIndex >= images.length) nextIndex = 0;
        updateCarousel(nextIndex);
      });
    }
    
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCarousel(idx);
      });
    });
  });
}

// ── Lightbox Image Viewer ────────────────────────────────────
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  
  if (!modal || !modalImg || !closeBtn) return;
  
  const clickableImages = document.querySelectorAll('.project-card img, .carousel-img, a.cert-link');
  
  clickableImages.forEach(img => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const src = img.tagName === 'A' ? img.getAttribute('href') : img.getAttribute('src');
      const alt = img.tagName === 'A' ? img.getAttribute('aria-label') : (img.getAttribute('alt') || 'Project preview');
      
      modalImg.setAttribute('src', src);
      caption.textContent = alt;
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });
  
  const closeModal = () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalImg.setAttribute('src', '');
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.lightbox-content') === null) {
      closeModal();
    }
  });
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

// ── Information Shield (Copy/Right-click Blocker) ────────────
function protectInformation() {
  // Prevent Right Click
  document.addEventListener('contextmenu', (e) => {
    // Keep contextmenu active on the download buttons and links
    if (e.target.closest('#downloadResumeBtn') || e.target.closest('a[download]')) {
      return;
    }
    e.preventDefault();
  });

  // Prevent Copy / Cut
  document.addEventListener('copy', (e) => {
    e.preventDefault();
  });
  
  document.addEventListener('cut', (e) => {
    e.preventDefault();
  });

  // Block Developer Inspector Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
    ) {
      e.preventDefault();
    }
  });
}

initPortfolio();
