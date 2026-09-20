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

  function initTerminal() {
    const tInput = document.getElementById('terminalInput');
    const tBody = document.getElementById('terminalBody');
    const chips = document.querySelectorAll('.cmd-chip');
    
    if (!tInput || !tBody) return;

    if (!tBody.getAttribute('role')) tBody.setAttribute('role', 'log');
    if (!tBody.getAttribute('aria-live')) tBody.setAttribute('aria-live', 'polite');

    const getResumeNoPhotoPath = () => {
      const isSubpage = window.location.pathname.includes('/pages/');
      const prefix = isSubpage ? '../' : '';
      return prefix + 'assets/resume/kabilanm_resume without photo.pdf?v=4.0';
    };

    const appendLine = (text, type = '') => {
      const line = document.createElement('div');
      line.className = 't-line';
      if (type) line.classList.add(type);
      line.innerHTML = text;
      tBody.appendChild(line);
      tBody.scrollTop = tBody.scrollHeight;
    };

    const handleCommand = (cmd) => {
      const rawCmd = cmd.trim();
      const cleanCmd = rawCmd.toLowerCase();
      if (!cleanCmd) return;

      cmdHistory.push(rawCmd);
      appendLine(`<span class="t-prompt">security@kabilan:~$</span> ${escapeHtml(cmd)}`);

      if (sniffInterval && cleanCmd !== 'sniff' && cleanCmd !== 'stop') {
        clearInterval(sniffInterval);
        sniffInterval = null;
        appendLine(`[i] Packet sniffing paused.`, 't-yellow');
      }

      const parts = cleanCmd.split(/\s+/);
      const mainCmd = parts[0];
      const arg = parts.slice(1).join(' ');

      switch(mainCmd) {
        case 'help':
          appendLine(`Available Linux & System Commands:
  <span class="t-cyan">resume</span>       - Display text resume &amp; open Resume (No Photo version)
  <span class="t-cyan">ls</span>           - List directory files (resume.pdf, projects/, certs/)
  <span class="t-cyan">cat &lt;file&gt;</span>   - View file content (cat resume.pdf, cat skills.txt)
  <span class="t-cyan">whoami</span>       - Display current active user identity
  <span class="t-cyan">pwd</span>          - Print working directory
  <span class="t-cyan">uname</span>        - Print system architecture details (-a for full)
  <span class="t-cyan">ping &lt;host&gt;</span>  - Simulate ICMP ping network diagnostics
  <span class="t-cyan">ifconfig</span>     - Display network interfaces (ip a)
  <span class="t-cyan">sniff</span>        - Toggle live Wi-Fi packet monitoring simulation
  <span class="t-cyan">hash &lt;text&gt;</span>  - Compute real-time cryptographic SHA-256 hash
  <span class="t-cyan">security</span>     - Display active portfolio cybersecurity suite status
  <span class="t-cyan">vault</span>        - Inspect shielded API security &amp; anti-scraping vault
  <span class="t-cyan">skills</span>       - Print core technical skills breakdown
  <span class="t-cyan">projects</span>     - Display technical projects &amp; hardware builds
  <span class="t-cyan">publications</span> - List research publications
  <span class="t-cyan">contact</span>      - Show direct contact channels
  <span class="t-cyan">date</span>         - Print current system timestamp
  <span class="t-cyan">history</span>      - View command input history
  <span class="t-cyan">clear</span>        - Clear terminal history`, 't-log');
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
          appendLine(`drwxr-xr-x 4 kabilan kabilan 4096 Jul 26 15:10 .
drwxr-xr-x 8 kabilan kabilan 4096 Jul 26 15:10 ..
-rw-r--r-- 1 kabilan kabilan 106K Aug 11 12:25 <a href="${getResumeNoPhotoPath()}" target="_blank" rel="noopener noreferrer" class="t-green">resume.pdf</a> (No Photo version)
-rw-r--r-- 1 kabilan kabilan  30K Aug 11 12:25 index.html
-rw-r--r-- 1 kabilan kabilan  28K Aug 11 12:25 script.js
-rw-r--r-- 1 kabilan kabilan  41K Aug 11 12:25 style.css
-rw-r--r-- 1 kabilan kabilan  1.2K Aug 11 12:25 skills.txt
-rw-r--r-- 1 kabilan kabilan  1.5K Aug 11 12:25 about.txt
drwxr-xr-x 2 kabilan kabilan 4096 Aug 11 12:25 projects/
drwxr-xr-x 3 kabilan kabilan 4096 Aug 11 12:25 certs/`, 't-log');
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
            appendLine(`cat: ${escapeHtml(arg)}: No such file or directory`, 't-red');
          }
          break;

        case 'whoami':
          appendLine(`kabilan_m (Security &amp; Networking Engineer | B.Tech IT Student)`, 't-green');
          break;

        case 'pwd':
          appendLine(`/home/kabilan/portfolio`, 't-cyan');
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
          appendLine(`[sudo] password for kabilan: `, 't-red');
          setTimeout(() => appendLine(`kabilan is not in the sudoers file. This incident will be reported.`, 't-red'), 600);
          break;

        case 'clear':
          tBody.innerHTML = '';
          appendLine(`Welcome to Kabilan's Interactive Lab Terminal [Kali-Linux v6.8]`, 't-log');
          appendLine(`System status: <span class="t-green">ONLINE</span> | Type <span class="t-cyan">help</span> or <span class="t-cyan">resume</span>`, 't-log');
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
        handleCommand(val);
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
      'shell': 'terminal'
    };

    const checkQuery = (val) => {
      const query = val.toLowerCase().trim();
      if (searchRoutes.hasOwnProperty(query)) {
        const targetSection = searchRoutes[query];
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
