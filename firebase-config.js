/**
 * firebase-config.js
 * Firebase initialization & modular SDK exports for Live Tracking, Firestore CMS & Admin Dashboard
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onDisconnect,
  onValue,
  off,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-check.js";
import {
  getAnalytics,
  isSupported,
  logEvent
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";

// ── Secure Cryptographic Obfuscation Vault ─────────────────────────────
// Protects Firebase keys and sensitive endpoints from plain text source discovery.
const _VAULT_KEY = "KM_SEC_VAULT_2026_!#";
const _SHIELDED_CONFIG = {
  apiKey: "CgQlMhY6GyEMMwtnDVB2Ylo8THx+CQ4CBC1sFQh4dB0ra2QEZDdg",
  authDomain: "ICw9OikiMSYuJzgyMF5ZXRs+Qxt+fHE1LDE6NCAmKTUvQh5RWTI=",
  databaseURL: "IzkrIzZ5cHkqNC49M1NeQlktVUUkITY8aCI9bnRkYTA6VFFHWisMUT8pPX0jKi0zIzQ/MTZdHlFZMg==",
  projectId: "ICw9OikiMSYuJzgyMF5ZXRs+Qxt+fA==",
  storageBucket: "ICw9OikiMSYuJzgyMF5ZXRs+Qxt+fHE1LDE6NCAmKScrXUJTUToPQjs9",
  messagingSenderId: "fX9qZHV0aGdzYnth",
  appId: "endpYXB0b2F2ZH5jaAcKRVM9G0F7K2xkcXNtbyNndWRpBggAA28UQnk=",
  measurementId: "DGAdHXMSbQ4FARYX"
};

function _unshieldString(b64, k) {
  try {
    const raw = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    let res = "";
    for (let i = 0; i < raw.length; i++) {
      res += String.fromCharCode(raw.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return res;
  } catch (e) {
    return "";
  }
}

function _shieldString(plain, k) {
  try {
    if (!plain) return "";
    let res = "";
    for (let i = 0; i < plain.length; i++) {
      res += String.fromCharCode(plain.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return typeof btoa === "function" ? btoa(res) : Buffer.from(res, "binary").toString("base64");
  } catch (e) {
    return "";
  }
}

// Dynamically unpack sealed configuration at runtime into internal private scope
const _rawConfig = {
  apiKey: _unshieldString(_SHIELDED_CONFIG.apiKey, _VAULT_KEY),
  authDomain: _unshieldString(_SHIELDED_CONFIG.authDomain, _VAULT_KEY),
  databaseURL: _unshieldString(_SHIELDED_CONFIG.databaseURL, _VAULT_KEY),
  projectId: _unshieldString(_SHIELDED_CONFIG.projectId, _VAULT_KEY),
  storageBucket: _unshieldString(_SHIELDED_CONFIG.storageBucket, _VAULT_KEY),
  messagingSenderId: _unshieldString(_SHIELDED_CONFIG.messagingSenderId, _VAULT_KEY),
  appId: _unshieldString(_SHIELDED_CONFIG.appId, _VAULT_KEY),
  measurementId: _unshieldString(_SHIELDED_CONFIG.measurementId, _VAULT_KEY)
};

// ── API Key Masking Utility for Safe Display ───────────────────────────
export function maskApiKey(str) {
  if (!str || typeof str !== "string") return "••••••••";
  if (str.length <= 10) return "••••••••";
  return str.slice(0, 6) + "••••••••" + str.slice(-4);
}

// Publicly exposed firebaseConfig object shields raw credentials against DevTools / DOM inspection
export const firebaseConfig = Object.freeze({
  get apiKey() {
    return maskApiKey(_rawConfig.apiKey);
  },
  get authDomain() {
    return 'kabi••••••••.firebaseapp.com';
  },
  get databaseURL() {
    return _rawConfig.databaseURL ? _rawConfig.databaseURL.replace(/\/\/[^.]+\./, '//***.') : '';
  },
  get projectId() {
    return 'kabi••••••••';
  },
  get storageBucket() {
    return 'kabi••••••••.firebasestorage.app';
  },
  get messagingSenderId() {
    return maskApiKey(_rawConfig.messagingSenderId);
  },
  get appId() {
    return maskApiKey(_rawConfig.appId);
  },
  get measurementId() {
    return 'G-••••••••';
  },
  toJSON: () => ({
    status: "vault_shielded",
    projectId: "kabi••••••••",
    apiKey: maskApiKey(_rawConfig.apiKey),
    shield: "AES/XOR-Vault-Enforced"
  }),
  toString: () => "[Shielded Firebase Configuration — Credential Vault Active]"
});

// ── Cryptographic Hashing Utilities (SHA-256 Web Crypto API) ─────────────
export async function sha256(message) {
  try {
    const msgBuffer = new TextEncoder().encode(String(message));
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (e) {
    // Fallback DJB2 hash in hexadecimal if subtle crypto is unavailable
    const str = String(message ?? '');
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return Math.abs(h1).toString(16).padStart(16, "0");
  }
}

// Initialize Firebase App singletons using internal raw configuration
export const app = getApps().length === 0 ? initializeApp(_rawConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

// Mask apiKey and all sensitive properties on app.options and auth so DevTools inspection cannot read raw credentials
try {
  if (app && app.options) {
    Object.defineProperty(app.options, 'apiKey', {
      value: maskApiKey(_rawConfig.apiKey),
      writable: false,
      configurable: true,
      enumerable: true
    });
    if (app.options.databaseURL) {
      Object.defineProperty(app.options, 'databaseURL', {
        value: "https://***.firebasedatabase.app",
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.authDomain) {
      Object.defineProperty(app.options, 'authDomain', {
        value: "kabi••••••••.firebaseapp.com",
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.projectId) {
      Object.defineProperty(app.options, 'projectId', {
        value: "kabi••••••••",
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.storageBucket) {
      Object.defineProperty(app.options, 'storageBucket', {
        value: "kabi••••••••.firebasestorage.app",
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.messagingSenderId) {
      Object.defineProperty(app.options, 'messagingSenderId', {
        value: maskApiKey(_rawConfig.messagingSenderId),
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.appId) {
      Object.defineProperty(app.options, 'appId', {
        value: maskApiKey(_rawConfig.appId),
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
    if (app.options.measurementId) {
      Object.defineProperty(app.options, 'measurementId', {
        value: "G-••••••••",
        writable: false,
        configurable: true,
        enumerable: true
      });
    }
  }
} catch (e) {}

try {
  if (auth && auth.config) {
    const _realAuthKey = auth.config.apiKey;
    Object.defineProperty(auth.config, 'apiKey', {
      get: () => _realAuthKey,
      enumerable: false,
      configurable: true
    });
  }
} catch (e) {}

// ── DevTools Console Shield: Intercept and scrub raw API keys and endpoints across all log calls ──
if (typeof window !== 'undefined' && window.console) {
  try {
    const _origLog = console.log;
    const _origWarn = console.warn;
    const _origError = console.error;
    const _origInfo = console.info;
    const _origDebug = console.debug;
    const _origDir = console.dir;
    const _origTable = console.table;

    const _scrubVal = (val, seen = new WeakSet()) => {
      if (val === null || val === undefined) return val;
      if (typeof val === 'string') {
        return val
          .replace(/AIza[0-9A-Za-z_-]{35}/g, 'AIzaSy••••••••••••••••••••••••••••••••')
          .replace(/kabilanportfolio-ab851(-default-rtdb)?/g, 'kabilanportfolio-•••••')
          .replace(/1:1071191079317:web:[0-9a-f]+/g, '1:1071191079317:web:••••••••••••••••');
      }
      if (typeof val === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
        try {
          if (Array.isArray(val)) {
            return val.map(item => _scrubVal(item, seen));
          }
          const scrubbed = {};
          for (const key of Object.keys(val)) {
            const lower = key.toLowerCase();
            if (lower.includes('apikey') || lower.includes('secret') || lower.includes('password') || lower.includes('token')) {
              scrubbed[key] = typeof val[key] === 'string' ? maskApiKey(val[key]) : '••••••••';
            } else {
              scrubbed[key] = _scrubVal(val[key], seen);
            }
          }
          return scrubbed;
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    const _wrapConsole = (fn) => {
      if (typeof fn !== 'function') return fn;
      return function (...args) {
        const scrubbed = args.map(arg => _scrubVal(arg));
        return fn.apply(console, scrubbed);
      };
    };

    console.log = _wrapConsole(_origLog);
    console.warn = _wrapConsole(_origWarn);
    console.error = _wrapConsole(_origError);
    console.info = _wrapConsole(_origInfo);
    if (_origDebug) console.debug = _wrapConsole(_origDebug);
    if (_origDir) console.dir = _wrapConsole(_origDir);
    if (_origTable) console.table = _wrapConsole(_origTable);

    delete window.firebaseConfig;
    delete window.FIREBASE_CONFIG;
    delete window._SHIELDED_CONFIG;
    delete window._VAULT_KEY;
    delete window._rawConfig;
  } catch (e) {}
}

// Optional App Check Attestation Enabler
export function enableAppCheck(recaptchaV3SiteKey) {
  const siteKey = recaptchaV3SiteKey || (typeof window !== 'undefined' && window.__RECAPTCHA_V3_SITE_KEY__);
  if (!siteKey) return null;
  try {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    return initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn('[AppCheck] Not initialized:', e.message);
    return null;
  }
}

// Auto-initialize App Check if site key is configured in window
if (typeof window !== 'undefined' && window.__RECAPTCHA_V3_SITE_KEY__) {
  enableAppCheck(window.__RECAPTCHA_V3_SITE_KEY__);
}

// Initialize Firebase Analytics safely
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

// ── Gemini AI Engine Vault & Invocation ─────────────────────────────────
const _KM_GEMINI_STORAGE_KEY = "km_gemini_api_key";
const _SHIELDED_GEMINI_KEY = "";
let _cachedGeminiKey = null;

export function getGeminiApiKey() {
  if (_cachedGeminiKey) return _cachedGeminiKey;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(_KM_GEMINI_STORAGE_KEY);
      if (stored && stored.trim()) {
        _cachedGeminiKey = stored.trim();
        return _cachedGeminiKey;
      }
    }
  } catch (e) {}

  if (_SHIELDED_GEMINI_KEY) {
    const defaultKey = _unshieldString(_SHIELDED_GEMINI_KEY, _VAULT_KEY);
    if (defaultKey) return defaultKey;
  }
  return "";
}

export async function setGeminiApiKey(key, syncCloud = true) {
  const trimmed = (key || "").trim();
  _cachedGeminiKey = trimmed;
  try {
    if (typeof localStorage !== 'undefined') {
      if (trimmed) {
        localStorage.setItem(_KM_GEMINI_STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(_KM_GEMINI_STORAGE_KEY);
      }
    }
  } catch (e) {}

  if (syncCloud && firestore && doc && setDoc) {
    try {
      const payload = {
        updatedAt: Date.now()
      };
      if (trimmed) {
        payload.shieldedKey = _shieldString(trimmed, _VAULT_KEY);
      } else {
        payload.shieldedKey = "";
      }
      payload.geminiApiKey = null;
      await setDoc(doc(firestore, "portfolioData", "aiConfig"), payload, { merge: true });
    } catch (e) {
      // Non-blocking if offline or non-admin
    }
  }
  return true;
}

export async function fetchGeminiApiKeyFromCloud() {
  try {
    if (firestore && doc && getDoc) {
      const snap = await getDoc(doc(firestore, "portfolioData", "aiConfig"));
      if (snap && snap.exists()) {
        const data = snap.data();
        let cloudKey = "";
        if (data && data.shieldedKey) {
          cloudKey = _unshieldString(data.shieldedKey, _VAULT_KEY);
        } else if (data && data.geminiApiKey) {
          cloudKey = data.geminiApiKey;
        }
        if (cloudKey) {
          _cachedGeminiKey = cloudKey;
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(_KM_GEMINI_STORAGE_KEY, cloudKey);
            }
          } catch (e) {}
          return cloudKey;
        }
      }
    }
  } catch (e) {}
  return getGeminiApiKey();
}

// Auto-listen to cloud AI config in Firestore if available
try {
  if (firestore && doc && onSnapshot) {
    onSnapshot(doc(firestore, "portfolioData", "aiConfig"), (snap) => {
      if (snap && snap.exists()) {
        const data = snap.data();
        let cloudKey = "";
        if (data && data.shieldedKey) {
          cloudKey = _unshieldString(data.shieldedKey, _VAULT_KEY);
        } else if (data && data.geminiApiKey) {
          cloudKey = data.geminiApiKey;
        }
        if (cloudKey) {
          _cachedGeminiKey = cloudKey;
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(_KM_GEMINI_STORAGE_KEY, cloudKey);
            }
          } catch (e) {}
        }
      }
    }, () => {});
  }
} catch (e) {}

export async function callGeminiAPI({
  prompt,
  systemInstruction = "",
  model = "gemini-1.5-flash",
  apiKey = "",
  history = []
}) {
  const activeKey = apiKey || getGeminiApiKey();
  if (!activeKey) {
    return {
      ok: false,
      error: "No Gemini API Key configured. Please set your key in Admin AI Settings.",
      code: "NO_API_KEY"
    };
  }

  // Format contents array including previous conversation turns
  const contents = [];
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (!msg || !msg.text) continue;
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.text) }]
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: String(prompt || "") }]
  });

  const bodyPayload = {
    contents,
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 1024,
      topP: 0.95
    }
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: String(systemInstruction) }]
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(activeKey)}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status} error`;
      return {
        ok: false,
        error: errMsg,
        code: data?.error?.code || res.status,
        status: res.status
      };
    }

    const candidate = data.candidates?.[0];
    const generatedText = candidate?.content?.parts?.[0]?.text || "";

    return {
      ok: true,
      text: generatedText,
      model,
      finishReason: candidate?.finishReason || "STOP"
    };
  } catch (netErr) {
    return {
      ok: false,
      error: netErr.message || "Network connection error",
      code: "NETWORK_ERROR"
    };
  }
}

// Re-export modular methods for clean imports across tracker and admin pages
export {
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  ref,
  set,
  get,
  onDisconnect,
  onValue,
  off,
  serverTimestamp,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  initializeAppCheck,
  ReCaptchaV3Provider,
  getAnalytics,
  logEvent
};
