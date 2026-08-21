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
  const isDark = theme === 'dark';
  if (isDark) {
    document.body.dataset.theme = 'dark';
  } else {
    delete document.body.dataset.theme;
  }
  localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  if (themeToggle) {
    const icon  = themeToggle.querySelector('i');
    const label = themeToggle.querySelector('span');
    if (icon)  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
  }
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  setTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
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
  initScreenshotShield(); // Enable screen capture shield
  initFirebaseApp();       // Initialize Firebase Cloud Database
  initFirebaseLiveSync();  // Subscribe to real-time live updates from Firebase Cloud
  applyDynamicPortfolioData(); // Load custom admin overrides from LocalStorage / Firebase
  initAdminPanel();       // Initialize Admin Dashboard if on admin.html
  initVisitorNotification(); // Record visitor telemetry & fire alert notifications
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
let cmdHistory = [];

function initTerminal() {
  const tInput = document.getElementById('terminalInput');
  const tBody = document.getElementById('terminalBody');
  const chips = document.querySelectorAll('.cmd-chip');
  
  if (!tInput || !tBody) return;

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
    tBody.scrollTop = tBody.scrollHeight; // Auto-scroll to bottom
  };

  const handleCommand = (cmd) => {
    const rawCmd = cmd.trim();
    const cleanCmd = rawCmd.toLowerCase();
    if (!cleanCmd) return;

    cmdHistory.push(rawCmd);
    appendLine(`<span class="t-prompt">security@kabilan:~$</span> ${cmd}`);

    // If active sniffing is running and user types something else, pause it
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
  <span class="t-cyan">admin</span>        - Access Admin Control Panel Login
  <span class="t-cyan">resume</span>       - Display text resume &amp; open Resume (No Photo version)
  <span class="t-cyan">ls</span>           - List directory files (resume.pdf, projects/, certs/)
  <span class="t-cyan">cat &lt;file&gt;</span>   - View file content (cat resume.pdf, cat skills.txt)
  <span class="t-cyan">whoami</span>       - Display current active user identity
  <span class="t-cyan">pwd</span>          - Print working directory
  <span class="t-cyan">uname</span>        - Print system architecture details (-a for full)
  <span class="t-cyan">ping &lt;host&gt;</span>  - Simulate ICMP ping network diagnostics
  <span class="t-cyan">ifconfig</span>     - Display network interfaces (ip a)
  <span class="t-cyan">sniff</span>        - Toggle live Wi-Fi packet monitoring simulation
  <span class="t-cyan">skills</span>       - Print core technical skills breakdown
  <span class="t-cyan">projects</span>     - Display technical projects &amp; hardware builds
  <span class="t-cyan">publications</span> - List research publications
  <span class="t-cyan">contact</span>      - Show direct contact channels
  <span class="t-cyan">date</span>         - Print current system timestamp
  <span class="t-cyan">history</span>      - View command input history
  <span class="t-cyan">clear</span>        - Clear terminal history`, 't-log');
        break;

      case 'admin':
      case 'login':
        const isSub = window.location.pathname.includes('/pages/');
        const aUrl = isSub ? 'admin.html' : 'pages/admin.html';
        appendLine(`[+] Launching Security Authentication Portal...`, 't-cyan');
        setTimeout(() => window.location.href = aUrl, 500);
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
  [+] Opening Text Resume (No Photo) in new tab: <a href="${rUrl}" target="_blank" class="t-cyan" style="text-decoration: underline;">kabilanm_resume without photo.pdf</a>`, 't-green');
        window.open(rUrl, '_blank');
        break;

      case 'ls':
      case 'dir':
        appendLine(`drwxr-xr-x 4 kabilan kabilan 4096 Jul 26 15:10 .
drwxr-xr-x 8 kabilan kabilan 4096 Jul 26 15:10 ..
-rw-r--r-- 1 kabilan kabilan 106K Aug 11 12:25 <a href="${getResumeNoPhotoPath()}" target="_blank" class="t-green">resume.pdf</a> (No Photo version)
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
[+] Opened: <a href="${rPath}" target="_blank" class="t-cyan">kabilanm_resume without photo.pdf</a> (No Photo)`, 't-green');
          window.open(rPath, '_blank');
        } else if (arg === 'skills.txt' || arg === 'skills') {
          handleCommand('skills');
        } else if (arg === 'about.txt' || arg === 'about') {
          appendLine(`Kabilan M - B.Tech IT student at Kongunadu College of Engineering &amp; Technology. Passionate about cybersecurity, Java coding, networking, and software development.`, 't-cyan');
        } else if (arg === 'readme.md') {
          appendLine(`# Kabilan M Portfolio\nSecurity &amp; Networking Portfolio with Interactive Terminal Shell`, 't-log');
        } else {
          appendLine(`cat: ${arg}: No such file or directory`, 't-red');
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
            appendLine(`  ${idx + 1}  ${hCmd}`, 't-log');
          });
        }
        break;

      case 'echo':
        appendLine(arg || '', 't-log');
        break;

      case 'ping':
        const targetHost = arg || '8.8.8.8';
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
        appendLine(`bash: ${cleanCmd}: command not found. Type <span class="t-cyan">help</span> or <span class="t-cyan">resume</span> to list commands.`, 't-red');
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

// ── Screenshot Shield (Anti-Screen Capture) ───────────────────
function initScreenshotShield() {
  const shield = document.getElementById('screenshotShield');
  if (!shield) return;

  // Turn screen black when tab loses focus (e.g. Snipping tool or system screenshots capture)
  window.addEventListener('blur', () => {
    shield.classList.add('active');
  });

  // Restore screen visibility when tab regains focus
  window.addEventListener('focus', () => {
    shield.classList.remove('active');
  });

  // Handle standard PrintScreen (PrtScn) keyup events to clear clipboard
  window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      shield.classList.add('active');
      navigator.clipboard.writeText('').catch(() => {});
      setTimeout(() => {
        shield.classList.remove('active');
      }, 1200);
    }
  });

  // Block PrintScreen keydown triggers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      shield.classList.add('active');
      navigator.clipboard.writeText('').catch(() => {});
      setTimeout(() => {
        shield.classList.remove('active');
      }, 1200);
    }
  });
}

