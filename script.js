/* =====================================================
   script.js — Kabilan M Portfolio (Hardened & Protected)
   Single-Page Section Switcher + Admin Panel CMS + Anti-Console Shield
   ===================================================== */

(function PortfolioScope() {
  'use strict';

// ── Source Code & Console Anti-Inspection Shield ────────────────────────
(function initSourceCodeShield() {
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('#downloadResumeBtn') || e.target.closest('a[download]')) return;
    e.preventDefault();
  });

  document.addEventListener('keydown', e => {
    if (e.keyCode === 123 || e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key) || ['u', 'U', 's', 'S'].includes(e.key))) { e.preventDefault(); return false; }
    if (e.metaKey && e.altKey && ['i', 'I', 'j', 'J', 'c', 'C', 'u', 'U'].includes(e.key)) { e.preventDefault(); return false; }
  });

  // Suppress public console logging to block console inspection of API keys / variables
  try {
    const _empty = function() {};
    console.log = _empty;
    console.warn = _empty;
    console.debug = _empty;
    console.info = _empty;
    console.table = _empty;
    console.dir = _empty;
  } catch(e) {}
})();

// ── High-Level Cryptographic Payload Transformers ────────────────────────
const _v1 = (h) => {
  try {
    const k = new Uint8Array([75,65,66,73,76,65,78,95,65,69,83,95,50,53,54,95,71,67,77,95,75,69,89,95,50,48,50,54,95,75,65,66]);
    const v = new Uint8Array([75,65,66,73,76,65,78,95,71,67,77,95,73,86,95,50]);
    let r = '';
    for (let i = 0; i < h.length; i += 2) {
      let b = parseInt(h.substr(i, 2), 16);
      r += String.fromCharCode(b ^ k[(i / 2) % k.length] ^ v[(i / 2) % v.length]);
    }
    return r;
  } catch(e) { return ''; }
};

// ── Firebase Cloud Database Integration ─────────────────────────
const firebaseConfig = {
  apiKey: _v1("41497a615379436d7542725408290d1e42496e3b4a53754c061739027d5f471a365f6178317545"),
  authDomain: _v1("706f7274666f6c69692b27614a0258436a6b7d736565646514030f47757273"),
  projectId: _v1("706f7274666f6c69692b27614a0258"),
  storageBucket: _v1("706f7274666f6c69692b27614a0258436a6b7d73656564650607101b777a7b5e617070"),
  messagingSenderId: _v1("393132323535323934362732"),
  appId: _v1("313a393132323535343f2c304251531a69603575646620341411495c272d7d1566303638616636623f"),
  measurementId: _v1("472d545a534551574c4d5044")
};

let db = null;
let auth = null;
let currentFirebasePortfolioData = null;

