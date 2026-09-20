/**
 * tracker.js — Deep Visitor Intelligence & Presence Tracker
 * Captures:
 * 1. Current page + Page journey history with exact duration spent on each page
 * 2. Device type & Mobile model (iPhone, Samsung, Pixel, etc.), OS, Browser, Screen size
 * 3. Internet Service Provider (ISP / Carrier e.g. Jio, Airtel, ACT)
 * 4. Geolocation (City, State, Country flag)
 * Stores in Firebase Realtime Database (/liveVisitors & /visitorLogs)
 */

import {
  auth,
  db,
  firestore,
  doc,
  setDoc,
  signInAnonymously,
  onAuthStateChanged,
  ref,
  set,
  onDisconnect,
  onValue,
  serverTimestamp,
  sha256,
  analytics,
  logEvent
} from "./firebase-config.js";

(function initDeepVisitorTracker() {
  'use strict';

  // ── Helper: Extract Clean Page / Section ──
  function getCurrentPage() {
    try {
      const pathname = window.location.pathname || '/';
      const hash = window.location.hash || '';

      if (pathname.endsWith('/index.html') || pathname === '/' || pathname === '') {
        return hash ? `/${hash.replace(/^#/, '')}` : '/';
      }

      if (pathname.includes('/pages/')) {
        const sub = pathname.split('/pages/').pop();
        return `/pages/${sub}${hash}`;
      }

      return pathname + hash;
    } catch (e) {
      return window.location.pathname || '/';
    }
  }

  // ── Helper: Country Code to Flag Emoji ──
  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // ── Helper: Device, Mobile Model & OS Detection ──
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    let deviceType = 'Desktop';
    let brand = 'Generic PC';
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    // Mobile / Tablet check
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
    const isMobile = !isTablet && (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua) || (window.innerWidth <= 768 && 'ontouchstart' in window));

    if (isTablet) deviceType = 'Tablet';
    else if (isMobile) deviceType = 'Mobile';

    // OS & Model Extraction
    if (/iphone/i.test(ua)) {
      deviceType = 'Mobile';
      const match = ua.match(/OS (\d+[_\.]\d+)/i);
      const osVer = match ? match[1].replace('_', '.') : '';
      os = `iOS ${osVer}`.trim();
      brand = 'Apple iPhone';
    } else if (/ipad/i.test(ua)) {
      deviceType = 'Tablet';
      brand = 'Apple iPad';
      os = 'iPadOS';
    } else if (/android/i.test(ua)) {
      const match = ua.match(/Android (\d+[_\.]\d+)/i);
      const osVer = match ? match[1] : '';
      os = `Android ${osVer}`.trim();

      if (/samsung|sm-[a-z0-9]+/i.test(ua)) brand = 'Samsung Galaxy';
      else if (/pixel/i.test(ua)) brand = 'Google Pixel';
      else if (/oneplus/i.test(ua)) brand = 'OnePlus';
      else if (/redmi|xiaomi/i.test(ua)) brand = 'Xiaomi Redmi';
      else if (/vivo/i.test(ua)) brand = 'Vivo';
      else if (/oppo/i.test(ua)) brand = 'Oppo';
      else if (/realme/i.test(ua)) brand = 'Realme';
      else if (/moto/i.test(ua)) brand = 'Motorola';
      else brand = 'Android Device';
    } else if (/macintosh|mac os x/i.test(ua)) {
      os = 'macOS';
      brand = 'Apple Mac';
    } else if (/windows/i.test(ua)) {
      os = 'Windows';
      if (/windows nt 10.0/i.test(ua)) os = 'Windows 10/11';
      brand = 'Windows PC';
    } else if (/linux/i.test(ua)) {
      os = 'Linux';
      brand = 'Linux PC';
    } else if (/cros/i.test(ua)) {
      os = 'ChromeOS';
      brand = 'Chromebook';
    }

    // Browser Detection
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios/i.test(ua) && !/opr|opera|brave/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';
    else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';

    const screenRes = `${window.screen.width || window.innerWidth}x${window.screen.height || window.innerHeight}`;

    return {
      type: deviceType,
      brand,
      os,
      browser,
      screen: screenRes,
      language: navigator.language || 'en'
    };
  }

  // ── Helper: Geolocation & Service Provider (ISP) Resolver ──
  async function resolveGeoAndISP() {
    const cached = sessionStorage.getItem('km_visitor_geo');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    const fallback = {
      country: 'Unknown',
      countryCode: '',
      region: '',
      city: 'Unknown',
      isp: 'Internet Provider',
      flag: '🌐',
      ip: '',
      ipHash: ''
    };

    function anonymizeIp(rawIp) {
      if (!rawIp) return '';
      if (rawIp.includes(':')) {
        return `${rawIp.split(':').slice(0, 3).join(':')}::*`;
      }
      return `${rawIp.split('.').slice(0, 3).join('.')}.*`;
    }

    async function fetchWithTimeout(url, ms = 4000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    }

    // Shielded external geo lookup endpoints
    const _ep1 = atob('aHR0cHM6Ly9pcGFwaS5jby9qc29uLw==');
    const _ep2 = atob('aHR0cHM6Ly9mcmVlaXBhcGkuY29tL2FwaS9qc29u');

    try {
      // Primary provider
      const res = await fetchWithTimeout(_ep1, 4000);
      if (res.ok) {
        const data = await res.json();
        const rawIp = data.ip || '';
        let ipHash = '';
        if (rawIp) {
          try {
            ipHash = (await sha256(rawIp + '_km_sec_salt')).slice(0, 16);
          } catch (e) {
            ipHash = 'anon_hash';
          }
        }

        const info = {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || '',
          region: data.region || '',
          city: data.city || 'Unknown',
          isp: data.org || data.asn || 'Internet Provider',
          flag: getFlagEmoji(data.country_code),
          ip: anonymizeIp(rawIp),
          ipHash
        };
        sessionStorage.setItem('km_visitor_geo', JSON.stringify(info));
        return info;
      }
    } catch (e) {}

    try {
      // Secondary fallback provider
      const res2 = await fetchWithTimeout(_ep2, 4000);
      if (res2.ok) {
        const data2 = await res2.json();
        const rawIp = data2.ipAddress || '';
        let ipHash = '';
        if (rawIp) {
          try {
            ipHash = (await sha256(rawIp + '_km_sec_salt')).slice(0, 16);
          } catch (e) {
            ipHash = 'anon_hash';
          }
        }

        const info2 = {
          country: data2.countryName || 'Unknown',
          countryCode: data2.countryCode || '',
          region: data2.regionName || '',
          city: data2.cityName || 'Unknown',
          isp: 'Internet Provider',
          flag: getFlagEmoji(data2.countryCode),
          ip: anonymizeIp(rawIp),
          ipHash
        };
        sessionStorage.setItem('km_visitor_geo', JSON.stringify(info2));
        return info2;
      }
    } catch (e2) {}

    return fallback;
  }

  // ── Main Presence & Journey Tracking Logic ──
  async function registerPresence(uid) {
    if (!uid) return;

    // Session initialization
    let sessionId = sessionStorage.getItem('km_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem('km_session_id', sessionId);
    }

    const presenceRef = ref(db, `liveVisitors/${uid}`);
    const visitorLogRef = ref(db, `visitorLogs/${uid}/${sessionId}`);
    const connectedRef = ref(db, ".info/connected");

    const device = getDeviceInfo();
    const geoInfo = await resolveGeoAndISP();

    // Session integrity hash (SHA-256)
    let sessionHash = '';
    try {
      sessionHash = (await sha256(`${uid}_${sessionId}_${device.brand}_km_sec`)).slice(0, 24);
    } catch (e) {
      sessionHash = 'sec_valid';
    }

    // Page Journey State
    let currentPage = getCurrentPage();
    let pageStartTime = Date.now();

    let storedJourney = [];
    try {
      storedJourney = JSON.parse(sessionStorage.getItem('km_page_journey') || '[]');
    } catch (e) {
      storedJourney = [];
    }

    if (!storedJourney.find(p => p.path === currentPage)) {
      storedJourney.push({
        path: currentPage,
        seconds: 0,
        enteredAt: Date.now()
      });
      sessionStorage.setItem('km_page_journey', JSON.stringify(storedJourney));
    }

    // Function to calculate total duration and current journey
    function getUpdatedJourney() {
      const now = Date.now();
      const elapsedOnCurrent = Math.max(0, Math.floor((now - pageStartTime) / 1000));

      const updated = storedJourney.map(p => {
        if (p.path === currentPage) {
          return { ...p, seconds: (p.seconds || 0) + elapsedOnCurrent };
        }
        return p;
      });

      const totalSec = updated.reduce((acc, curr) => acc + (curr.seconds || 0), 0);
      return { journey: updated, totalSeconds: totalSec };
    }

    // Function to sync entire payload to Firebase
    function syncToDatabase(isInitial = false) {
      const { journey, totalSeconds } = getUpdatedJourney();

      const payload = {
        sessionId,
        sessionHash,
        currentPage,
        joinedAt: isInitial ? serverTimestamp() : (Date.now() - totalSeconds * 1000),
        lastActive: Date.now(),
        totalTimeSpent: totalSeconds,
        pagesVisited: journey,
        device,
        location: {
          country: geoInfo.country,
          countryCode: geoInfo.countryCode,
          region: geoInfo.region,
          city: geoInfo.city,
          flag: geoInfo.flag
        },
        network: {
          isp: geoInfo.isp,
          ip: geoInfo.ip,
          ipHash: geoInfo.ipHash
        }
      };

      set(presenceRef, payload).catch(() => {});
      set(visitorLogRef, payload).catch(() => {});

      // Also sync to Cloud Firestore collections
      try {
        setDoc(doc(firestore, "liveVisitors", uid), payload, { merge: true }).catch(() => {});
        setDoc(doc(firestore, "visitorLogs", sessionId), payload, { merge: true }).catch(() => {});
      } catch (e) {}

      // Log to Firebase Analytics
      if (analytics && logEvent) {
        try {
          logEvent(analytics, 'visitor_presence', {
            page_path: currentPage,
            device_type: device.type,
            browser: device.browser,
            country: geoInfo.country,
            is_initial: isInitial
          });
        } catch (e) {}
      }
    }

    // On connection state change
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(presenceRef)
          .remove()
          .then(() => {
            syncToDatabase(true);
          })
          .catch(() => {});
      }
    });

    // Handle Page / Section Navigation
    function onNavigate() {
      const newPage = getCurrentPage();
      if (newPage === currentPage) return;

      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - pageStartTime) / 1000));

      // Record elapsed time on previous page
      storedJourney = storedJourney.map(p => {
        if (p.path === currentPage) {
          return { ...p, seconds: (p.seconds || 0) + elapsed };
        }
        return p;
      });

      // Switch to new page
      currentPage = newPage;
      pageStartTime = now;

      if (!storedJourney.find(p => p.path === currentPage)) {
        storedJourney.push({
          path: currentPage,
          seconds: 0,
          enteredAt: now
        });
      }

      sessionStorage.setItem('km_page_journey', JSON.stringify(storedJourney));
      syncToDatabase(false);
    }

    // Fallback Heartbeat (every 18 seconds)
    const heartbeatInterval = setInterval(() => {
      syncToDatabase(false);
    }, 18000);

    let navDebounce = null;
    function debouncedNavigate() {
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(onNavigate, 60);
    }

    // Navigation listeners
    window.addEventListener('popstate', debouncedNavigate, { passive: true });
    window.addEventListener('hashchange', debouncedNavigate, { passive: true });

    // Intercept SPA pushState / replaceState safely once
    if (typeof history.pushState === 'function' && !history.pushState.__km_wrapped) {
      const origPush = history.pushState;
      history.pushState = function () {
        const ret = origPush.apply(this, arguments);
        debouncedNavigate();
        return ret;
      };
      history.pushState.__km_wrapped = true;
    }

    if (typeof history.replaceState === 'function' && !history.replaceState.__km_wrapped) {
      const origReplace = history.replaceState;
      history.replaceState = function () {
        const ret = origReplace.apply(this, arguments);
        debouncedNavigate();
        return ret;
      };
      history.replaceState.__km_wrapped = true;
    }

    // Flush on unload
    window.addEventListener('beforeunload', () => {
      clearInterval(heartbeatInterval);
      const { journey, totalSeconds } = getUpdatedJourney();
      sessionStorage.setItem('km_page_journey', JSON.stringify(journey));
    });
  }

  // Auth observer
  onAuthStateChanged(auth, (user) => {
    if (user) {
      registerPresence(user.uid);
    } else {
      signInAnonymously(auth).catch(() => {});
    }
  });
})();