// ── Skill Tag Icon Resolver Helper ──────────────────────────
function getSkillIconHTML(skillName) {
  const nameLower = skillName.toLowerCase();
  if (nameLower.includes('java') && !nameLower.includes('script')) return '<i class="fa-brands fa-java" aria-hidden="true"></i> ';
  if (nameLower.includes('javascript') || nameLower.includes('js')) return '<i class="fa-brands fa-js" aria-hidden="true"></i> ';
  if (nameLower.includes('html')) return '<i class="fa-brands fa-html5" aria-hidden="true"></i> ';
  if (nameLower.includes('css')) return '<i class="fa-brands fa-css3-alt" aria-hidden="true"></i> ';
  if (nameLower.includes('bootstrap')) return '<i class="fa-brands fa-bootstrap" aria-hidden="true"></i> ';
  if (nameLower.includes('react')) return '<i class="fa-brands fa-react" aria-hidden="true"></i> ';
  if (nameLower.includes('node')) return '<i class="fa-brands fa-node-js" aria-hidden="true"></i> ';
  if (nameLower.includes('python')) return '<i class="fa-brands fa-python" aria-hidden="true"></i> ';
  if (nameLower.includes('sql') || nameLower.includes('db') || nameLower.includes('mongo')) return '<i class="fa-solid fa-database" aria-hidden="true"></i> ';
  if (nameLower.includes('linux') || nameLower.includes('ubuntu')) return '<i class="fa-brands fa-linux" aria-hidden="true"></i> ';
  if (nameLower.includes('windows')) return '<i class="fa-brands fa-windows" aria-hidden="true"></i> ';
  if (nameLower.includes('git') && !nameLower.includes('hub')) return '<i class="fa-brands fa-git-alt" aria-hidden="true"></i> ';
  if (nameLower.includes('github')) return '<i class="fa-brands fa-github" aria-hidden="true"></i> ';
  return '';
}

// ── Firebase Cloud Database Integration ─────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCmsDlTsJdsNKa-MWbLsdFkkBYj6_ax1uE",
  authDomain: "portfolio-9a1a1.firebaseapp.com",
  projectId: "portfolio-9a1a1",
  storageBucket: "portfolio-9a1a1.firebasestorage.app",
  messagingSenderId: "912255292092",
  appId: "1:912255292092:web:ccb74ab6510cef068af6b9",
  measurementId: "G-TZSEQWJKND"
};

let db = null;
let currentFirebasePortfolioData = null;

function initFirebaseApp() {
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
    } catch (e) {
      console.warn("Firebase Init Notice:", e);
    }
  }
}

function syncPortfolioDataToFirebase(data) {
  if (!db) initFirebaseApp();
  currentFirebasePortfolioData = { ...data };
  if (!db) {
    applyDynamicPortfolioData();
    return Promise.resolve(false);
  }
  return db.collection("portfolio").doc("liveData").set(data, { merge: true })
    .then(() => {
      console.log("Synced portfolio data to Firebase Cloud Database!");
      applyDynamicPortfolioData();
      return true;
    })
    .catch((err) => {
      console.error("Firebase Sync Error:", err);
      applyDynamicPortfolioData();
      return false;
    });
}

function initFirebaseLiveSync() {
  if (!db) initFirebaseApp();
  if (!db) return;
  db.collection("portfolio").doc("liveData").onSnapshot((doc) => {
    if (doc.exists) {
      const remoteData = doc.data();
      if (remoteData && Object.keys(remoteData).length > 0) {
        currentFirebasePortfolioData = remoteData;
        applyDynamicPortfolioData();
        if (typeof loadFormData === 'function' && document.getElementById('adminLoginForm')) {
          loadFormData();
        }
      }
    }
  }, (err) => {
    console.warn("Firebase live sync notice:", err);
  });
}