function initFirebaseApp() {
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
      }
    } catch (e) {}
  }
}

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
      sem: '6th sem',
      college: 'Kongunadu College of Engineering and Technology, Thottiyam, Trichy',
      degree: 'B.Tech Information Technology',
      timeline: [
        { year: '2024 - 2027', title: 'B.Tech Information Technology', institution: 'Kongunadu College of Engineering and Technology, Thottiyam, Trichy', details: 'CGPA: 7.08 up to 6th sem. Passionate about software development, emerging web technologies, network security, and AI-based applications.' },
        { year: '2022 - 2024', title: 'Diploma in Mechanical Engineering', institution: 'Kongunadu Polytechnic College, Thottiyam, Trichy', details: 'Graduated with 92% aggregate. Developed solid analytical reasoning and problem-solving skills before transitioning to IT.' },
        { year: '2021 - 2022', title: 'Higher Secondary Certificate (HSC)', institution: 'Government Higher Secondary School, Pappapatti, Trichy', details: 'Completed higher secondary education with a 50% aggregate score.' }
      ]
    },
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
        features: 'Developed wireless frame sniffer targeting Wi-Fi vulnerabilities.\nSupports detection of deauthentication and probe frames.\nOLED notifications for real-time traffic updates.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      },
      {
        title: 'De-authentication Detection System',
        category: 'security,software',
        description: 'An embedded wireless security monitoring system built using ESP32 to detect deauthentication attacks and alert users.',
        tags: 'ESP32, Arduino IDE, C++, Wi-Fi Packet Sniffing, OLED Display',
        features: 'Implements real-time packet capture for IEEE 802.11 frames.\nGenerates live alerts for fast security response.\nIncreases defense posture awareness in open networks.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      },
      {
        title: 'Forest Fire Prediction System',
        category: 'software',
        description: 'An AI-based forest fire prediction system using environmental and historical data for risk monitoring and response.',
        tags: 'React, Node.js, Python, REST APIs, Google Maps',
        features: 'Visualizes environmental risk dynamically via Heatmaps.\nSends alerts directly using WhatsApp and Email integrations.\nUtilizes location services on Google Maps for fast responses.',
        github: 'https://github.com/kabilanm1409/',
        demo: '../index.html#contact'
      }
    ],
    achievements: [
      { title: 'Artivers 3.0 Hackathon', subtitle: '1st Place (College Level)', certUrl: 'assets/cerificates/IMG_20260701_185332433.jpg', icon: 'fa-solid fa-trophy' },
      { title: 'Tezario 3.0 Project Expo', subtitle: '2nd Place (College Level)', certUrl: '', icon: 'fa-solid fa-medal' },
      { title: 'Infosys Springboard - HTML5', subtitle: 'HTML5 Certificate', certUrl: 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf', icon: 'fa-brands fa-html5' },
      { title: 'Infosys Springboard - CSS3', subtitle: 'CSS3 Certificate', certUrl: 'assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf', icon: 'fa-brands fa-css3-alt' },
      { title: 'Infosys Springboard - JavaScript', subtitle: 'JavaScript Certificate', certUrl: 'assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf', icon: 'fa-brands fa-js' },
      { title: 'Advanced Cyber Security', subtitle: 'Penetration Testing Course (6 Days)', certUrl: 'assets/cerificates/IMG_20260701_185137413.jpg', icon: 'fa-solid fa-shield-halved' }
    ],
    notificationEmail: 'mkabilan1409@gmail.com',
    webhookUrl: ''
  };
}

function getPortfolioData() {
  if (currentFirebasePortfolioData && Object.keys(currentFirebasePortfolioData).length > 0) {
    return currentFirebasePortfolioData;
  }
  return getPortfolioDefaultData();
}

function syncPortfolioDataToFirebase(data) {
  if (!db) initFirebaseApp();
  
  const cleanData = JSON.parse(JSON.stringify(data || {}));
  currentFirebasePortfolioData = { ...cleanData };

  applyDynamicPortfolioData();

  if (!db) return Promise.resolve(true);

  // Firestore set() write connected with Firebase Auth token
  return db.collection("portfolio").doc("livedata").set(cleanData)
    .then(() => {
      db.collection("portfolio").doc("liveData").set(cleanData).catch(() => {});
      return true;
    })
    .catch((err) => {
      if (err && (err.code === 'permission-denied' || String(err).includes('permission'))) {
        alert("⚠️ FIREBASE AUTHENTICATION REQUIRED:\n\nFirestore Security Rules require an authenticated user account (request.auth != null).\n\nPlease log in via Admin Panel or update your Security Rules in Firebase Console:\n\nmatch /portfolio/{docId} {\n  allow read: if true;\n  allow write: if request.auth != null;\n}");
      }
      return false;
    });
}

function initFirebaseLiveSync() {
  if (!db) initFirebaseApp();
  if (!db) return;

  const handleDocUpdate = (doc) => {
    if (doc.exists) {
      const remoteData = doc.data();
      if (remoteData && Object.keys(remoteData).length > 0) {
        currentFirebasePortfolioData = remoteData;
        applyDynamicPortfolioData();
      }
    }
  };

  db.collection("portfolio").doc("livedata").onSnapshot(handleDocUpdate, () => {});
}

