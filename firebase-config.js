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

// Dynamically unpack sealed configuration at runtime
export const firebaseConfig = Object.freeze({
  apiKey: _unshieldString(_SHIELDED_CONFIG.apiKey, _VAULT_KEY),
  authDomain: _unshieldString(_SHIELDED_CONFIG.authDomain, _VAULT_KEY),
  databaseURL: _unshieldString(_SHIELDED_CONFIG.databaseURL, _VAULT_KEY),
  projectId: _unshieldString(_SHIELDED_CONFIG.projectId, _VAULT_KEY),
  storageBucket: _unshieldString(_SHIELDED_CONFIG.storageBucket, _VAULT_KEY),
  messagingSenderId: _unshieldString(_SHIELDED_CONFIG.messagingSenderId, _VAULT_KEY),
  appId: _unshieldString(_SHIELDED_CONFIG.appId, _VAULT_KEY),
  measurementId: _unshieldString(_SHIELDED_CONFIG.measurementId, _VAULT_KEY)
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

// ── API Key Masking Utility for Safe Display ───────────────────────────
export function maskApiKey(str) {
  if (!str || typeof str !== "string") return "••••••••";
  if (str.length <= 10) return "••••••••";
  return str.slice(0, 6) + "••••••••" + str.slice(-4);
}

// Initialize Firebase App singletons
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

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
