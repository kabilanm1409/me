# 🔥 Deployment Guide: Firebase Hosting & Security Rules

Your portfolio and interactive admin panel are configured for **Firebase Hosting**, **Firebase Realtime Database**, and **Cloud Firestore**.

* **Firebase Project ID:** `kabilanportfolio-ab851`
* **Live Website URL:** [https://kabilanportfolio-ab851.web.app](https://kabilanportfolio-ab851.web.app) (or `https://kabilanportfolio-ab851.firebaseapp.com`)
* **Admin Dashboard URL:** [https://kabilanportfolio-ab851.web.app/admin.html](https://kabilanportfolio-ab851.web.app/admin.html)

---

## ⚡ Quick Deployment (Single Command)

To deploy everything (Hosting + Database Rules + Firestore Rules):

```bash
firebase deploy
# or
npm run deploy
```

You can also run selective deploys:
```bash
npm run deploy:hosting   # Website files only
npm run deploy:rules     # RTDB & Firestore rules only
```

---

## 🔹 Selective Deployment Options

### 1. Deploy Only Website / Hosting (HTML, CSS, JS, Assets)
If you made changes only to your web pages, styles, scripts, or admin panel:
```bash
firebase deploy --only hosting
```

### 2. Deploy Only Security Rules
If you updated `database.rules.json` or `firestore.rules`:
```bash
firebase deploy --only database,firestore
```

---

## 🛡️ Built-in Security on Firebase Hosting

Your `firebase.json` is configured with enterprise security:
1. **HTTP Security Headers**: Automatically applies `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy`.
2. **File Shielding (Ignore List)**: The following sensitive files are **blocked** from public download:
   * `.env*` (Environment secrets)
   * `server.js` (Backend server code)
   * `database.rules.json` & `firestore.rules` (Raw rules definitions)
   * `package.json` & `node_modules`
3. **Cache Policy**:
   * `admin.html` is configured with `no-cache, no-store, must-revalidate` so admin changes are immediately visible.
   * Static assets (CSS, images, fonts) are cached for 7 days for fast performance.

---

## 🧪 Local Testing Before Deploying

To test your portfolio locally with Firebase server emulation:

```bash
firebase serve
# or
firebase emulators:start
```
Your local preview will run at: `http://localhost:5000` (or `http://localhost:5002`).