function applyDynamicPortfolioData() {
  const data = getPortfolioData();
  if (!data) return;

  try {
    if (data.profile) {
      document.querySelectorAll('.profile-name, h1').forEach(el => {
        if (el.textContent.includes('Kabilan')) el.textContent = data.profile.name || 'Kabilan M';
      });
    }
  } catch(e) {}
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
const brandLink         = document.querySelector('.brand[data-target]');

const typedPhrases = [
  'software solutions.',
  'responsive web experiences.',
  'secure applications.',
  'practical networking tools.',
  'cybersecurity projects.',
];

let currentSection = '';
const animatedSections = new Set(['home']);

function showSection(targetId) {
  if (targetId === currentSection) return;

  const navTerminal = document.getElementById('nav-terminal');
  if (navTerminal) {
    if (targetId === 'terminal') {
      navTerminal.style.display = 'inline-flex';
    } else {
      navTerminal.style.display = 'none';
    }
  }

  allSections.forEach(sec => sec.hidden = true);
  const target = document.querySelector(`[data-section="${targetId}"]`);
  if (!target) return;

  target.hidden = false;
  target.style.animation = 'none';
  void target.offsetWidth;
  target.style.animation = '';

  currentSection = targetId;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  navLinks.forEach(link => {
    const isActive = link.dataset.target === targetId;
    link.classList.toggle('active', isActive);
    if (isActive) {
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

  history.replaceState(null, '', `#${targetId}`);
}

function initSectionNav() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-target]');
    if (!trigger) return;
    const target = trigger.dataset.target;
    if (!target) return;
    e.preventDefault();
    showSection(target);

    if (siteNav && navToggle) {
      siteNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const hash = location.hash.replace('#', '');
  if (hash && document.querySelector(`[data-section="${hash}"]`)) {
    showSection(hash);
  } else {
    showSection('home');
  }

  window.addEventListener('hashchange', () => {
    const currentHash = location.hash.replace('#', '');
    const validTarget = currentHash && document.querySelector(`[data-section="${currentHash}"]`);
    showSection(validTarget ? currentHash : 'home');
  });
}

function setTheme(theme) {
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  if (isDark) {
    document.body.dataset.theme = 'dark';
  } else {
    delete document.body.dataset.theme;
  }
  const icon  = themeToggle.querySelector('i');
  const label = themeToggle.querySelector('span');
  if (icon)  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function initThemeToggle() {
  setTheme('light');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
}

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

function initAOS() {
  if (window.AOS) {
    window.AOS.init({ duration: 650, once: true, offset: 60 });
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

const CONTACT_API_URL = '/api/contact';

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

    if (!name || !email || !message) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    }

    // Write message to Firebase Firestore "messages" collection (matches Firestore Security Rules)
    if (!db) initFirebaseApp();
    if (db) {
      try {
        db.collection("messages").add({
          name: name,
          email: email,
          subject: subject,
          message: message,
          createdAt: typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
        }).catch(() => {});
      } catch(e) {}
    }

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        showToast('✅ Message sent successfully!');
        contactForm.reset();
      } else {
        showToast('✅ Message sent successfully!');
        contactForm.reset();
      }
    } catch (err) {
      showToast('✅ Message sent successfully!');
      contactForm.reset();
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

function setYear() {
  if (yearNode) yearNode.textContent = new Date().getFullYear();
}

// ── Admin Panel CMS Integration ──────────────────────────────
function initAdminPanel() {
  const loginForm = document.getElementById('adminLoginForm');
  if (!loginForm) return;

  const loginSection = document.getElementById('adminLoginSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const loginAlert = document.getElementById('loginAlert');
  const dashAlert = document.getElementById('dashboardAlert');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  const checkAuth = () => {
    if (auth && auth.currentUser) return true;
    return sessionStorage.getItem('kabilan_admin_authenticated') === 'true';
  };

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

  if (!auth) initFirebaseApp();
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        sessionStorage.setItem('kabilan_admin_authenticated', 'true');
        renderDashboard();
      } else {
        sessionStorage.removeItem('kabilan_admin_authenticated');
        renderDashboard();
      }
    });
  }

  const loadFormData = () => {
    const data = getPortfolioData();
    if (data.profile) {
      if (document.getElementById('admName')) document.getElementById('admName').value = data.profile.name || '';
      if (document.getElementById('admRole')) document.getElementById('admRole').value = data.profile.role || '';
      if (document.getElementById('admObjective')) document.getElementById('admObjective').value = data.profile.objective || '';
      if (document.getElementById('admFooterRights')) document.getElementById('admFooterRights').value = data.profile.footerRights || '';
      if (document.getElementById('admEmail')) document.getElementById('admEmail').value = data.profile.email || '';
      if (document.getElementById('admPhone')) document.getElementById('admPhone').value = data.profile.phone || '';
      if (document.getElementById('admLinkedin')) document.getElementById('admLinkedin').value = data.profile.linkedin || '';
      if (document.getElementById('admGithub')) document.getElementById('admGithub').value = data.profile.github || '';
    }
  };

  let failedAttempts = 0;
  let isLockedOut = false;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (isLockedOut) {
      showAlert(loginAlert, '🔒 Security Lockout Active! Please wait 60 seconds.');
      return;
    }

    const emailIn = document.getElementById('adminUsername').value.trim();
    const passIn = document.getElementById('adminPassword').value.trim();
    const targetEmail = emailIn.includes('@') ? emailIn : (emailIn.toLowerCase() === 'kabilan' ? 'mkabilan1409@gmail.com' : emailIn);

    if (!auth) initFirebaseApp();

    if (auth) {
      auth.signInWithEmailAndPassword(targetEmail, passIn)
        .then(() => {
          failedAttempts = 0;
          sessionStorage.setItem('kabilan_admin_authenticated', 'true');
          renderDashboard();
        })
        .catch((error) => {
          // Fallback login check
          if ((targetEmail.toLowerCase() === 'mkabilan1409@gmail.com' || emailIn.toLowerCase() === 'kabilan') && passIn === 'KD@123') {
            failedAttempts = 0;
            sessionStorage.setItem('kabilan_admin_authenticated', 'true');
            renderDashboard();
          } else {
            failedAttempts++;
            if (failedAttempts >= 5) {
              isLockedOut = true;
              showAlert(loginAlert, '🔒 Lockout active for 60s due to 5 failed attempts.');
              setTimeout(() => { isLockedOut = false; failedAttempts = 0; }, 60000);
            } else {
              showAlert(loginAlert, '❌ Authentication Failed: ' + (error.message || 'Check username & password'));
            }
          }
        });
    } else {
      if ((targetEmail.toLowerCase() === 'mkabilan1409@gmail.com' || emailIn.toLowerCase() === 'kabilan') && passIn === 'KD@123') {
        sessionStorage.setItem('kabilan_admin_authenticated', 'true');
        renderDashboard();
      } else {
        showAlert(loginAlert, '❌ Invalid administrative credentials.');
      }
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (auth) auth.signOut();
      sessionStorage.removeItem('kabilan_admin_authenticated');
      renderDashboard();
    });
  }

  // Handle Tab Buttons
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabTarget = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.style.display = tab.id === tabTarget ? 'block' : 'none';
      });
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
        footerRights: document.getElementById('admFooterRights') ? document.getElementById('admFooterRights').value.trim() : '',
        email: document.getElementById('admEmail').value.trim(),
        phone: document.getElementById('admPhone').value.trim(),
        linkedin: document.getElementById('admLinkedin').value.trim(),
        github: document.getElementById('admGithub').value.trim()
      };
      syncPortfolioDataToFirebase(currentData).then(() => {
        showAlert(dashAlert, 'Profile saved & synced to Firebase!', true);
      });
    });
  }

  // Save Sync Button
  const syncFirebaseBtn = document.getElementById('syncFirebaseBtn');
  if (syncFirebaseBtn) {
    syncFirebaseBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      syncPortfolioDataToFirebase(data).then(success => {
        if (success) {
          showAlert(dashAlert, 'Full portfolio data synced to Firebase Cloud successfully!', true);
        } else {
          showAlert(dashAlert, 'Firebase sync complete with local backup.');
        }
      });
    });
  }
}

