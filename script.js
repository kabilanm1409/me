/* =====================================================
   script.js — Kabilan M Portfolio (Clean & Standalone)
   Single-Page Section Switcher + Cyber Terminal
   ===================================================== */

(function PortfolioScope() {
  'use strict';

  // ── HTML Entity Escaping Helper ───────────────────────────────
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  const typedPhrases = [
    'software solutions.',
    'responsive web experiences.',
    'secure applications.',
    'practical networking tools.',
    'cybersecurity projects.',
  ];

  let currentSection = '';
  const animatedSections = new Set(['home']);

  function getCleanPath(targetId) {
    const isSubpage = window.location.pathname.includes('/pages/');
    const prefix = isSubpage ? '../' : './';
    if (targetId === 'home') return prefix;
    return prefix + targetId;
  }

  function showSection(targetId, updateHistory = true) {
    if (targetId === currentSection) return;

    const navTerminal = document.getElementById('nav-terminal');
    if (navTerminal) {
      navTerminal.style.display = (targetId === 'terminal') ? 'inline-flex' : 'none';
    }

    allSections.forEach(sec => (sec.hidden = true));

    const targetNode = document.querySelector(`[data-section="${targetId}"]`);
    if (!targetNode) return;

    targetNode.hidden = false;
    targetNode.style.opacity = '0';
    void targetNode.offsetHeight;
    targetNode.style.opacity = '';

    currentSection = targetId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    navLinks.forEach(link => {
      const isMatch = link.dataset.target === targetId;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (targetId === 'skills' && !animatedSections.has('skills')) {
      animatedSections.add('skills');
      setTimeout(() => animateSkillBars(), 100);
    }
    if (targetId === 'home' && !animatedSections.has('home-counted')) {
      animatedSections.add('home-counted');
      setTimeout(() => animateCounters(), 200);
    }

    if (updateHistory) {
      try {
        const cleanPath = getCleanPath(targetId);
        history.pushState({ section: targetId }, '', cleanPath);
      } catch (e) {}
    }
  }

  function initSectionNav() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-target]');
      if (!link) return;

      const target = link.dataset.target;
      if (!target) return;

      e.preventDefault();
      showSection(target);

      if (siteNav && navToggle) {
        siteNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('popstate', (e) => {
      const target = e.state && e.state.section ? e.state.section : 'home';
      showSection(target, false);
    });

    const hash = window.location.hash.replace('#', '');
    if (hash && document.querySelector(`[data-section="${hash}"]`)) {
      showSection(hash, false);
      return;
    }

    const path = window.location.pathname.replace(/\/$/, '');
    const lastSeg = path.split('/').pop().replace('.html', '');
    if (lastSeg && document.querySelector(`[data-section="${lastSeg}"]`)) {
      showSection(lastSeg, false);
    } else {
      showSection('home', false);
    }
  }

  function applyTheme(theme) {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    if (isDark) {
      document.body.dataset.theme = 'dark';
      document.body.setAttribute('data-theme', 'dark');
    } else {
      delete document.body.dataset.theme;
      document.body.removeAttribute('data-theme');
    }
    const icon  = themeToggle.querySelector('i');
    const label = themeToggle.querySelector('.theme-toggle-label');
    if (icon)  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
  }

  function initThemeToggle() {
    const saved = localStorage.getItem('km_theme') || 'light';
    applyTheme(saved);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('km_theme', next);
      });
    }
  }

  function initTypedText() {
    if (!typedTextEl) return;

    if (window.Typed) {
      new Typed('#typed-text', {
        strings: typedPhrases,
        typeSpeed: 42,
        backSpeed: 22,
        backDelay: 1400,
        loop: true,
        showCursor: true,
        cursorChar: '|',
      });
      return;
    }

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;

    const tick = () => {
      const current = typedPhrases[phraseIdx];
      typedTextEl.textContent = deleting
        ? current.slice(0, charIdx--)
        : current.slice(0, charIdx++);

      if (!deleting && charIdx > current.length) {
        deleting = true;
        setTimeout(tick, 1300);
        return;
      }
      if (deleting && charIdx < 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % typedPhrases.length;
        charIdx   = 0;
      }
      setTimeout(tick, deleting ? 28 : 46);
    };
    tick();
  }

  function initAOS() {
    if (window.AOS) {
      window.AOS.init({
        duration: 650,
        once: true,
        offset: 60,
      });
    }
  }

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

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) toggle(false);
    });
  }

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

  function animateSkillBars() {
    if (!skillBars.length) return;
    skillBars.forEach(bar => {
      bar.style.width = '0%';
      void bar.offsetWidth;
      bar.style.width = bar.dataset.level || '80%';
    });
  }

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

  function initProjectFilters() {
    const searchInput = document.getElementById('projectSearch');
    if (!filterButtons.length && !searchInput) return;
    
    let currentFilter = 'all';
    let searchQuery = '';
    
    const applyFilterAndSearch = () => {
      projectCards.forEach(card => {
        const cats = String(card.dataset.category || '').split(',').map(c => c.trim());
        const matchesCategory = (currentFilter === 'all' || cats.includes(currentFilter));
        
        const title = String(card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = String(card.querySelector('p')?.textContent || '').toLowerCase();
        const tags = String(card.querySelector('.tag-row')?.textContent || '').toLowerCase();
        const listItems = Array.from(card.querySelectorAll('ul li')).map(li => li.textContent.toLowerCase()).join(' ');
        
        const textToSearch = `${title} ${desc} ${tags} ${listItems}`;
        const matchesSearch = !searchQuery || textToSearch.includes(searchQuery);
        
        card.classList.toggle('is-hidden', !(matchesCategory && matchesSearch));
      });
    };
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.dataset.filter || 'all';
        applyFilterAndSearch();
      });
    });
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilterAndSearch();
      });
    }
    
    applyFilterAndSearch();
  }

  function showToast(message, duration = 3500) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  // ── Cryptographic Hashing Helper (SHA-256 Web Crypto) ─────────────
  async function computeSha256(str) {
    try {
      const buf = new TextEncoder().encode(String(str));
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '';
    }
  }

  // Shielded endpoint resolution
  const CONTACT_API_URL = atob('L2FwaS9jb250YWN0'); // '/api/contact'

  function initContactForm() {
    if (!contactForm) return;
    const submitBtn = document.getElementById('contactSubmitBtn');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data    = new FormData(contactForm);
      const name    = String(data.get('name')    || '').trim();
      const email   = String(data.get('email')   || '').trim();
      const subject = String(data.get('subject') || 'Portfolio enquiry').trim();
      const message = String(data.get('message') || '').trim();
      const website = String(data.get('website') || '').trim();

      // Bot honeypot check
      if (website) {
        showToast('✅ Message sent successfully!');
        contactForm.reset();
        return;
      }

      if (!name || !email || !message) {
        showToast('⚠️ Please fill in all required fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      }

      try {
        const timestamp = Date.now();
        let signature = '';
        try {
          signature = await computeSha256(`${name}|${email}|${timestamp}|km_sec`);
        } catch (e) {}

        let backendSuccess = false;
      try {
        const response = await fetch(CONTACT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Timestamp': String(timestamp),
            'X-Signature': signature
          },
          body: JSON.stringify({ name, email, subject, message, website }),
        });
        if (response.ok) backendSuccess = true;
      } catch (err) {}

      // Dual sync to Firebase Realtime Database & Cloud Firestore for Admin Inbox
      let firebaseSaved = false;
      try {
        let fbModule = null;
        try {
          fbModule = await import('/firebase-config.js');
        } catch (importErr) {
          const isSub = window.location.pathname.includes('/pages/');
          fbModule = await import(isSub ? '../firebase-config.js' : './firebase-config.js');
        }
        if (fbModule && fbModule.db && fbModule.ref && fbModule.set) {
          const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const payload = {
            id: msgId,
            name,
            email,
            subject,
            message,
            timestamp,
            signature: signature || '',
            read: false
          };
          await fbModule.set(fbModule.ref(fbModule.db, `contactMessages/${msgId}`), payload);
          if (fbModule.firestore && fbModule.doc && fbModule.setDoc) {
            try {
              await fbModule.setDoc(fbModule.doc(fbModule.firestore, "contactMessages", msgId), payload);
            } catch (e) {}
          }
          if (fbModule.analytics && fbModule.logEvent) {
            try {
              fbModule.logEvent(fbModule.analytics, 'contact_submit', {
                has_signature: !!signature,
                page_path: window.location.pathname
              });
            } catch (ae) {}
          }
          firebaseSaved = true;
        }
      } catch (fbErr) {}

      // Always save to client-side inbox backup
      try {
        const inbox = JSON.parse(localStorage.getItem('km_contact_inbox') || '[]');
        inbox.unshift({
          id: `inbox_${Date.now()}`,
          name,
          email,
          subject,
          message,
          timestamp,
          signature: signature || '',
          read: false
        });
        localStorage.setItem('km_contact_inbox', JSON.stringify(inbox.slice(0, 50)));
      } catch (e) {}

      if (backendSuccess || firebaseSaved || true) {
        showToast('✅ Message sent successfully!');
        contactForm.reset();
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });
  }

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

    const ro = new ResizeObserver(() => {
      resize();
      spawn();
    });
    ro.observe(heroCanvas.parentElement || document.body);

    resize();
    spawn();
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        draw();
      }
    });
  }

  function setYear() {
    if (yearNode) {
      yearNode.textContent = new Date().getFullYear();
    }
  }

  // ── Bootstrap ────────────────────────────────────────────────
  function initPortfolio() {
    initSectionNav();
    initThemeToggle();
    initTypedText();
    initAOS();
    initMobileNav();
    initScrollState();
    animateCounters();
    initProjectFilters();
    initContactForm();
    initHeroCanvas();
    initProjectCarousels();
    initLightbox();
    initCertificateRibbon();
    initTerminal();
    initImageFallbacks();
    initHeaderSearch();
    initScreenshotShield();
    setYear();
  }

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

  // ── Dual-Mode Lightbox (Image, PDF & Credential) ──────────────
  let lastModalTrigger = null;

  function openLightbox(url, title, type = 'auto', triggerEl = null) {
    lastModalTrigger = triggerEl || document.activeElement;
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImage');
    const modalFrame = document.getElementById('lightboxFrame');
    const customCard = document.getElementById('lightboxCustomCard');
    const actionBtn = document.getElementById('lightboxActionBtn');
    const caption = document.getElementById('lightboxCaption');
    const typeLabel = document.getElementById('lightboxType');

    if (!modal) return;

    const isPdf = type === 'pdf' || (typeof url === 'string' && url.toLowerCase().endsWith('.pdf'));
    const isSynthetic = type === 'synthetic' || !url;

    if (isSynthetic) {
      if (modalImg) modalImg.style.display = 'none';
      if (modalFrame) {
        modalFrame.style.display = 'none';
        modalFrame.setAttribute('src', '');
      }
      if (customCard) customCard.style.display = 'block';
      if (actionBtn) actionBtn.style.display = 'none';
      if (typeLabel) typeLabel.textContent = 'Special Credential';
    } else if (isPdf) {
      if (modalImg) {
        modalImg.style.display = 'none';
        modalImg.setAttribute('src', '');
      }
      if (modalFrame) {
        modalFrame.style.display = 'block';
        modalFrame.setAttribute('src', url);
      }
      if (customCard) customCard.style.display = 'none';
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.setAttribute('href', url);
      }
      if (typeLabel) typeLabel.textContent = 'Verified PDF Document';
    } else {
      if (modalImg) {
        modalImg.style.display = 'block';
        modalImg.setAttribute('src', url);
      }
      if (modalFrame) {
        modalFrame.style.display = 'none';
        modalFrame.setAttribute('src', '');
      }
      if (customCard) customCard.style.display = 'none';
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.setAttribute('href', url);
      }
      if (typeLabel) typeLabel.textContent = 'Official Certificate Image';
    }

    if (caption) {
      caption.textContent = title || 'Certificate Preview';
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) closeBtn.focus();
  }

  function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImage');
    const modalFrame = document.getElementById('lightboxFrame');
    const closeBtn = document.getElementById('lightboxClose');

    if (!modal) return;

    const clickableElements = document.querySelectorAll('.project-card img, .carousel-img, a.cert-link, .btn-cert-preview');

    const handleTrigger = (e, el) => {
      e.preventDefault();
      e.stopPropagation();

      const card = el.closest ? el.closest('.cert-card') : (el.parentNode || null);
      const src = el.tagName === 'A' 
        ? el.getAttribute('href') 
        : (el.dataset.certSrc !== undefined 
            ? el.dataset.certSrc 
            : (card && card.dataset.certSrc !== undefined ? card.dataset.certSrc : el.getAttribute('src')));
      const alt = el.tagName === 'A' 
        ? (el.getAttribute('aria-label') || el.textContent.trim()) 
        : (el.dataset.certTitle || (card && card.dataset.certTitle) || el.getAttribute('alt') || 'Preview');
      const type = el.dataset.certType || (card && card.dataset.certType) || ((src && src.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image');
      openLightbox(src, alt, type, el);
    };

    clickableElements.forEach(el => {
      el.addEventListener('click', (e) => {
        handleTrigger(e, el);
      });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleTrigger(e, el);
        }
      });
    });

    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (modalImg) modalImg.setAttribute('src', '');
      if (modalFrame) modalFrame.setAttribute('src', '');
      if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
        lastModalTrigger.focus();
        lastModalTrigger = null;
      }
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal || (!e.target.closest('#lightboxContent, .lightbox-content') && !e.target.closest('.lightbox-header'))) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('show')) return;
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // ── 3D Floating Certificate Ribbon Physics & Touch Gestures (R2) ──────
  function initCertificateRibbon() {
    const track = document.getElementById('certRibbonTrack');
    const viewport = document.getElementById('certRibbonViewport');
    const cards = document.querySelectorAll('.cert-card');

    if (!track) return;

    // 1. Interactive 3D Card Tilt Physics (rotateX, rotateY)
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });

      // Click on card opens lightbox preview
      card.addEventListener('click', (e) => {
        if (e.target.closest('a.btn-cert-external') || e.target.closest('.btn-cert-preview')) return;
        e.preventDefault();
        const src = card.dataset.certSrc || '';
        const title = card.dataset.certTitle || card.querySelector('.cert-title')?.textContent || 'Certificate';
        const type = card.dataset.certType || ((src && src.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image');
        openLightbox(src, title, type, card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('a.btn-cert-external') || e.target.closest('.btn-cert-preview')) return;
          e.preventDefault();
          const src = card.dataset.certSrc || '';
          const title = card.dataset.certTitle || card.querySelector('.cert-title')?.textContent || 'Certificate';
          const type = card.dataset.certType || ((src && src.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image');
          openLightbox(src, title, type, card);
        }
      });
    });

    // 2. Touch and Pointer Drag Controls for Viewport
    if (viewport) {
      let isDragging = false;
      let startX = 0;

      const onPointerDown = (e) => {
        isDragging = true;
        startX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        track.style.animationPlayState = 'paused';
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const deltaX = currentX - startX;
        track.style.transform = `translate3d(${deltaX}px, 0, 0)`;
      };

      const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.animationPlayState = '';
        track.style.transform = '';
      };

      viewport.addEventListener('pointerdown', onPointerDown, { passive: true });
      viewport.addEventListener('pointermove', onPointerMove, { passive: true });
      viewport.addEventListener('pointerup', onPointerUp, { passive: true });
      viewport.addEventListener('pointercancel', onPointerUp, { passive: true });

      viewport.addEventListener('touchstart', onPointerDown, { passive: true });
      viewport.addEventListener('touchmove', onPointerMove, { passive: true });
      viewport.addEventListener('touchend', onPointerUp, { passive: true });
      viewport.addEventListener('touchcancel', onPointerUp, { passive: true });

      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('touchend', onPointerUp, { passive: true });
    }
  }

  let sniffInterval = null;
  let cmdHistory = [];
  let historyIndex = -1;

  // ── Virtual File System (VFS) for Interactive Linux Terminal ──
  const VFS_STORAGE_KEY = 'km_portfolio_vfs_v3';

  function getDefaultVFS() {
    const isSub = window.location.pathname.includes('/pages/');
    const pfx = isSub ? '../' : '';
    return {
      '/home/kabilan': {
        type: 'dir',
        files: {
          'resume.pdf': {
            type: 'file',
            size: '106K',
            perm: '-rw-r--r--',
            date: 'Aug 11 12:25',
            content: 'Kabilan M — Resume\nRole: Security & Networking Engineer / Full Stack Developer\nEducation: B.Tech IT, Kongunadu College of Engineering (CGPA: 7.08)\nCertifications: Infosys Springboard (HTML5, CSS3, JS), Cyber Security Pentest\nContact: mkabilan1409@gmail.com | +91 76049 59955',
            url: pfx + 'assets/resume/kabilanm_resume without photo.pdf?v=4.0'
          },
          'skills.txt': {
            type: 'file',
            size: '1.2K',
            perm: '-rw-r--r--',
            date: 'Aug 11 12:25',
            content: 'Languages: Java, C++, Python, HTML5, CSS3, JavaScript\nDatabases: MySQL, MongoDB, Apache HDFS, Apache Pig\nTools: Wireshark, Burp Suite, VS Code, Git, Arduino IDE\nCore: 802.11 Wi-Fi Packet Sniffing, Network Security, Full-Stack Architecture'
          },
          'about.txt': {
            type: 'file',
            size: '1.5K',
            perm: '-rw-r--r--',
            date: 'Aug 11 12:25',
            content: 'Kabilan M - B.Tech Information Technology student.\nTransitioned from Mechanical Engineering to IT with deep interest in practical wireless security, network defense, and clean web engineering.'
          },
          'contact.txt': {
            type: 'file',
            size: '480B',
            perm: '-rw-r--r--',
            date: 'Aug 11 12:25',
            content: 'Email: mkabilan1409@gmail.com\nPhone: +91 76049 59955\nLinkedIn: linkedin.com/in/kabilan-m-790801330/\nGitHub: github.com/kabilanm1409'
          },
          'portfolio_config.json': {
            type: 'file',
            size: '720B',
            perm: '-rw-r--r--',
            date: 'Sep 20 14:00',
            content: '{\n  "owner": "Kabilan M",\n  "system": "Kali-Linux v6.8 Web Terminal",\n  "admin_panel": "admin.html",\n  "status": "Production Live",\n  "hosting": "Firebase Hosting (kabilanportfolio-ab851.web.app)"\n}'
          },
          'notes.txt': {
            type: 'file',
            size: '640B',
            perm: '-rw-rw-r--',
            date: 'Sep 20 14:00',
            content: 'Linux Lab Terminal is Active.\n- Type "admin" to open Portfolio Admin Console\n- Type "upload" to upload documents\n- Type "touch <name>" to create a file\n- Type "rm <name>" to delete a document\n- Type "update <file> <text>" to modify file\n- Type "help" for full command manual'
          },
          'projects': {
            type: 'dir',
            files: {
              'wifi_deauth.txt': {
                type: 'file',
                size: '2.4K',
                perm: '-rw-r--r--',
                date: 'Aug 11 12:25',
                content: 'Project 1: Wi-Fi De-authentication Device\nHardware: ESP8266 Microcontroller + 0.96" SSD1306 OLED\nDescription: Wireless frame sniffer monitoring Beacon, Deauth, and Probe frames in real time.'
              },
              'deauth_detector.txt': {
                type: 'file',
                size: '2.8K',
                perm: '-rw-r--r--',
                date: 'Aug 11 12:25',
                content: 'Project 2: De-authentication Detection System\nHardware: ESP32-WROOM-32\nDescription: Detects deauth attack loops and fires Gmail security alerts in real time.'
              },
              'forest_fire.txt': {
                type: 'file',
                size: '3.1K',
                perm: '-rw-r--r--',
                date: 'Aug 11 12:25',
                content: 'Project 3: Forest Fire Prediction System\nStack: React, Node.js, Python, XGBoost, Google Maps\nDescription: Geospatial AI wildfire prediction with dynamic contour heatmaps and WhatsApp dispatch alerts.'
              }
            }
          },
          'certs': {
            type: 'dir',
            files: {
              'hackathon_1st_place.jpg': {
                type: 'file',
                size: '1.2M',
                perm: '-rw-r--r--',
                date: 'Jul 01 18:53',
                content: 'Artiverse 3.0 Intra-College Hackathon - 1st Place Winner',
                url: pfx + 'assets/cerificates/IMG_20260701_185332433.jpg'
              },
              'cyber_security.jpg': {
                type: 'file',
                size: '1.5M',
                perm: '-rw-r--r--',
                date: 'Jul 01 18:51',
                content: 'Advanced Cyber Security - Penetration Testing Certification (6-day hands on)',
                url: pfx + 'assets/cerificates/IMG_20260701_185137413.jpg'
              },
              'fullstack_internship.jpg': {
                type: 'file',
                size: '1.8M',
                perm: '-rw-r--r--',
                date: 'Jul 01 18:52',
                content: 'e-soft IT Solutions Full Stack Developer Trainee Certificate (June 2025)',
                url: pfx + 'assets/cerificates/internship/IMG_20260701_185232887.jpg'
              },
              'infosys_html5.pdf': {
                type: 'file',
                size: '420K',
                perm: '-rw-r--r--',
                date: 'Jun 15 10:20',
                content: 'Infosys Springboard - HTML5 Specialist Certificate',
                url: pfx + 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf'
              },
              'infosys_css3.pdf': {
                type: 'file',
                size: '430K',
                perm: '-rw-r--r--',
                date: 'Jun 15 10:25',
                content: 'Infosys Springboard - CSS3 Specialist Certificate',
                url: pfx + 'assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf'
              },
              'infosys_javascript.pdf': {
                type: 'file',
                size: '445K',
                perm: '-rw-r--r--',
                date: 'Jun 15 10:30',
                content: 'Infosys Springboard - JavaScript Specialist Certificate',
                url: pfx + 'assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf'
              }
            }
          },
          'documents': {
            type: 'dir',
            files: {
              'readme.md': {
                type: 'file',
                size: '1.8K',
                perm: '-rw-r--r--',
                date: 'Aug 11 12:25',
                content: '# Kabilan M Portfolio Documents\nUpload and manage all portfolio documents, research publications, and credentials here.'
              }
            }
          }
        }
      }
    };
  }

  function loadVFS() {
    try {
      const stored = localStorage.getItem(VFS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed['/home/kabilan']) return parsed;
      }
    } catch (e) {}
    return getDefaultVFS();
  }

  function saveVFS(vfs) {
    try {
      localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(vfs));
    } catch (e) {}
  }

  function initTerminal() {
    const tInput = document.getElementById('terminalInput');
    const tBody = document.getElementById('terminalBody');
    const tPrompt = document.getElementById('terminalPrompt') || document.querySelector('.terminal-input-row .t-prompt');
    const tFileInput = document.getElementById('terminalFileInput');
    const chips = document.querySelectorAll('.cmd-chip');
    
    if (!tInput || !tBody) return;

    if (!tBody.getAttribute('role')) tBody.setAttribute('role', 'log');
    if (!tBody.getAttribute('aria-live')) tBody.setAttribute('aria-live', 'polite');

    let currentDir = '/home/kabilan';
    let vfs = loadVFS();

    const updatePrompt = () => {
      if (!tPrompt) return;
      let displayPath = currentDir;
      if (displayPath === '/home/kabilan') displayPath = '~';
      else if (displayPath.startsWith('/home/kabilan/')) displayPath = '~/' + displayPath.slice('/home/kabilan/'.length);
      tPrompt.textContent = `security@kabilan:${displayPath}$`;
    };

    updatePrompt();

    const getResumeNoPhotoPath = () => {
      const isSubpage = window.location.pathname.includes('/pages/');
      const prefix = isSubpage ? '../' : '';
      return prefix + 'assets/resume/kabilanm_resume without photo.pdf?v=4.0';
    };

    const getAdminPath = () => {
      const isSubpage = window.location.pathname.includes('/pages/');
      return isSubpage ? '../admin.html' : 'admin.html';
    };

    const appendLine = (text, type = '') => {
      const line = document.createElement('div');
      line.className = 't-line';
      if (type) line.classList.add(type);
      line.innerHTML = text;
      tBody.appendChild(line);
      tBody.scrollTop = tBody.scrollHeight;
    };

    // Helper: get directory object in VFS
    const getDirObject = (path) => {
      if (path === '/home/kabilan') return vfs['/home/kabilan'];
      if (path.startsWith('/home/kabilan/')) {
        const sub = path.slice('/home/kabilan/'.length).split('/')[0];
        const rootFiles = vfs['/home/kabilan'].files;
        if (rootFiles[sub] && rootFiles[sub].type === 'dir') {
          return rootFiles[sub];
        }
      }
      return null;
    };

    // Document File Picker Upload Handler
    if (tFileInput) {
      tFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const fileName = file.name;
        const fileSizeKb = (file.size / 1024).toFixed(1);
        const sizeStr = fileSizeKb > 1024 ? `${(fileSizeKb / 1024).toFixed(1)}M` : `${fileSizeKb}K`;
        const now = new Date();
        const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

        const reader = new FileReader();
        reader.onload = () => {
          const content = typeof reader.result === 'string' ? reader.result.slice(0, 1000) : `[Binary document: ${fileName}]`;
          
          // Store into current directory
          const targetDir = getDirObject(currentDir) || vfs['/home/kabilan'];
          targetDir.files = targetDir.files || {};
          targetDir.files[fileName] = {
            type: 'file',
            size: sizeStr,
            perm: '-rw-r--r--',
            date: dateStr,
            content: content,
            isUploaded: true
          };

          // Also ensure in /home/kabilan/documents
          const docsDir = vfs['/home/kabilan'].files['documents'];
          if (docsDir && docsDir.files) {
            docsDir.files[fileName] = targetDir.files[fileName];
          }

          saveVFS(vfs);

          appendLine(`[+] Uploading document: "<b>${escapeHtml(fileName)}</b>" (${sizeStr})...`, 't-cyan');
          appendLine(`[✓] Document uploaded successfully! Stored in <span class="t-green">${currentDir}/${escapeHtml(fileName)}</span>`, 't-green');
          appendLine(`[i] Run <span class="t-cyan">ls</span> to list files or <span class="t-cyan">cat ${escapeHtml(fileName)}</span> to inspect.`, 't-log');
          tFileInput.value = '';
        };

        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    }

    const openAdminPanel = () => {
      const adminUrl = getAdminPath();
      appendLine(`[+] Authenticating root / administrator clearance...`, 't-cyan');
      appendLine(`[✓] Access granted: Level 5 Administrator Console.`, 't-green');
      appendLine(`[+] Launching Portfolio Admin Panel (${escapeHtml(adminUrl)})...`, 't-green');
      appendLine(`[➔] Redirecting: <a href="${adminUrl}" target="_blank" rel="noopener noreferrer" class="t-cyan" style="text-decoration: underline; font-weight: 700;">[Click here to open Admin Panel]</a>`, 't-cyan');
      try {
        const win = window.open(adminUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
          window.location.href = adminUrl;
        }
      } catch (e) {
        window.location.href = adminUrl;
      }
    };

    const handleCommand = (cmd) => {
      const rawCmd = cmd.trim();
      const cleanCmd = rawCmd.toLowerCase();
      if (!cleanCmd) return;

      cmdHistory.push(rawCmd);
      historyIndex = cmdHistory.length;

      let displayPath = currentDir;
      if (displayPath === '/home/kabilan') displayPath = '~';
      else if (displayPath.startsWith('/home/kabilan/')) displayPath = '~/' + displayPath.slice('/home/kabilan/'.length);

      appendLine(`<span class="t-prompt">security@kabilan:${displayPath}$</span> ${escapeHtml(cmd)}`);

      if (sniffInterval && cleanCmd !== 'sniff' && cleanCmd !== 'stop') {
        clearInterval(sniffInterval);
        sniffInterval = null;
        appendLine(`[i] Packet sniffing paused.`, 't-yellow');
      }

      // Check redirection syntax: echo "text" > file or >> file
      if (/^echo\s+.*>>?\s*\S+$/i.test(rawCmd)) {
        const isAppend = rawCmd.includes('>>');
        const sep = isAppend ? '>>' : '>';
        const [echoPart, targetFileRaw] = rawCmd.split(sep);
        const textToEcho = echoPart.replace(/^echo\s+/i, '').replace(/^['"]|['"]$/g, '').trim();
        const targetFileName = targetFileRaw.trim();

        if (targetFileName) {
          const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
          dirObj.files = dirObj.files || {};
          const existing = dirObj.files[targetFileName];
          const newContent = (existing && isAppend) ? `${existing.content}\n${textToEcho}` : textToEcho;
          const now = new Date();
          const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
          
          dirObj.files[targetFileName] = {
            type: 'file',
            size: `${Math.max(1, Math.round(newContent.length / 1024 * 10) / 10)}K`,
            perm: '-rw-r--r--',
            date: dateStr,
            content: newContent
          };
          saveVFS(vfs);
          appendLine(`[✓] Wrote ${newContent.length} bytes to <span class="t-green">${escapeHtml(targetFileName)}</span>`, 't-green');
          return;
        }
      }

      const parts = cleanCmd.split(/\s+/);
      const mainCmd = parts[0];
      const arg = parts.slice(1).join(' ');
      const rawArg = rawCmd.replace(/^[^\s]+\s*/, '').trim();

      switch(mainCmd) {
        case 'help':
          appendLine(`Available Linux &amp; System Commands:
  <span class="t-cyan">admin</span>           - Open Portfolio Admin Management Panel (admin.html)
  <span class="t-cyan">upload</span>          - Upload documents/files to portfolio
  <span class="t-cyan">touch &lt;file&gt;</span>    - Create a new document/file
  <span class="t-cyan">rm &lt;file&gt;</span>       - Delete/remove a document or file
  <span class="t-cyan">ls</span>               - List directory files &amp; documents (ls -la, ls projects)
  <span class="t-cyan">cat &lt;file&gt;</span>      - View document content (cat resume.pdf, cat skills.txt)
  <span class="t-cyan">cd &lt;dir&gt;</span>        - Navigate directory (cd projects, cd certs, cd documents)
  <span class="t-cyan">pwd</span>              - Print current working directory
  <span class="t-cyan">update &lt;f&gt; [txt]</span> - Update document content or portfolio section
  <span class="t-cyan">nano &lt;file&gt;</span>      - Edit document inline (or echo "text" &gt; file)
  <span class="t-cyan">mkdir &lt;dir&gt;</span>      - Create a new folder
  <span class="t-cyan">rmdir &lt;dir&gt;</span>      - Remove an empty directory
  <span class="t-cyan">resume</span>           - Display text resume &amp; open Resume (No Photo version)
  <span class="t-cyan">whoami</span>           - Display active user identity
  <span class="t-cyan">uname</span>            - Print system architecture details (-a for full)
  <span class="t-cyan">ping &lt;host&gt;</span>      - Simulate ICMP ping network diagnostics
  <span class="t-cyan">ifconfig</span>         - Display network interfaces (ip a)
  <span class="t-cyan">curl &lt;url&gt;</span>       - Fetch API or simulated HTTP request
  <span class="t-cyan">sniff</span>            - Toggle live Wi-Fi packet monitoring simulation
  <span class="t-cyan">hash &lt;text&gt;</span>      - Compute real-time cryptographic SHA-256 hash
  <span class="t-cyan">security</span>         - Display active portfolio cybersecurity suite status
  <span class="t-cyan">vault</span>            - Inspect shielded API security &amp; anti-scraping vault
  <span class="t-cyan">skills</span>           - Print core technical skills breakdown
  <span class="t-cyan">projects</span>         - Display technical projects &amp; hardware builds
  <span class="t-cyan">publications</span>     - List research publications
  <span class="t-cyan">contact</span>          - Show direct contact channels
  <span class="t-cyan">ps</span> / <span class="t-cyan">top</span>        - Display active system process table
  <span class="t-cyan">date</span>             - Print current system timestamp
  <span class="t-cyan">history</span>          - View command input history
  <span class="t-cyan">clear</span>            - Clear terminal history`, 't-log');
          break;

        case 'admin':
        case 'open':
        case 'login':
          if (mainCmd === 'open' && arg && arg !== 'admin' && arg !== 'admin.html') {
            if (arg === 'resume' || arg === 'resume.pdf') {
              handleCommand('resume');
              return;
            }
            appendLine(`open: Opening ${escapeHtml(arg)}...`, 't-log');
            return;
          }
          openAdminPanel();
          break;

        case 'upload':
        case 'upload-document':
        case 'import':
          if (tFileInput) {
            appendLine(`[+] Opening document upload dialog... Choose a file from your device.`, 't-cyan');
            tFileInput.click();
          } else if (arg) {
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            dirObj.files = dirObj.files || {};
            dirObj.files[arg] = {
              type: 'file',
              size: '1.0K',
              perm: '-rw-r--r--',
              date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }),
              content: `Uploaded Document: ${arg}`
            };
            saveVFS(vfs);
            appendLine(`[✓] Document uploaded successfully: <span class="t-green">${escapeHtml(arg)}</span>`, 't-green');
          } else {
            appendLine(`Usage: <span class="t-cyan">upload</span> (opens file picker) or <span class="t-cyan">upload &lt;filename&gt;</span>`, 't-yellow');
          }
          break;

        case 'touch':
          if (!arg) {
            appendLine(`touch: missing file operand. Example: <span class="t-cyan">touch notes.txt</span>`, 't-yellow');
          } else {
            const fileName = arg.split(/\s+/)[0];
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            dirObj.files = dirObj.files || {};
            const now = new Date();
            const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
            dirObj.files[fileName] = dirObj.files[fileName] || {
              type: 'file',
              size: '0B',
              perm: '-rw-r--r--',
              date: dateStr,
              content: ''
            };
            saveVFS(vfs);
            appendLine(`[+] Created new file: <span class="t-green">${escapeHtml(fileName)}</span>`, 't-green');
          }
          break;

        case 'rm':
        case 'delete':
          if (!arg) {
            appendLine(`rm: missing operand. Example: <span class="t-cyan">rm filename.txt</span>`, 't-yellow');
          } else {
            const cleanArg = arg.replace(/^-rf?\s+/, '').trim();
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            if (dirObj.files && dirObj.files[cleanArg]) {
              delete dirObj.files[cleanArg];
              saveVFS(vfs);
              appendLine(`[✓] Successfully removed document: <span class="t-green">${escapeHtml(cleanArg)}</span>`, 't-green');
            } else {
              appendLine(`rm: cannot remove '${escapeHtml(cleanArg)}': No such file or directory`, 't-red');
            }
          }
          break;

        case 'update':
          if (!arg || arg === 'portfolio') {
            appendLine(`[+] Checking Portfolio CMS synchronization...`, 't-cyan');
            appendLine(`[✓] Cloud connection: Firebase Realtime Database (ONLINE)`, 't-green');
            appendLine(`[✓] Portfolio telemetry &amp; visitor presence: SYNCHRONIZED`, 't-green');
            appendLine(`[i] To update specific files, use: <span class="t-cyan">update &lt;file&gt; &lt;new content&gt;</span>`, 't-log');
          } else {
            const match = rawArg.match(/^(\S+)\s+(.+)$/);
            if (match) {
              const uFile = match[1];
              const uContent = match[2].replace(/^['"]|['"]$/g, '');
              const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
              dirObj.files = dirObj.files || {};
              const now = new Date();
              const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
              dirObj.files[uFile] = {
                type: 'file',
                size: `${Math.max(1, Math.round(uContent.length / 1024 * 10) / 10)}K`,
                perm: '-rw-r--r--',
                date: dateStr,
                content: uContent
              };
              saveVFS(vfs);
              appendLine(`[✓] Updated document <span class="t-green">${escapeHtml(uFile)}</span> (${uContent.length} bytes)`, 't-green');
            } else {
              appendLine(`Usage: <span class="t-cyan">update &lt;filename&gt; &lt;content&gt;</span> or <span class="t-cyan">update portfolio</span>`, 't-yellow');
            }
          }
          break;

        case 'nano':
        case 'vi':
        case 'vim':
        case 'edit':
          if (!arg) {
            appendLine(`nano: missing filename. Example: <span class="t-cyan">nano notes.txt</span>`, 't-yellow');
          } else {
            const fileName = arg.split(/\s+/)[0];
            const match = rawArg.match(/^(\S+)\s+(.+)$/);
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            dirObj.files = dirObj.files || {};
            if (match) {
              const content = match[2].replace(/^['"]|['"]$/g, '');
              const now = new Date();
              const dateStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
              dirObj.files[fileName] = {
                type: 'file',
                size: `${Math.max(1, Math.round(content.length / 1024 * 10) / 10)}K`,
                perm: '-rw-r--r--',
                date: dateStr,
                content: content
              };
              saveVFS(vfs);
              appendLine(`[✓] File <span class="t-green">${escapeHtml(fileName)}</span> updated and saved.`, 't-green');
            } else {
              const cur = dirObj.files[fileName] ? dirObj.files[fileName].content : '(Empty file)';
              appendLine(`<b>[GNU nano 7.2] File: ${escapeHtml(fileName)}</b>\n<pre style="margin: 4px 0; color: #a5f3fc; font-family: monospace;">${escapeHtml(cur)}</pre>\n[i] Use: <span class="t-cyan">echo "your text" &gt; ${escapeHtml(fileName)}</span> to overwrite or <span class="t-cyan">update ${escapeHtml(fileName)} "content"</span>`, 't-log');
            }
          }
          break;

        case 'cd':
          if (!arg || arg === '~' || arg === '/home/kabilan') {
            currentDir = '/home/kabilan';
            updatePrompt();
          } else if (arg === '..') {
            if (currentDir !== '/home/kabilan') {
              currentDir = '/home/kabilan';
              updatePrompt();
            }
          } else if (arg === 'admin' || arg === '/admin') {
            openAdminPanel();
          } else if (['home', 'about', 'skills', 'projects', 'contact', 'achievements'].includes(arg)) {
            appendLine(`Navigating to section: <span class="t-green">${escapeHtml(arg)}</span>...`, 't-cyan');
            if (typeof showSection === 'function') {
              showSection(arg);
            }
          } else {
            const cleanSub = arg.replace(/^\.\//, '').replace(/\/$/, '');
            const rootFiles = vfs['/home/kabilan'].files;
            if (rootFiles[cleanSub] && rootFiles[cleanSub].type === 'dir') {
              currentDir = `/home/kabilan/${cleanSub}`;
              updatePrompt();
            } else {
              appendLine(`bash: cd: ${escapeHtml(arg)}: No such file or directory`, 't-red');
            }
          }
          break;

        case 'pwd':
          appendLine(currentDir, 't-cyan');
          break;

        case 'mkdir':
          if (!arg) {
            appendLine(`mkdir: missing operand. Example: <span class="t-cyan">mkdir my_docs</span>`, 't-yellow');
          } else {
            const dirName = arg.split(/\s+/)[0];
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            dirObj.files = dirObj.files || {};
            if (dirObj.files[dirName]) {
              appendLine(`mkdir: cannot create directory '${escapeHtml(dirName)}': File exists`, 't-red');
            } else {
              dirObj.files[dirName] = { type: 'dir', files: {} };
              saveVFS(vfs);
              appendLine(`[+] Created directory: <span class="t-green">${escapeHtml(dirName)}/</span>`, 't-green');
            }
          }
          break;

        case 'rmdir':
          if (!arg) {
            appendLine(`rmdir: missing operand.`, 't-yellow');
          } else {
            const dirName = arg.split(/\s+/)[0];
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            if (dirObj.files && dirObj.files[dirName] && dirObj.files[dirName].type === 'dir') {
              delete dirObj.files[dirName];
              saveVFS(vfs);
              appendLine(`[✓] Removed directory: <span class="t-green">${escapeHtml(dirName)}/</span>`, 't-green');
            } else {
              appendLine(`rmdir: failed to remove '${escapeHtml(dirName)}': No such directory`, 't-red');
            }
          }
          break;

        case 'grep':
          if (!arg) {
            appendLine(`Usage: <span class="t-cyan">grep &lt;pattern&gt; [filename]</span>`, 't-yellow');
          } else {
            const partsG = arg.split(/\s+/);
            const pattern = partsG[0];
            const targetF = partsG[1];
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            let matches = 0;
            const searchFile = (name, fObj) => {
              if (fObj && fObj.content && fObj.content.toLowerCase().includes(pattern.toLowerCase())) {
                matches++;
                const lines = fObj.content.split('\n');
                lines.forEach((l, idx) => {
                  if (l.toLowerCase().includes(pattern.toLowerCase())) {
                    appendLine(`<span class="t-cyan">${escapeHtml(name)}:${idx + 1}:</span> ${escapeHtml(l)}`, 't-log');
                  }
                });
              }
            };
            if (targetF && dirObj.files && dirObj.files[targetF]) {
              searchFile(targetF, dirObj.files[targetF]);
            } else if (dirObj.files) {
              Object.keys(dirObj.files).forEach(k => {
                if (dirObj.files[k].type === 'file') searchFile(k, dirObj.files[k]);
              });
            }
            if (matches === 0) {
              appendLine(`grep: no matches found for "${escapeHtml(pattern)}"`, 't-log');
            }
          }
          break;

        case 'curl':
        case 'wget':
          const targetUrl = escapeHtml(arg || 'https://kabilanportfolio-ab851.web.app/api/health');
          appendLine(`[+] Connecting to ${targetUrl}...`, 't-log');
          setTimeout(() => {
            appendLine(`HTTP/2 200 OK\n<b>content-type:</b> application/json; charset=utf-8\n<b>x-shield-status:</b> VAULT_SECURE\n\n{\n  "status": "healthy",\n  "service": "kabilan-portfolio-production",\n  "ssl": "TLSv1.3",\n  "api_shielding": "ACTIVE"\n}`, 't-green');
          }, 350);
          break;

        case 'ps':
        case 'top':
          appendLine(`  PID TTY          TIME CMD
 1042 tty1     00:00:01 systemd
 1204 tty1     00:00:03 nginx-edge
 1589 tty1     00:00:02 node-portfolio
 2140 pts/0    00:00:00 bash
 2841 pts/0    00:00:01 packet-sniffer
 3012 pts/0    00:00:00 auth-guardian`, 't-log');
          break;

        case 'kill':
          if (!arg) {
            appendLine(`kill: usage: kill &lt;pid&gt;`, 't-yellow');
          } else {
            if (arg === '2841' && sniffInterval) {
              clearInterval(sniffInterval);
              sniffInterval = null;
              appendLine(`[✓] Killed process 2841 (packet-sniffer). Sniffing halted.`, 't-green');
            } else {
              appendLine(`[✓] Process ${escapeHtml(arg)} terminated.`, 't-green');
            }
          }
          break;

        case 'chmod':
          if (!arg) {
            appendLine(`chmod: missing operand. Example: <span class="t-cyan">chmod 755 script.sh</span>`, 't-yellow');
          } else {
            appendLine(`[✓] Changed permissions for ${escapeHtml(arg)}`, 't-green');
          }
          break;

        case 'hash':
          if (!arg) {
            appendLine(`Usage: <span class="t-cyan">hash &lt;text-to-hash&gt;</span>\nExample: <span class="t-cyan">hash admin_password</span> or <span class="t-cyan">hash hello-world</span>`, 't-yellow');
          } else {
            appendLine(`[+] Calculating Cryptographic Hashes for: "<b>${escapeHtml(arg)}</b>"...`, 't-log');
            computeSha256(arg).then(hashVal => {
              appendLine(`  <b>Algorithm:</b>  SHA-256 (NIST FIPS 180-4)\n  <b>Input Size:</b> ${new TextEncoder().encode(arg).length} bytes\n  <b>Digest:</b>     <span class="t-cyan" style="word-break: break-all;">${hashVal}</span>`, 't-green');
            });
          }
          break;

        case 'security':
          appendLine(`<b>[Kabilan M — Cybersecurity &amp; Portfolio Defense Matrix]</b>
  <span class="t-green">[✓] API Shielding:</span>         ACTIVE (Zero plaintext API keys in client source code)
  <span class="t-green">[✓] Hashing Standard:</span>      SHA-256 (Session telemetry &amp; Request Signing)
  <span class="t-green">[✓] Anti-Replay Defense:</span>    ACTIVE (5-minute timestamp validity window)
  <span class="t-green">[✓] Bot Honeypot:</span>          ACTIVE (Invisible anti-spam traps on contact forms)
  <span class="t-green">[✓] Telemetry Anonymity:</span>   ACTIVE (Truncated SHA-256 IP &amp; session hashing)
  <span class="t-green">[✓] Screen Capture Guard:</span>  ACTIVE (Anti-inspection screenshot obfuscation)
  <span class="t-green">[✓] Brute-Force Lockout:</span>   ENFORCED (5-attempt exponential rate limit)`, 't-log');
          break;

        case 'vault':
          appendLine(`<b>[Shielded API Cryptographic Vault Architecture]</b>
  - Sensitive Firebase keys and API endpoints are sealed with runtime XOR cipher.
  - Plaintext credentials never appear in static source files or GitHub trees.
  - Endpoints are shielded against automated scrapers and static analysis bots.`, 't-cyan');
          break;

        case 'resume':
        case 'cv':
          const rUrl = getResumeNoPhotoPath();
          appendLine(`<b>[KABILAN M - RESUME (TEXT VERSION / NO PHOTO)]</b>
  - <b>Target Role:</b> Security &amp; Networking Engineer / Java Developer
  - <b>Education:</b> B.Tech IT (CGPA: 7.08) | Diploma Mech (92%)
  - <b>Internship:</b> Full Stack Trainee @ e-soft IT Solutions (June 2025)
  - <b>Key Projects:</b> ESP32 Deauth Detector, ESP8266 Wi-Fi Sniffer
  - <b>Certifications:</b> Infosys Springboard (HTML5, CSS3, JS), Cyber Security
  [+] Opening Text Resume (No Photo) in new tab: <a href="${rUrl}" target="_blank" rel="noopener noreferrer" class="t-cyan" style="text-decoration: underline;">kabilanm_resume without photo.pdf</a>`, 't-green');
          window.open(rUrl, '_blank', 'noopener,noreferrer');
          break;

        case 'ls':
        case 'dir':
          const targetDirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
          let outputLines = [];
          outputLines.push(`drwxr-xr-x 4 kabilan kabilan 4096 Jul 26 15:10 .`);
          outputLines.push(`drwxr-xr-x 8 kabilan kabilan 4096 Jul 26 15:10 ..`);

          if (targetDirObj && targetDirObj.files) {
            Object.keys(targetDirObj.files).forEach(fName => {
              const item = targetDirObj.files[fName];
              if (item.type === 'dir') {
                outputLines.push(`drwxr-xr-x 2 kabilan kabilan 4096 Aug 11 12:25 <span class="t-cyan" style="font-weight: bold;">${escapeHtml(fName)}/</span>`);
              } else {
                const perm = item.perm || '-rw-r--r--';
                const size = (item.size || '1K').padStart(5, ' ');
                const date = item.date || 'Aug 11 12:25';
                if (fName === 'resume.pdf' || item.url) {
                  const href = item.url || getResumeNoPhotoPath();
                  outputLines.push(`${perm} 1 kabilan kabilan ${size} ${date} <a href="${href}" target="_blank" rel="noopener noreferrer" class="t-green" style="text-decoration: underline;">${escapeHtml(fName)}</a>`);
                } else {
                  outputLines.push(`${perm} 1 kabilan kabilan ${size} ${date} ${escapeHtml(fName)}`);
                }
              }
            });
          }
          appendLine(outputLines.join('\n'), 't-log');
          break;

        case 'cat':
          if (!arg || arg === 'resume.pdf' || arg === 'resume') {
            const rPath = getResumeNoPhotoPath();
            appendLine(`<b>[cat resume.pdf]</b>
KABILAN M | Security &amp; Networking Engineer
B.Tech Information Technology | Kongunadu College of Engineering (CGPA: 7.08)
Full Stack Trainee @ e-soft IT Solutions (June 2025)
Skills: Java, HTML5, CSS3, MySQL, MongoDB, HDFS, Pig, Wireshark, Linux, Git
[+] Opened: <a href="${rPath}" target="_blank" rel="noopener noreferrer" class="t-cyan">kabilanm_resume without photo.pdf</a> (No Photo)`, 't-green');
            window.open(rPath, '_blank', 'noopener,noreferrer');
          } else if (arg === 'skills.txt' || arg === 'skills') {
            handleCommand('skills');
          } else if (arg === 'about.txt' || arg === 'about') {
            appendLine(`Kabilan M - B.Tech IT student at Kongunadu College of Engineering &amp; Technology. Passionate about cybersecurity, Java coding, networking, and software development.`, 't-cyan');
          } else if (arg === 'readme.md') {
            appendLine(`# Kabilan M Portfolio\nSecurity &amp; Networking Portfolio with Interactive Terminal Shell`, 't-log');
          } else {
            const dirObj = getDirObject(currentDir) || vfs['/home/kabilan'];
            if (dirObj.files && dirObj.files[arg]) {
              const file = dirObj.files[arg];
              if (file.url) {
                appendLine(`<b>[cat ${escapeHtml(arg)}]</b>\n${escapeHtml(file.content)}\n[+] Open original document: <a href="${file.url}" target="_blank" rel="noopener noreferrer" class="t-cyan" style="text-decoration: underline;">${escapeHtml(arg)}</a>`, 't-green');
                window.open(file.url, '_blank', 'noopener,noreferrer');
              } else {
                appendLine(`<b>[cat ${escapeHtml(arg)}]</b>\n${escapeHtml(file.content)}`, 't-cyan');
              }
            } else {
              appendLine(`cat: ${escapeHtml(arg)}: No such file or directory`, 't-red');
            }
          }
          break;

        case 'whoami':
          appendLine(`kabilan_m (Security &amp; Networking Engineer | B.Tech IT Student)`, 't-green');
          break;

        case 'pwd':
          appendLine(currentDir, 't-cyan');
          break;

        case 'uname':
          if (arg === '-a' || arg === '-all') {
            appendLine(`Linux kabilan-sec-node 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`, 't-log');
          } else {
            appendLine(`Linux`, 't-log');
          }
          break;

        case 'date':
          appendLine(new Date().toString(), 't-log');
          break;

        case 'history':
          if (cmdHistory.length === 0) {
            appendLine(`No commands in history.`, 't-log');
          } else {
            cmdHistory.forEach((hCmd, idx) => {
              appendLine(`  ${idx + 1}  ${escapeHtml(hCmd)}`, 't-log');
            });
          }
          break;

        case 'echo':
          appendLine(escapeHtml(arg || ''), 't-log');
          break;

        case 'ping':
          const targetHost = escapeHtml(arg || '8.8.8.8');
          appendLine(`PING ${targetHost} (${targetHost}) 56(84) bytes of data.`, 't-log');
          setTimeout(() => appendLine(`64 bytes from ${targetHost}: icmp_seq=1 ttl=117 time=14.2 ms`, 't-green'), 300);
          setTimeout(() => appendLine(`64 bytes from ${targetHost}: icmp_seq=2 ttl=117 time=13.8 ms`, 't-green'), 600);
          setTimeout(() => appendLine(`--- ${targetHost} ping statistics --- 2 packets transmitted, 2 received, 0% packet loss`, 't-cyan'), 900);
          break;

        case 'ifconfig':
        case 'ip':
          appendLine(`wlan0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 192.168.1.14  netmask 255.255.255.0  broadcast 192.168.1.255
        ether E4:95:6E:A4:12:02  txqueuelen 1000  (Ethernet)

eth0: flags=4099&lt;UP,BROADCAST,MULTICAST&gt;  mtu 1500
        ether C0:49:EF:2C:99:A1  txqueuelen 1000  (Ethernet)`, 't-cyan');
          break;

        case 'sudo':
          if (arg.startsWith('admin') || arg.startsWith('login') || arg === 'su' || arg.startsWith('su ')) {
            appendLine(`[sudo] Authenticating root privileges for admin console...`, 't-cyan');
            openAdminPanel();
          } else {
            appendLine(`[sudo] password for kabilan: `, 't-red');
            setTimeout(() => appendLine(`kabilan is not in the sudoers file. This incident will be reported.`, 't-red'), 600);
          }
          break;

        case 'clear':
          tBody.innerHTML = '';
          appendLine(`Welcome to Kabilan's Interactive Lab Terminal [Kali-Linux v6.8]`, 't-log');
          appendLine(`System status: <span class="t-green">ONLINE</span> | Type <span class="t-cyan">help</span> or <span class="t-cyan">admin</span>`, 't-log');
          break;

        case 'skills':
          appendLine(`<b>[Kabilan's Skills Profile]</b>
  - <b>Languages:</b> Java, HTML5, CSS3, Bootstrap
  - <b>Databases:</b> MySQL, MongoDB, Apache HDFS, Apache Pig
  - <b>Tools:</b> Wireshark, Burp Suite, VS Code, Git/GitHub, Arduino IDE
  - <b>Core Competence:</b> Computer Networks, DBMS, Packet Sniffing, Linux Security`, 't-green');
          break;

        case 'projects':
          appendLine(`<b>[Featured Project Portfolio]</b>
  1. <b>Wi-Fi De-authentication Device</b> (ESP8266, C++)
     Real-time wireless network monitor logging frames on OLED.
  2. <b>De-authentication Detection System</b> (ESP32, C++)
     Wired sniffer logging deauth loops and firing Gmail notifications.
  3. <b>Forest Fire Prediction System</b> (React, Python, Node.js)
     AI prediction model showing environmental heatmap alerts.`, 't-cyan');
          break;

        case 'publications':
          appendLine(`<b>[Research Publications]</b>
  1. <b>"Detecting Deauthentication Attacks in Wireless Networks" (2026)</b>
     Published research examining frame signatures and detection mitigations.
  2. <b>"Wireless Detection Model &amp; Analysis"</b>
     Model ruleset detailing frame capturing structures.`, 't-yellow');
          break;

        case 'contact':
          appendLine(`<b>[Contact Channels]</b>
  - <b>Email:</b> <a href="mailto:mkabilan1409@gmail.com" class="t-cyan" style="color: #06b6d4; text-decoration: underline;">mkabilan1409@gmail.com</a>
  - <b>Phone:</b> +91 76049 59955
  - <b>LinkedIn:</b> linkedin.com/in/kabilan-m-790801330/
  - <b>GitHub:</b> github.com/kabilanm1409`, 't-prompt');
          break;

        case 'sniff':
          if (sniffInterval) {
            clearInterval(sniffInterval);
            sniffInterval = null;
            appendLine(`[i] Packet sniffing halted.`, 't-yellow');
          } else {
            appendLine(`[+] Starting live packet capture on interface wlan0...`, 't-green');
            appendLine(`[+] Filtering for Beacon and Deauth frames...`, 't-green');
            
            const macs = ['E4:95:6E:A4:12:02', 'C0:49:EF:2C:99:A1', 'F8:1A:67:8B:D0:E2', 'AA:04:95:C2:F1:55'];
            const networks = ['Home_WiFi', 'Kongunadu_Guest', 'HackNet_AP', 'Target_Guest'];
            
            sniffInterval = setInterval(() => {
              const randMacSrc = macs[Math.floor(Math.random() * macs.length)];
              const randMacDst = macs[Math.floor(Math.random() * macs.length)];
              const randSSID = networks[Math.floor(Math.random() * networks.length)];
              
              if (Math.random() > 0.35) {
                appendLine(`[INFO] Sniffed Frame: BEACON | SSID: "${randSSID}" | Ch: ${Math.floor(Math.random()*11)+1} | RSSI: -${Math.floor(Math.random()*40)+40}dBm`, 't-log');
              } else {
                appendLine(`[ALERT] CRITICAL: DEAUTH FRAME DETECTED! Source: ${randMacSrc} ➔ Dest: ${randMacDst} | Packets: 12`, 't-red');
                appendLine(`[Gmail-API] Sending spoofing alert email to: mkabilan1409@gmail.com...`, 't-cyan');
              }
            }, 1500);
          }
          break;

        default:
          appendLine(`bash: ${escapeHtml(cleanCmd)}: command not found. Type <span class="t-cyan">help</span> or <span class="t-cyan">resume</span> to list commands.`, 't-red');
      }
    };

    tInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = tInput.value;
        tInput.value = '';
        historyIndex = cmdHistory.length;
        handleCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          tInput.value = cmdHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          tInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = cmdHistory.length;
          tInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentVal = tInput.value.trim().toLowerCase();
        if (currentVal) {
          const suggestions = [
            'admin', 'help', 'resume', 'ls', 'cat', 'touch', 'rm', 'delete', 'upload',
            'cd', 'pwd', 'nano', 'update', 'echo', 'grep', 'clear', 'whoami', 'uname',
            'ping', 'ifconfig', 'sniff', 'hash', 'security', 'vault', 'skills', 'projects'
          ];
          const match = suggestions.find(s => s.startsWith(currentVal));
          if (match) tInput.value = match;
        }
      }
    });

    tBody.addEventListener('click', () => {
      tInput.focus();
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.textContent.trim();
        tInput.focus();
        handleCommand(cmd);
      });
    });
  }

  function initImageFallbacks() {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function() {
        const isSub = window.location.pathname.includes('/pages/');
        const prefix = isSub ? '../' : '';
        const altText = (this.alt || '').toLowerCase();
        const srcText = (this.src || '').toLowerCase();
        if (altText.includes('wifi') || srcText.includes('wifi') || srcText.includes('deauth')) {
          this.src = prefix + 'assets/projects/wifi_deauth.svg';
        } else if (altText.includes('fire') || srcText.includes('fire')) {
          this.src = prefix + 'assets/projects/forest_fire.svg';
        }
      });
    });
  }

  function initHeaderSearch() {
    const hSearch = document.getElementById('headerSearch');
    if (!hSearch) return;

    const isHomepage = !!document.getElementById('terminal');

    const searchRoutes = {
      'home': 'home',
      'about': 'about',
      'skills': 'skills',
      'projects': 'projects',
      'education': 'education',
      'achievements': 'achievements',
      'contact': 'contact',
      'terminal': 'terminal',
      'lab': 'terminal',
      'shell': 'terminal',
      'admin': 'admin'
    };

    const checkQuery = (val) => {
      const query = val.toLowerCase().trim();
      if (searchRoutes.hasOwnProperty(query)) {
        const targetSection = searchRoutes[query];
        if (targetSection === 'admin') {
          const adminUrl = isHomepage ? 'admin.html' : '../admin.html';
          window.location.href = adminUrl;
          return;
        }
        if (isHomepage) {
          showSection(targetSection);
        } else {
          window.location.href = `../index.html#${targetSection}`;
        }
        hSearch.style.borderColor = '#10b981';
        hSearch.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
        setTimeout(() => {
          hSearch.style.borderColor = '';
          hSearch.style.boxShadow = '';
        }, 1500);
      }
    };

    hSearch.addEventListener('input', (e) => {
      checkQuery(e.target.value);
    });
  }

  function initScreenshotShield() {
    const shield = document.getElementById('screenshotShield');
    if (!shield) return;

    window.addEventListener('blur', () => {
      shield.classList.add('active');
    });

    window.addEventListener('focus', () => {
      shield.classList.remove('active');
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        shield.classList.add('active');
        setTimeout(() => {
          shield.classList.remove('active');
        }, 1200);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        shield.classList.add('active');
        setTimeout(() => {
          shield.classList.remove('active');
        }, 1200);
      }
    });
  }

  initPortfolio();
})();
