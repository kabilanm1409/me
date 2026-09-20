# Kabilan M — Security & Networking Engineer Portfolio

A modern, high-performance portfolio and real-time interactive telemetry platform powered fully by **Google Firebase**.

## 🚀 Live Firebase Deployment

* **Firebase Project ID:** `kabilanportfolio-ab851`
* **Live Website:** [https://kabilanportfolio-ab851.web.app](https://kabilanportfolio-ab851.web.app) (or `https://kabilanportfolio-ab851.firebaseapp.com`)
* **Admin Dashboard:** [https://kabilanportfolio-ab851.web.app/admin.html](https://kabilanportfolio-ab851.web.app/admin.html)

## 🔥 Firebase Services Utilized

1. **Firebase Hosting**:
   - Fast global CDN delivery with HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`).
   - Clean URLs enabled (`/admin` resolves directly to `admin.html`).
   - Shielding configuration that prevents sensitive backend code, rules, and secrets from being downloaded.
2. **Firebase Realtime Database**:
   - Live visitor presence stream (`/liveVisitors`).
   - Visitor journey tracking with page-level duration metrics.
   - Real-time contact message sync.
   - Dynamic portfolio content updates (`/portfolioData`).
3. **Cloud Firestore**:
   - Dual-store CMS backing for portfolio content (`/portfolioData/content`).
   - Contact messages archive (`/contactMessages`).
   - Historical session analytics log (`/visitorLogs`).
4. **Firebase Authentication**:
   - Anonymous authentication for visitors to write presence & logs securely under their session UID.
   - Email/Password authentication for admin login (`mkabilan1409@gmail.com` with UID `MR6jHebrOCMlOUoonM1hXOiGBvJ2`).
5. **Firebase App Check & Analytics**:
   - App Check attestation support with ReCaptchaV3 and localhost debug mode.
   - Native Firebase Analytics integration logging visitor presence, page views, and inquiry submissions.

## 🛠️ Deployment Instructions

To deploy all hosting files and security rules to Firebase:

```bash
npm run deploy
# or
firebase deploy
```

Selective deploy:
```bash
npm run deploy:hosting    # Deploy web assets only
npm run deploy:rules      # Deploy Realtime Database & Firestore security rules
```