// ── Shared Default Portfolio Configuration Data ────────────────
function getPortfolioDefaultData() {
  return {
    profile: {
      name: 'Kabilan M',
      role: 'Cybersecurity Enthusiast | Java Developer | Full Stack Developer',
      objective: 'Transitioned from Mechanical Engineering to IT with a passion for software development, networking, and security, aiming to build innovative solutions.',
      footerRights: '© 2026 Kabilan M. Security and Networking Engineer. All rights reserved.',
      email: 'mkabilan1409@gmail.com',
      phone: '+91 76049 59955',
      linkedin: 'https://www.linkedin.com/in/kabilan-m-790801330/',
      github: 'https://github.com/kabilanm1409/'
    },
    resumes: {
      c2c: 'assets/resume/kabilanm_resume_c2c.pdf?v=4.0',
      terminal: 'assets/resume/kabilanm_resume without photo.pdf?v=4.0'
    },
    education: {
      cgpa: '7.08',
      sem: 'up to 6th sem',
      college: 'Kongunadu College of Engineering and Technology, Thottiyam, Trichy',
      degree: 'B.Tech Information Technology',
      timeline: [
        {
          year: '2024 - 2027',
          title: 'B.Tech Information Technology',
          institution: 'Kongunadu College of Engineering and Technology, Thottiyam, Trichy',
          details: 'CGPA: 7.08 up to 6th sem. Passionate about software development, emerging web technologies, network security, and AI-based applications.'
        },
        {
          year: '2022 - 2024',
          title: 'Diploma in Mechanical Engineering',
          institution: 'Kongunadu Polytechnic College, Thottiyam, Trichy',
          details: 'Graduated with 92% aggregate. Developed solid analytical reasoning and problem-solving skills before transitioning to IT.'
        },
        {
          year: '2021 - 2022',
          title: 'Higher Secondary Certificate (HSC)',
          institution: 'Government Higher Secondary School, Pappapatti, Trichy',
          details: 'Completed higher secondary education with a 50% aggregate score.'
        }
      ]
    },
    achievements: [
      {
        icon: 'fa-trophy',
        title: 'Artivers 3.0 Hackathon',
        subtitle: '1st Place (College Level)',
        certUrl: 'assets/cerificates/IMG_20260701_185332433.jpg',
        certText: 'View Certificate'
      },
      {
        icon: 'fa-medal',
        title: 'Tezario 3.0 Project Expo',
        subtitle: '2nd Place (College Level)',
        certUrl: '',
        certText: ''
      },
      {
        icon: 'fa-certificate',
        title: 'Infosys Springboard',
        subtitle: 'Technical Certifications: HTML5, CSS3, JavaScript',
        certUrl: 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf',
        certText: 'View PDF Certificate'
      },
      {
        icon: 'fa-shield-halved',
        title: 'Advanced Cyber Security',
        subtitle: 'Penetration Testing Course (6 Days)',
        certUrl: 'assets/cerificates/IMG_20260701_185137413.jpg',
        certText: 'View Certificate'
      }
    ],
    skills: {
      languages: 'Java, HTML5, CSS3, JavaScript, Bootstrap',
      databases: 'MySQL, MongoDB, Apache HDFS, Apache Pig',
      tools: 'Wireshark, Burp Suite, VS Code, Git/GitHub, Arduino IDE, ESP32, ESP8266',
      core: 'Computer Networks, DBMS, Packet Sniffing, Adaptability, Time Management'
    },
    projects: [
      {
        title: 'Wi-Fi De-authentication Device',
        category: 'security',
        description: 'An ESP8266-based wireless network monitoring device capable of analyzing Beacon, Deauthentication, and Probe frames in real time.',
        tags: 'ESP8266, Arduino IDE, C++, Packet Sniffing, OLED Display',
        features: 'Developed wireless frame sniffer targeting Wi-Fi vulnerabilities.\\nSupports detection of deauthentication and probe frames.\\nOLED notifications for real-time traffic updates.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      },
      {
        title: 'De-authentication Detection System',
        category: 'security,software',
        description: 'An embedded wireless security monitoring system built using ESP32 to detect deauthentication attacks and alert users.',
        tags: 'ESP32, Arduino IDE, C++, Wi-Fi Packet Sniffing, OLED Display',
        features: 'Implements real-time packet capture for IEEE 802.11 frames.\\nGenerates live alerts for fast security response.\\nIncreases defense posture awareness in open networks.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      },
      {
        title: 'Forest Fire Prediction System',
        category: 'software',
        description: 'An AI-based forest fire prediction system using environmental and historical data for risk monitoring and response.',
        tags: 'React, Node.js, Python, REST APIs, Google Maps',
        features: 'Visualizes environmental risk dynamically via Heatmaps.\\nSends alerts directly using WhatsApp and Email integrations.\\nUtilizes location services on Google Maps for fast responses.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      }
    ]
  };
}

function getPortfolioData() {
  return currentFirebasePortfolioData || getPortfolioDefaultData();
}

// ── Admin Panel & Dynamic Portfolio Data Synchronization ────────
function applyDynamicPortfolioData() {
  try {
    const data = getPortfolioData();

    // Profile & Bio Overrides
    if (data.profile) {
      if (data.profile.role) {
        document.querySelectorAll('.hero-subtitle').forEach(el => el.textContent = data.profile.role);
      }
      if (data.profile.objective) {
        const objEl = document.getElementById('careerObjectiveText');
        if (objEl) objEl.textContent = data.profile.objective;
      }
      if (data.profile.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
          el.href = `mailto:${data.profile.email}`;
          if (el.textContent.includes('@')) {
            const nodes = Array.from(el.childNodes);
            const textNode = nodes.find(n => n.nodeType === Node.TEXT_NODE);
            if (textNode) textNode.nodeValue = ` ${data.profile.email}`;
          }
        });
      }
      if (data.profile.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(el => {
          const rawPhone = data.profile.phone.replace(/\s+/g, '');
          el.href = `tel:${rawPhone}`;
          const nodes = Array.from(el.childNodes);
          const textNode = nodes.find(n => n.nodeType === Node.TEXT_NODE);
          if (textNode) textNode.nodeValue = ` ${data.profile.phone}`;
        });
      }
    }

    // Resume PDF Overrides
    if (data.resumes) {
      const isSubpage = window.location.pathname.includes('/pages/');
      const prefix = isSubpage ? '../' : '';

      if (data.resumes.c2c) {
        const c2cUrl = prefix + data.resumes.c2c;
        document.querySelectorAll('a[href*="resume_c2c.pdf"], a[href*="resume photo.pdf"], a#downloadResumeBtn, a#viewResumeBtn').forEach(el => {
          if (!el.closest('#terminalBody')) {
            el.href = c2cUrl;
          }
        });
      }
    }

    // Footer Rights / Copyright Overrides
    if (data.profile && data.profile.footerRights) {
      document.querySelectorAll('.site-footer p:first-child, .footer-content p, #adminFooterRightsP').forEach(el => {
        if (!el.querySelector('a')) {
          el.textContent = data.profile.footerRights;
        } else {
          const links = Array.from(el.querySelectorAll('a'));
          el.innerHTML = `${escapeHTML(data.profile.footerRights)} `;
          links.forEach(link => el.appendChild(link));
        }
      });
    }

    // Education & CGPA & Timeline Overrides
    if (data.education) {
      if (data.education.cgpa) {
        const cgpaEl = document.getElementById('stat-cgpa');
        if (cgpaEl) {
          cgpaEl.textContent = data.education.cgpa;
          const parent = cgpaEl.closest('.stat-pill');
          if (parent) parent.setAttribute('data-counter', data.education.cgpa);
        }
      }

      // Dynamic Academic Timeline Cards Rebuild
      if (data.education.timeline && data.education.timeline.length > 0) {
        const timelineContainer = document.querySelector('.timeline');
        if (timelineContainer) {
          timelineContainer.innerHTML = data.education.timeline.map(item => `
            <article class="timeline-item card" data-aos="fade-up">
              <span class="timeline-dot" aria-hidden="true"></span>
              <div>
                <p class="timeline-year">${escapeHTML(item.year || '')}</p>
                <h3>${escapeHTML(item.title || '')}</h3>
                <p class="timeline-institution">${escapeHTML(item.institution || '')}</p>
                <p>${escapeHTML(item.details || '')}</p>
              </div>
            </article>
          `).join('');
        }
      }
    }

    // Achievements & Certifications Overrides
    if (data.achievements && data.achievements.length > 0) {
      const grid = document.querySelector('.achievement-grid');
      if (grid) {
        grid.innerHTML = data.achievements.map(a => {
          const certLink = a.certUrl ? `
            <a class="cert-link" href="${escapeAttr(a.certUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top: 8px; font-size: 0.85rem; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
              <i class="fa-solid ${a.certUrl.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-image'}"></i> ${escapeHTML(a.certText || 'View Certificate')}
            </a>
          ` : '';
          return `
            <article class="achievement-card card" role="listitem" data-aos="fade-up">
              <i class="fa-solid ${escapeAttr(a.icon || 'fa-trophy')}" aria-hidden="true"></i>
              <h3>${escapeHTML(a.title || '')}</h3>
              <p>${escapeHTML(a.subtitle || '')}</p>
              ${certLink}
            </article>
          `;
        }).join('');
      }
    }

    // Skills Overrides
    if (data.skills) {
      const skillSections = {
        languages: data.skills.languages,
        databases: data.skills.databases,
        tools: data.skills.tools,
        core: data.skills.core
      };
      document.querySelectorAll('.skill-list, .skill-category, .skills-grid article').forEach(cat => {
        const heading = cat.querySelector('h3, h4, .skill-heading');
        if (!heading) return;
        const title = heading.textContent.toLowerCase();
        let items = null;
        if (title.includes('language') || title.includes('programming') || title.includes('web')) items = skillSections.languages;
        else if (title.includes('database') || title.includes('big data')) items = skillSections.databases;
        else if (title.includes('tool') || title.includes('hardware') || title.includes('operating') || title.includes('system')) items = skillSections.tools;
        else if (title.includes('core') || title.includes('competenc') || title.includes('soft') || title.includes('concept')) items = skillSections.core;
        
        if (items) {
          const tagContainer = cat.querySelector('.tag-row, .skill-tags');
          if (tagContainer) {
            tagContainer.innerHTML = items.split(',').map(s => s.trim()).filter(s => s).map(s => {
              const icon = getSkillIconHTML(s);
              return `<span>${icon}${escapeHTML(s)}</span>`;
            }).join('');
          }
        }
      });
    }

    // Projects Overrides — dynamically rebuild project grid if admin data exists
    if (data.projects && data.projects.length > 0) {
      const grid = document.querySelector('.project-grid');
      if (grid) {
        grid.innerHTML = data.projects.map((p, i) => {
          const tags = (p.tags || '').split(',').map(t => t.trim()).filter(t => t).map(t => `<span>${t}</span>`).join('');
          const features = (p.features || '').split('\\n').filter(f => f.trim()).map(f => `<li>${f.trim()}</li>`).join('');
          return `
            <article class="project-card card" data-category="${p.category || 'software'}" data-aos="fade-up">
              <div class="project-image-wrap">
                <img alt="${p.title || 'Project'} preview" src="data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 900 600%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22><stop stop-color=%22%23dbeafe%22/><stop offset=%221%22 stop-color=%22%232563eb%22/></linearGradient></defs><rect width=%22900%22 height=%22600%22 rx=%2240%22 fill=%22%23eef2ff%22/><rect x=%2252%22 y=%2252%22 width=%22796%22 height=%22496%22 rx=%2230%22 fill=%22white%22 stroke=%22url(%23g)%22 stroke-width=%225%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%232563eb%22 font-size=%2236%22 font-family=%22Arial%22 font-weight=%22700%22>${p.title || 'Project'}</text></svg>" />
              </div>
              <div class="project-content">
                <p class="card-label">Project ${i + 1}</p>
                <h3>${p.title || 'Untitled Project'}</h3>
                <p>${p.description || ''}</p>
                <div class="tag-row">${tags}</div>
                <ul>${features}</ul>
                <div class="project-actions">
                  <a class="btn btn-secondary" href="${p.github || '#'}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i> GitHub</a>
                  <a class="btn btn-primary" href="${p.demo || '#'}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error rendering dynamic portfolio data:', err);
  }
}

// ── Projects CMS Helper ─────────────────────────────────────
let adminProjectsList = [];

function renderAdminProjects(projects) {
  const defaultProjects = [
    {
      title: 'Wi-Fi De-authentication Device',
      category: 'security',
      description: 'An ESP8266-based wireless network monitoring device capable of analyzing Beacon, Deauthentication, and Probe frames in real time.',
      tags: 'ESP8266, Arduino IDE, C++, Packet Sniffing, OLED Display',
      features: 'Developed wireless frame sniffer targeting Wi-Fi vulnerabilities.\\nSupports detection of deauthentication and probe frames.\\nOLED notifications for real-time traffic updates.',
      github: 'https://github.com/kabilanm1409/',
      demo: '../index.html#contact'
    },
    {
      title: 'De-authentication Detection System',
      category: 'security,software',
      description: 'An embedded wireless security monitoring system built using ESP32 to detect deauthentication attacks and alert users.',
      tags: 'ESP32, Arduino IDE, C++, Wi-Fi Packet Sniffing, OLED Display',
      features: 'Implements real-time packet capture for IEEE 802.11 frames.\\nGenerates live alerts for fast security response.\\nIncreases defense posture awareness in open networks.',
      github: 'https://github.com/kabilanm1409/',
      demo: '../index.html#contact'
    },
    {
      title: 'Forest Fire Prediction System',
      category: 'software',
      description: 'An AI-based forest fire prediction system using environmental and historical data for risk monitoring and response.',
      tags: 'React, Node.js, Python, REST APIs, Google Maps',
      features: 'Visualizes environmental risk dynamically via Heatmaps.\\nSends alerts directly using WhatsApp and Email integrations.\\nUtilizes location services on Google Maps for fast responses.',
      github: 'https://github.com/kabilanm1409/',
      demo: '../index.html#contact'
    }
  ];

  adminProjectsList = projects && projects.length > 0 ? [...projects] : [...defaultProjects];

  const container = document.getElementById('projectsListContainer');
  if (!container) return;

  container.innerHTML = adminProjectsList.map((p, i) => `
    <div class="project-item-card" data-index="${i}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="color: #38bdf8; margin: 0; font-size: 1rem;"><i class="fa-solid fa-diagram-project"></i> Project ${i + 1}</h4>
        <button type="button" class="admin-btn admin-btn-danger admDeleteProjectBtn" data-index="${i}" style="padding: 4px 10px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="form-control admProjTitle" value="${escapeAttr(p.title || '')}" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>Category (comma separated: security, software)</label>
          <input type="text" class="form-control admProjCategory" value="${escapeAttr(p.category || '')}" />
        </div>
        <div class="form-group">
          <label>Tags (comma separated)</label>
          <input type="text" class="form-control admProjTags" value="${escapeAttr(p.tags || '')}" />
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="form-control admProjDesc" rows="2">${escapeHTML(p.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Key Features (one per line)</label>
        <textarea class="form-control admProjFeatures" rows="3">${escapeHTML((p.features || '').replace(/\\\\n/g, '\\n'))}</textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>GitHub URL</label>
          <input type="text" class="form-control admProjGithub" value="${escapeAttr(p.github || '')}" />
        </div>
        <div class="form-group">
          <label>Live Demo URL</label>
          <input type="text" class="form-control admProjDemo" value="${escapeAttr(p.demo || '')}" />
        </div>
      </div>
    </div>
  `).join('');

  // Bind delete buttons
  container.querySelectorAll('.admDeleteProjectBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'));
      if (confirm('Remove this project?')) {
        adminProjectsList.splice(idx, 1);
        renderAdminProjects(adminProjectsList);
      }
    });
  });
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function collectProjectsFromDOM() {
  const cards = document.querySelectorAll('.project-item-card');
  const projects = [];
  cards.forEach(card => {
    projects.push({
      title: card.querySelector('.admProjTitle').value.trim(),
      category: card.querySelector('.admProjCategory').value.trim(),
      description: card.querySelector('.admProjDesc').value.trim(),
      tags: card.querySelector('.admProjTags').value.trim(),
      features: card.querySelector('.admProjFeatures').value.trim().replace(/\\n/g, '\\\\n'),
      github: card.querySelector('.admProjGithub').value.trim(),
      demo: card.querySelector('.admProjDemo').value.trim()
    });
  });
  return projects;
}

// ── Education Timeline CMS Helper ────────────────────────────
let adminTimelineList = [];

function renderAdminEducationTimeline(timeline) {
  const defaultTimeline = [
    {
      year: '2024 - 2027',
      title: 'B.Tech Information Technology',
      institution: 'Kongunadu College of Engineering and Technology, Thottiyam, Trichy',
      details: 'CGPA: 7.08 up to 6th sem. Passionate about software development, emerging web technologies, network security, and AI-based applications.'
    },
    {
      year: '2022 - 2024',
      title: 'Diploma in Mechanical Engineering',
      institution: 'Kongunadu Polytechnic College, Thottiyam, Trichy',
      details: 'Graduated with 92% aggregate. Developed solid analytical reasoning and problem-solving skills before transitioning to IT.'
    },
    {
      year: '2021 - 2022',
      title: 'Higher Secondary Certificate (HSC)',
      institution: 'Government Higher Secondary School, Pappapatti, Trichy',
      details: 'Completed higher secondary education with a 50% aggregate score.'
    }
  ];

  adminTimelineList = timeline && timeline.length > 0 ? [...timeline] : [...defaultTimeline];
  const container = document.getElementById('educationTimelineContainer');
  if (!container) return;

  container.innerHTML = adminTimelineList.map((item, i) => `
    <div class="project-item-card" data-index="${i}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="color: #38bdf8; margin: 0; font-size: 0.95rem;"><i class="fa-solid fa-graduation-cap"></i> Timeline Entry ${i + 1}</h4>
        <button type="button" class="admin-btn admin-btn-danger admDeleteTimelineBtn" data-index="${i}" style="padding: 3px 8px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
        <div class="form-group">
          <label>Years / Period</label>
          <input type="text" class="form-control admTimeYear" value="${escapeAttr(item.year || '')}" placeholder="e.g. 2024 - 2027" />
        </div>
        <div class="form-group">
          <label>Degree / Certificate Title</label>
          <input type="text" class="form-control admTimeTitle" value="${escapeAttr(item.title || '')}" placeholder="e.g. B.Tech Information Technology" />
        </div>
      </div>
      <div class="form-group">
        <label>Institution / College Name</label>
        <input type="text" class="form-control admTimeInstitution" value="${escapeAttr(item.institution || '')}" placeholder="e.g. Kongunadu College..." />
      </div>
      <div class="form-group">
        <label>Details &amp; Achievements (CGPA, Highlights)</label>
        <textarea class="form-control admTimeDetails" rows="2">${escapeHTML(item.details || '')}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.admDeleteTimelineBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'));
      if (confirm('Remove this education timeline entry?')) {
        adminTimelineList.splice(idx, 1);
        renderAdminEducationTimeline(adminTimelineList);
      }
    });
  });
}

function collectEducationTimelineFromDOM() {
  const cards = document.querySelectorAll('#educationTimelineContainer .project-item-card');
  const list = [];
  cards.forEach(card => {
    list.push({
      year: card.querySelector('.admTimeYear').value.trim(),
      title: card.querySelector('.admTimeTitle').value.trim(),
      institution: card.querySelector('.admTimeInstitution').value.trim(),
      details: card.querySelector('.admTimeDetails').value.trim()
    });
  });
  return list;
}

// ── Achievements & Certifications CMS Helper ────────────────
let adminAchievementsList = [];

function renderAdminAchievements(achievements) {
  const defaultAchievements = [
    {
      icon: 'fa-trophy',
      title: 'Artivers 3.0 Hackathon',
      subtitle: '1st Place (College Level)',
      certUrl: 'assets/cerificates/IMG_20260701_185332433.jpg',
      certText: 'View Certificate'
    },
    {
      icon: 'fa-medal',
      title: 'Tezario 3.0 Project Expo',
      subtitle: '2nd Place (College Level)',
      certUrl: '',
      certText: ''
    },
    {
      icon: 'fa-certificate',
      title: 'Infosys Springboard',
      subtitle: 'Technical Certifications: HTML5, CSS3, JavaScript',
      certUrl: 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf',
      certText: 'View PDF Certificate'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Advanced Cyber Security',
      subtitle: 'Penetration Testing Course (6 Days)',
      certUrl: 'assets/cerificates/IMG_20260701_185137413.jpg',
      certText: 'View Certificate'
    }
  ];

  adminAchievementsList = achievements && achievements.length > 0 ? [...achievements] : [...defaultAchievements];
  const container = document.getElementById('achievementsListContainer');
  if (!container) return;

  container.innerHTML = adminAchievementsList.map((item, i) => `
    <div class="project-item-card" data-index="${i}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="color: #38bdf8; margin: 0; font-size: 0.95rem;"><i class="fa-solid fa-trophy"></i> Achievement ${i + 1}</h4>
        <button type="button" class="admin-btn admin-btn-danger admDeleteAchievementBtn" data-index="${i}" style="padding: 3px 8px; font-size: 0.8rem;"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
        <div class="form-group">
          <label>FontAwesome Icon Class</label>
          <input type="text" class="form-control admAchieveIcon" value="${escapeAttr(item.icon || 'fa-trophy')}" placeholder="e.g. fa-trophy, fa-medal" />
        </div>
        <div class="form-group">
          <label>Achievement Title</label>
          <input type="text" class="form-control admAchieveTitle" value="${escapeAttr(item.title || '')}" placeholder="e.g. Artivers 3.0 Hackathon" />
        </div>
      </div>
      <div class="form-group">
        <label>Subtitle / Award / Description</label>
        <input type="text" class="form-control admAchieveSubtitle" value="${escapeAttr(item.subtitle || '')}" placeholder="e.g. 1st Place (College Level)" />
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>Certificate Image / PDF Path</label>
          <input type="text" class="form-control admAchieveCertUrl" value="${escapeAttr(item.certUrl || '')}" placeholder="e.g. assets/cerificates/..." />
        </div>
        <div class="form-group">
          <label>Link Label Text</label>
          <input type="text" class="form-control admAchieveCertText" value="${escapeAttr(item.certText || 'View Certificate')}" />
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.admDeleteAchievementBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'));
      if (confirm('Remove this achievement?')) {
        adminAchievementsList.splice(idx, 1);
        renderAdminAchievements(adminAchievementsList);
      }
    });
  });
}

function collectAchievementsFromDOM() {
  const cards = document.querySelectorAll('#achievementsListContainer .project-item-card');
  const list = [];
  cards.forEach(card => {
    list.push({
      icon: card.querySelector('.admAchieveIcon').value.trim(),
      title: card.querySelector('.admAchieveTitle').value.trim(),
      subtitle: card.querySelector('.admAchieveSubtitle').value.trim(),
      certUrl: card.querySelector('.admAchieveCertUrl').value.trim(),
      certText: card.querySelector('.admAchieveCertText').value.trim()
    });
  });
  return list;
}

function initAdminPanel() {
  const loginForm = document.getElementById('adminLoginForm');
  if (!loginForm) return; // Not on admin.html page

  const loginSection = document.getElementById('adminLoginSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const loginAlert = document.getElementById('loginAlert');
  const dashAlert = document.getElementById('dashboardAlert');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Password & Auth Helper
  const getStoredPassword = () => localStorage.getItem('kabilan_admin_pass') || 'kabilan1409';
  const getStoredUsername = () => localStorage.getItem('kabilan_admin_user') || 'kabilan';
  const checkAuth = () => sessionStorage.getItem('kabilan_admin_authenticated') === 'true';

  const showAlert = (el, text, isSuccess = false) => {
    el.textContent = text;
    el.className = 'alert-box ' + (isSuccess ? 'alert-success' : 'alert-error');
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  };

  const renderDashboard = () => {
    if (checkAuth()) {
      loginSection.style.display = 'none';
      dashSection.style.display = 'block';
      loadFormData();
    } else {
      loginSection.style.display = 'block';
      dashSection.style.display = 'none';
    }
  };

  // Load Saved Admin Data into Form Inputs
  const loadFormData = () => {
    const data = getPortfolioData();

    // Set Profile fields
    if (data.profile) {
      document.getElementById('admName').value = data.profile.name || '';
      document.getElementById('admRole').value = data.profile.role || '';
      document.getElementById('admObjective').value = data.profile.objective || '';
      if (document.getElementById('admFooterRights')) {
        document.getElementById('admFooterRights').value = data.profile.footerRights || '© 2026 Kabilan M. Security and Networking Engineer. All rights reserved.';
      }
      document.getElementById('admEmail').value = data.profile.email || '';
      document.getElementById('admPhone').value = data.profile.phone || '';
      document.getElementById('admLinkedin').value = data.profile.linkedin || '';
      document.getElementById('admGithub').value = data.profile.github || '';
    }

    // Set Resume fields
    if (data.resumes) {
      document.getElementById('admC2cResume').value = data.resumes.c2c || '';
      document.getElementById('admTerminalResume').value = data.resumes.terminal || '';
    }

    // Set Education fields
    if (data.education) {
      document.getElementById('admCgpa').value = data.education.cgpa || '';
      document.getElementById('admSem').value = data.education.sem || '';
      document.getElementById('admCollege').value = data.education.college || '';
      document.getElementById('admDegree').value = data.education.degree || '';
    }

    // Load Education Timeline into CMS
    if (typeof renderAdminEducationTimeline === 'function') {
      renderAdminEducationTimeline(data.education?.timeline || null);
    }

    // Load Achievements into CMS
    if (typeof renderAdminAchievements === 'function') {
      renderAdminAchievements(data.achievements || null);
    }

    // Set Skills fields
    if (data.skills) {
      document.getElementById('admSkillsLanguages').value = data.skills.languages || '';
      document.getElementById('admSkillsDatabases').value = data.skills.databases || '';
      document.getElementById('admSkillsTools').value = data.skills.tools || '';
      document.getElementById('admSkillsCore').value = data.skills.core || '';
    }

    // Set Notification Email
    if (data.notificationEmail) {
      document.getElementById('admNotificationEmail').value = data.notificationEmail;
    }

    // Set Webhook URL
    if (data.webhookUrl) {
      document.getElementById('admWebhookUrl').value = data.webhookUrl;
    }

    // Load projects into CMS
    if (typeof renderAdminProjects === 'function') {
      renderAdminProjects(data.projects || null);
    }
  };

  // Login Form Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userIn = document.getElementById('adminUsername').value.trim();
    const passIn = document.getElementById('adminPassword').value.trim();

    if (userIn === getStoredUsername() && passIn === getStoredPassword()) {
      sessionStorage.setItem('kabilan_admin_authenticated', 'true');
      renderDashboard();
    } else {
      showAlert(loginAlert, 'Invalid administrative credentials! Please try again.');
    }
  });

  // Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('kabilan_admin_authenticated');
      renderDashboard();
    });
  }

  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });

  // Save Profile Form
  const formProfile = document.getElementById('formProfile');
  if (formProfile) {
    formProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      currentData.profile = {
        name: document.getElementById('admName').value.trim(),
        role: document.getElementById('admRole').value.trim(),
        objective: document.getElementById('admObjective').value.trim(),
        footerRights: document.getElementById('admFooterRights') ? document.getElementById('admFooterRights').value.trim() : '© 2026 Kabilan M. Security and Networking Engineer. All rights reserved.',
        email: document.getElementById('admEmail').value.trim(),
        phone: document.getElementById('admPhone').value.trim(),
        linkedin: document.getElementById('admLinkedin').value.trim(),
        github: document.getElementById('admGithub').value.trim()
      };
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Profile details saved and synced to Firebase Cloud!', true);
    });
  }

  // Save Resumes Form
  const formResumes = document.getElementById('formResumes');
  if (formResumes) {
    formResumes.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      currentData.resumes = {
        c2c: document.getElementById('admC2cResume').value.trim(),
        terminal: document.getElementById('admTerminalResume').value.trim()
      };
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Resume URLs updated and synced to Firebase Cloud!', true);
    });
  }

  // Save Core Education Form
  const formEducation = document.getElementById('formEducation');
  if (formEducation) {
    formEducation.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      const existingTimeline = currentData.education?.timeline || null;
      currentData.education = {
        cgpa: document.getElementById('admCgpa').value.trim(),
        sem: document.getElementById('admSem').value.trim(),
        college: document.getElementById('admCollege').value.trim(),
        degree: document.getElementById('admDegree').value.trim(),
        timeline: existingTimeline
      };
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Core education info updated and synced to Firebase Cloud!', true);
    });
  }

  // Add New Education Timeline Entry Button
  const addTimelineBtn = document.getElementById('admAddTimelineBtn');
  if (addTimelineBtn) {
    addTimelineBtn.addEventListener('click', () => {
      adminTimelineList.push({
        year: '',
        title: '',
        institution: '',
        details: ''
      });
      renderAdminEducationTimeline(adminTimelineList);
    });
  }

  // Save Academic Timeline Button
  const saveTimelineBtn = document.getElementById('saveTimelineBtn');
  if (saveTimelineBtn) {
    saveTimelineBtn.addEventListener('click', () => {
      const currentData = getPortfolioData();
      if (!currentData.education) currentData.education = {};
      currentData.education.timeline = collectEducationTimelineFromDOM();
      adminTimelineList = [...currentData.education.timeline];
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Academic Timeline saved and synced to Firebase Cloud!', true);
    });
  }

  // Add New Achievement Button
  const addAchievementBtn = document.getElementById('admAddAchievementBtn');
  if (addAchievementBtn) {
    addAchievementBtn.addEventListener('click', () => {
      adminAchievementsList.push({
        icon: 'fa-trophy',
        title: '',
        subtitle: '',
        certUrl: '',
        certText: 'View Certificate'
      });
      renderAdminAchievements(adminAchievementsList);
    });
  }

  // Save All Achievements Button
  const saveAchievementsBtn = document.getElementById('saveAchievementsBtn');
  if (saveAchievementsBtn) {
    saveAchievementsBtn.addEventListener('click', () => {
      const currentData = getPortfolioData();
      currentData.achievements = collectAchievementsFromDOM();
      adminAchievementsList = [...currentData.achievements];
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Achievements saved and synced to Firebase Cloud!', true);
    });
  }

  // Change Password Form
  const formPass = document.getElementById('formChangePassword');
  if (formPass) {
    formPass.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('admNewPassword').value.trim();
      if (newPass) {
        localStorage.setItem('kabilan_admin_pass', newPass);
        document.getElementById('admNewPassword').value = '';
        showAlert(dashAlert, 'Admin password changed successfully!', true);
      }
    });
  }

  // Export JSON
  const exportBtn = document.getElementById('exportJsonBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataRaw = JSON.stringify(getPortfolioData(), null, 2);
      const blob = new Blob([dataRaw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_data.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Save Skills Form
  const formSkills = document.getElementById('formSkills');
  if (formSkills) {
    formSkills.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      currentData.skills = {
        languages: document.getElementById('admSkillsLanguages').value.trim(),
        databases: document.getElementById('admSkillsDatabases').value.trim(),
        tools: document.getElementById('admSkillsTools').value.trim(),
        core: document.getElementById('admSkillsCore').value.trim()
      };
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Skills & Competencies saved and synced to Firebase Cloud!', true);
    });
  }

  // Save Direct Email Notification Settings Form
  const formEmailAlert = document.getElementById('formEmailAlert');
  if (formEmailAlert) {
    formEmailAlert.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      currentData.notificationEmail = document.getElementById('admNotificationEmail').value.trim();
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Direct Email Alert destination saved: ' + currentData.notificationEmail, true);
    });
  }

  // Save Webhook URL Form
  const formWebhook = document.getElementById('formWebhookAlert');
  if (formWebhook) {
    formWebhook.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentData = getPortfolioData();
      currentData.webhookUrl = document.getElementById('admWebhookUrl').value.trim();
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'Notification Webhook URL saved!', true);
    });
  }

  // Clear Visitor Logs
  const clearLogsBtn = document.getElementById('clearVisitorLogsBtn');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      if (confirm('Clear all visitor location logs?')) {
        localStorage.removeItem('kabilan_visitor_logs');
        renderVisitorLogs();
        showAlert(dashAlert, 'Visitor logs cleared.', true);
      }
    });
  }

  // Render Visitor Table
  const renderVisitorLogs = () => {
    const tableBody = document.getElementById('visitorLogTableBody');
    if (!tableBody) return;

    const currentData = getPortfolioData();
    const webhookInput = document.getElementById('admWebhookUrl');
    if (webhookInput) {
      webhookInput.value = currentData.webhookUrl || '';
    }

    const emailNotifInput = document.getElementById('admNotificationEmail');
    if (emailNotifInput) {
      emailNotifInput.value = currentData.notificationEmail || 'mkabilan1409@gmail.com';
    }

    const logsRaw = localStorage.getItem('kabilan_visitor_logs');
    const logs = logsRaw ? JSON.parse(logsRaw) : [];

    if (logs.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="padding: 15px; text-align: center; color: #94a3b8;">No visitor logs recorded yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = logs.map(l => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 10px; color: #38bdf8;">${l.time || 'N/A'}</td>
        <td style="padding: 10px; font-family: monospace; color: #4ade80;">${l.ip || 'N/A'}</td>
        <td style="padding: 10px;"><strong>${l.city || ''}</strong> ${l.region || ''} (${l.country || 'N/A'})</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #94a3b8;">${l.org || 'N/A'}</td>
        <td style="padding: 10px; color: #e2e8f0;">${l.device || 'N/A'}</td>
        <td style="padding: 10px; color: #06b6d4;">${l.page || 'index.html'}</td>
      </tr>
    `).join('');
  };

  // Reset Defaults
  const resetBtn = document.getElementById('resetDefaultsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all admin edits back to default site configuration?')) {
        syncPortfolioDataToFirebase(getPortfolioDefaultData());
        showAlert(dashAlert, 'Reset back to default settings on Firebase Cloud.', true);
      }
    });
  }

  // Add New Project Button
  const addProjectBtn = document.getElementById('admAddProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      adminProjectsList.push({
        title: '',
        category: '',
        description: '',
        tags: '',
        features: '',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      });
      renderAdminProjects(adminProjectsList);
    });
  }

  // Save All Projects Button
  const saveProjectsBtn = document.getElementById('saveProjectsBtn');
  if (saveProjectsBtn) {
    saveProjectsBtn.addEventListener('click', () => {
      const currentData = getPortfolioData();
      currentData.projects = collectProjectsFromDOM();
      adminProjectsList = [...currentData.projects];
      syncPortfolioDataToFirebase(currentData);
      showAlert(dashAlert, 'All projects saved and synced to Firebase Cloud!', true);
    });
  }

  // Load CMS items on dashboard init
  const currentDataForCMS = getPortfolioData();
  renderAdminProjects(currentDataForCMS.projects || null);
  renderAdminEducationTimeline(currentDataForCMS.education?.timeline || null);
  renderAdminAchievements(currentDataForCMS.achievements || null);

  renderVisitorLogs();
  renderDashboard();
}

