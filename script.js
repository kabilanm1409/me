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
let currentSection = '';
// Track which sections have had their animations triggered
const animatedSections = new Set(['home']);

// ── Section Switcher ─────────────────────────────────────────
function showSection(targetId) {
  if (targetId === currentSection) return;

  // Toggle Terminal tab visibility in navbar based on target section
  const navTerminal = document.getElementById('nav-terminal');
  if (navTerminal) {
    if (targetId === 'terminal') {
      navTerminal.style.display = 'inline-flex';
    } else {
      navTerminal.style.display = 'none';
    }
  }

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
    showSection(hash);
  } else {
    showSection('home');
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

// ── Project Filters & Search ─────────────────────────────────
function initProjectFilters() {
  const searchInput = document.getElementById('projectSearch');
  if (!filterButtons.length && !searchInput) return;
  
  let currentFilter = 'all';
  let searchQuery = '';
  
  const applyFilterAndSearch = () => {
    projectCards.forEach(card => {
      // Category filter check
      const cats = String(card.dataset.category || '').split(',').map(c => c.trim());
      const matchesCategory = (currentFilter === 'all' || cats.includes(currentFilter));
      
      // Search query text check (matches title, description, and list items/technologies tags)
      const title = String(card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = String(card.querySelector('p')?.textContent || '').toLowerCase();
      const tags = String(card.querySelector('.tag-row')?.textContent || '').toLowerCase();
      const listItems = Array.from(card.querySelectorAll('ul li')).map(li => li.textContent.toLowerCase()).join(' ');
      
      const textToSearch = `${title} ${desc} ${tags} ${listItems}`;
      const matchesSearch = !searchQuery || textToSearch.includes(searchQuery);
      
      card.classList.toggle('is-hidden', !(matchesCategory && matchesSearch));
    });
  };
  
  // Filter buttons listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter || 'all';
      applyFilterAndSearch();
    });
  });
  
  // Search input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilterAndSearch();
    });
  }
  
  applyFilterAndSearch();
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
  initTerminal();         // Start interactive security/networking shell
  initHeaderSearch();     // Start global header search and Easter Egg check
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

// ── Cyber Terminal Simulation ─────────────────────────────────
let sniffInterval = null;

function initTerminal() {
  const tInput = document.getElementById('terminalInput');
  const tBody = document.getElementById('terminalBody');
  const chips = document.querySelectorAll('.cmd-chip');
  
  if (!tInput || !tBody) return;

  const appendLine = (text, type = '') => {
    const line = document.createElement('div');
    line.className = 't-line';
    if (type) line.classList.add(type);
    line.innerHTML = text;
    tBody.appendChild(line);
    tBody.scrollTop = tBody.scrollHeight; // Auto-scroll to bottom
  };

  const handleCommand = (cmd) => {
    const cleanCmd = cmd.toLowerCase().trim();
    appendLine(`<span class="t-prompt">security@kabilan:~$</span> ${cmd}`);

    // If active sniffing is running and user types something else, pause it
    if (sniffInterval && cleanCmd !== 'sniff' && cleanCmd !== 'stop') {
      clearInterval(sniffInterval);
      sniffInterval = null;
      appendLine(`[i] Packet sniffing paused.`, 't-yellow');
    }

    switch(cleanCmd) {
      case '':
        break;
      case 'help':
        appendLine(`Available commands:
  <span class="t-cyan">skills</span>       - Print core technical skills list
  <span class="t-cyan">projects</span>     - Display technical projects info
  <span class="t-cyan">publications</span> - List research publications
  <span class="t-cyan">sniff</span>        - Toggle live Wi-Fi packet monitoring simulation
  <span class="t-cyan">contact</span>      - Show email and phone details
  <span class="t-cyan">clear</span>        - Clear terminal history`, 't-log');
        break;
      case 'clear':
        tBody.innerHTML = '';
        appendLine(`Welcome to Kabilan's Interactive Lab Terminal [Sniffer v1.0.4]`, 't-log');
        appendLine(`System status: <span class="t-green">ONLINE</span>`, 't-log');
        break;
      case 'skills':
        appendLine(`<b>[Kabilan's Skills Profile]</b>
  - <b>Languages:</b> Java, HTML5, CSS3
  - <b>Databases:</b> MySQL, MongoDB, Apache HDFS, Apache Pig
  - <b>Tools:</b> Wireshark, Git/GitHub, Arduino IDE
  - <b>Core Competence:</b> Computer Networks, DBMS, Packet Sniffing`, 't-green');
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
  2. <b>"Wireless Detection Model & Analysis"</b>
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
            
            // Randomly trigger a normal log or a critical deauth alert
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
        appendLine(`bash: ${cleanCmd}: command not found. Type <span class="t-cyan">help</span> to list commands.`, 't-red');
    }
  };

  tInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = tInput.value;
      tInput.value = '';
      handleCommand(val);
    }
  });

  // Keep focus on input when clicking terminal body
  tBody.addEventListener('click', () => {
    tInput.focus();
  });

  // Hook up chip click actions
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.textContent.trim();
      tInput.focus();
      handleCommand(cmd);
    });
  });
}

// ── Global Header Search Easter Egg & Navigation ──────────────
function initHeaderSearch() {
  const hSearch = document.getElementById('headerSearch');
  const navTerminal = document.getElementById('nav-terminal');
  
  if (!hSearch) return;

  const isHomepage = !!document.getElementById('terminal');

  // Mapping of search keywords to section IDs
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
    
    // Check if the query matches one of our routes
    if (searchRoutes.hasOwnProperty(query)) {
      const targetSection = searchRoutes[query];
      
      if (isHomepage) {
        // Switch section on the homepage
        showSection(targetSection);
      } else {
        // Redirect to homepage with section hash
        window.location.href = `../index.html#${targetSection}`;
      }
      
      // Visual feedback: brief green glow border
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

initPortfolio();