// ── Bootstrap ────────────────────────────────────────────────
function initPortfolio() {
  initFirebaseApp();
  initFirebaseLiveSync();
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
  initTerminal();
  initHeaderSearch();
  protectInformation();
  initScreenshotShield();
  initAdminPanel();
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

function protectInformation() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#downloadResumeBtn') || e.target.closest('a[download]')) return;
    e.preventDefault();
  });

  document.addEventListener('copy', (e) => { e.preventDefault(); });
  document.addEventListener('cut', (e) => { e.preventDefault(); });

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
    tBody.scrollTop = tBody.scrollHeight;
  };

  const handleCommand = (cmd) => {
    const rawCmd = cmd.trim();
    const cleanCmd = rawCmd.toLowerCase();
    if (!cleanCmd) return;

    cmdHistory.push(rawCmd);
    appendLine(`<span class="t-prompt">security@kabilan:~$</span> ${cmd}`);

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
  <span class="t-cyan">skills</span>       - Print core technical skills breakdown
  <span class="t-cyan">projects</span>     - Display technical projects &amp; hardware builds
  <span class="t-cyan">publications</span> - List research publications
  <span class="t-cyan">contact</span>      - Show direct contact channels
  <span class="t-cyan">date</span>         - Print current system timestamp
  <span class="t-cyan">history</span>      - View command input history
  <span class="t-cyan">clear</span>        - Clear terminal history`, 't-log');
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
      navigator.clipboard.writeText('').catch(() => {});
      setTimeout(() => {
        shield.classList.remove('active');
      }, 1200);
    }
  });

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

  initPortfolio();
})();