// ── Visitor Telemetry & Real-Time Alert System ─────────────────
function initVisitorNotification() {
  if (sessionStorage.getItem('kabilan_visited_session')) {
    return; // Record once per browser session
  }
  sessionStorage.setItem('kabilan_visited_session', 'true');

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'Mobile Phone';
    return 'Desktop PC';
  };

  const pagePath = window.location.pathname.split('/').pop() || 'index.html';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(geo => {
      const visitorLog = {
        ip: geo.ip || 'Unknown IP',
        city: geo.city || 'Unknown City',
        region: geo.region || '',
        country: geo.country_name || 'Unknown Country',
        org: geo.org || geo.asn || 'Network Provider',
        device: getDeviceType() + ' (' + navigator.platform + ')',
        page: pagePath,
        time: timestamp
      };

      // 1. Save to LocalStorage visitor log history
      const logsRaw = localStorage.getItem('kabilan_visitor_logs');
      let logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift(visitorLog);
      if (logs.length > 50) logs = logs.slice(0, 50);
      localStorage.setItem('kabilan_visitor_logs', JSON.stringify(logs));

      // 2. Fire direct email notification to mkabilan1409@gmail.com
      const d = getPortfolioData();
      let targetEmail = d.notificationEmail || 'mkabilan1409@gmail.com';
      let webhookUrl = d.webhookUrl || '';
      if (dataRaw) {
        try {
          const d = JSON.parse(dataRaw);
          if (d.notificationEmail) targetEmail = d.notificationEmail;
          if (d.webhookUrl) webhookUrl = d.webhookUrl;
        } catch (e) {}
      }

      const alertBody = `NEW PORTFOLIO VISITOR DETECTED!\n\n` +
                        `Location: ${visitorLog.city}, ${visitorLog.region}, ${visitorLog.country}\n` +
                        `IP Address: ${visitorLog.ip}\n` +
                        `ISP Network: ${visitorLog.org}\n` +
                        `Device Type: ${visitorLog.device}\n` +
                        `Page Visited: ${visitorLog.page}\n` +
                        `Timestamp: ${visitorLog.time}`;

      // Dispatch Email Alert
      fetch('https://formspree.io/f/xanyqjqp', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          subject: `🚨 Portfolio Visitor Alert: ${visitorLog.city}, ${visitorLog.country}`,
          message: alertBody
        })
      }).catch(() => {});

      // Dispatch Webhook / Telegram if configured
      if (webhookUrl) {
        const tgMsg = `🚨 *NEW PORTFOLIO VISITOR DETECTED!* 🚨\n\n` +
                      `📍 *Location:* ${visitorLog.city}, ${visitorLog.region}, ${visitorLog.country}\n` +
                      `🌐 *IP:* ${visitorLog.ip}\n` +
                      `📶 *ISP:* ${visitorLog.org}\n` +
                      `📱 *Device:* ${visitorLog.device}\n` +
                      `📄 *Page:* ${visitorLog.page}\n` +
                      `⏰ *Time:* ${visitorLog.time}`;

        if (webhookUrl.includes('api.telegram.org')) {
          fetch(webhookUrl + encodeURIComponent(tgMsg)).catch(() => {});
        } else {
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: tgMsg, text: tgMsg, visitor: visitorLog })
          }).catch(() => {});
        }
      }
    })
    .catch(() => {
      const fallbackLog = {
        ip: 'Active Visitor',
        city: 'Local Area',
        region: '',
        country: 'India',
        org: 'Mobile Data / Wi-Fi',
        device: getDeviceType(),
        page: pagePath,
        time: timestamp
      };
      const logsRaw = localStorage.getItem('kabilan_visitor_logs');
      let logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift(fallbackLog);
      localStorage.setItem('kabilan_visitor_logs', JSON.stringify(logs));
    });
}

initPortfolio();



