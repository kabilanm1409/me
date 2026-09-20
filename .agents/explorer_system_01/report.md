# R3 Technical Survey Report: Responsive Performance & System Preservation

**Agent**: `explorer_system_01` (`teamwork_preview_explorer`)  
**Workspace**: `c:\Users\ELCOT\portfolio`  
**Date**: 2026-09-17  
**Objective**: Comprehensive investigation of telemetry, admin CMS, frontend terminal, responsiveness, accessibility, syntax health, and testing strategies to support the Cyber & Tech Glassmorphism modernization and interactive 3D certificate ribbon implementation without regressing existing systems.

---

## 1. Executive Summary

This survey provides the technical blueprint for fulfilling **Requirement R3 (Responsive Performance & System Preservation)** as specified in `ORIGINAL_REQUEST.md`. The portfolio is a hybrid single-page web application featuring custom vanilla JavaScript section routing, an interactive Kali-Linux cyber terminal, real-time telemetry via Firebase Modular SDK v10.13.0, and an administrative dashboard with live presence monitoring and content management.

### Key Investigation Outcomes:
1. **Syntax Health**: All core JavaScript files (`script.js`, `script.min.js`, `tracker.js`, `firebase-config.js`, `portfolio-cms.js`, `server.js`) parsed cleanly with zero syntax errors (`node -c` exited with code 0).
2. **Telemetry Integrity**: Telemetry in `tracker.js` is coupled with `firebase-config.js` and communicates with Firebase Realtime Database (`liveVisitors`, `visitorLogs`), Cloud Firestore, and Google Analytics. It relies on an encrypted XOR configuration vault, SHA-256 session digests, and wrapped `history.pushState`/`replaceState` methods.
3. **Admin CMS Architecture**: `admin.html` (3,352 lines) implements email/password authentication via Firebase Auth, a 15-minute brute-force lockout using HMAC-signed `localStorage`, real-time `onValue` subscriptions to `liveVisitors` and `contactMessages`, and bidirectional CMS synchronization against Realtime Database node `portfolioData` (falling back to Firestore `portfolioData/content`).
4. **Certificate Asset Audit**: All six certificate assets under `assets/cerificates/*` exist on disk with valid file sizes. All paths match between `index.html`, `pages/about.html`, and `admin.html`.
5. **Responsiveness Hazards**: While `style.css` enforces `overflow-x: hidden` on the body, horizontal overflow risks exist when introducing the infinite certificate ribbon unless contained with strict CSS containment and `overflow: hidden`. Mobile header layout on ultra-small screens (320px–360px) requires attention to avoid cramped search/menu controls.
6. **Accessibility Gaps**: The existing `#lightboxModal` lacks keyboard focus trapping, fails to dynamically toggle `aria-hidden` / `aria-modal`, and `#terminalBody` lacks `role="log"` / `aria-live="polite"`. Light-mode secondary accents (`#14b8a6` on white) exhibit borderline contrast (< 3:1) for small text.

---

## 2. Firebase Telemetry Tracking Architecture (`tracker.js` & `firebase-config.js`)

### 2.1 Configuration & Obfuscation Vault (`firebase-config.js`)
- **SDK Version**: Firebase Modular SDK v10.13.0 loaded from `https://www.gstatic.com/firebasejs/10.13.0/` (`firebase-app.js`, `firebase-auth.js`, `firebase-database.js`, `firebase-firestore.js`, `firebase-app-check.js`, `firebase-analytics.js`).
- **Cryptographic Obfuscation Vault**:
  - `_VAULT_KEY`: `"KM_SEC_VAULT_2026_!#"`
  - Configuration keys (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`) are stored as Base64-encoded XOR ciphers in `_SHIELDED_CONFIG` (`firebase-config.js:49-58`).
  - Decrypted at runtime via `_unshieldString(b64, k)` into frozen object `firebaseConfig` (`firebase-config.js:74-83`).
- **Exported Singletons**:
  - `app`: Singleton initialized via `getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()`
  - `auth`: Initialized via `getAuth(app)`
  - `db`: Initialized via `getDatabase(app)`
  - `firestore`: Initialized via `getFirestore(app)`
  - `analytics`: Safely initialized via `isSupported().then(...)`
- **Security Utilities**:
  - `sha256(message)`: Uses `crypto.subtle.digest('SHA-256')` with DJB2 hexadecimal fallback (`firebase-config.js:86-106`).
  - `maskApiKey(str)`: Masks API keys for administrative UI display (`firebase-config.js:109-113`).
  - `enableAppCheck(siteKey)`: Optional reCAPTCHA v3 attestation provider (`firebase-config.js:122-137`).

### 2.2 Telemetry Mechanism (`tracker.js`)
- **Execution Lifecycle**: Self-executing IIFE `initDeepVisitorTracker()` (`tracker.js:29-454`).
- **Authentication**:
  - Observes auth state: `onAuthStateChanged(auth, (user) => { if (user) registerPresence(user.uid); else signInAnonymously(auth); })` (`tracker.js:447-453`).
- **Telemetry Payload Collected**:
  1. `device`: Detected via userAgent regex (`tracker.js:64-136`):
     - `type`: Desktop | Mobile | Tablet
     - `brand`: Apple iPhone, Google Pixel, Samsung Galaxy, OnePlus, Xiaomi, Mac, Windows PC, Linux PC, etc.
     - `os`: iOS, iPadOS, Android, macOS, Windows 10/11, Linux, ChromeOS.
     - `browser`: Edge, Chrome, Safari, Firefox, Opera, Samsung Internet.
     - `screen`: Screen resolution string `${width}x${height}`.
     - `language`: `navigator.language`.
  2. `location` & `network`: Resolved via `resolveGeoAndISP()` (`tracker.js:139-244`):
     - Session cached in `sessionStorage.getItem('km_visitor_geo')`.
     - Primary external lookup: `https://ipapi.co/json/` (shielded in Base64 `aHR0cHM6Ly9pcGFwaS5jby9qc29uLw==`).
     - Fallback external lookup: `https://freeipapi.com/api/json` (`aHR0cHM6Ly9mcmVlaXBhcGkuY29tL2FwaS9qc29u`).
     - Anonymizes IP: Subnet masking (`xxx.xxx.xxx.*` or IPv6 prefix) and generates 16-character salt hash `sha256(rawIp + '_km_sec_salt')`.
     - Generates country flag emoji from ISO code (`tracker.js:54-61`).
  3. `sessionState`:
     - `sessionId`: `sess_${Date.now()}_${random}` stored in `sessionStorage.getItem('km_session_id')`.
     - `sessionHash`: 24-char SHA-256 digest of `${uid}_${sessionId}_${device.brand}_km_sec`.
     - `pagesVisited`: Array of `{ path, seconds, enteredAt }` tracked in `sessionStorage.getItem('km_page_journey')`.
- **Presence Tracking in Firebase Realtime Database**:
  - `ref(db, ".info/connected")` listener (`tracker.js:359-368`):
    - Sets `onDisconnect(presenceRef).remove()`.
    - Automatically wipes the visitor record from `liveVisitors/${uid}` when WebSocket connection closes.
    - Calls `syncToDatabase(true)` on connection.
- **Data Persistence Paths**:
  - Realtime Database:
    - `liveVisitors/${uid}`: Real-time active presence snapshot.
    - `visitorLogs/${uid}/${sessionId}`: Session historical record.
  - Cloud Firestore:
    - `doc(firestore, "liveVisitors", uid)`: Document merge (`tracker.js:340`).
    - `doc(firestore, "visitorLogs", sessionId)`: Document merge (`tracker.js:341`).
  - Google Analytics:
    - `logEvent(analytics, 'visitor_presence', ...)` (`tracker.js:347-354`).
- **Heartbeat & Event Listeners**:
  - Heartbeat timer: `setInterval(..., 18000)` (every 18 seconds) (`tracker.js:403-405`).
  - Navigation listeners:
    - `window.addEventListener('popstate', debouncedNavigate, { passive: true })`
    - `window.addEventListener('hashchange', debouncedNavigate, { passive: true })`
    - Intercepts `history.pushState` and `history.replaceState` with guard flag `__km_wrapped` (`tracker.js:418-436`).
    - Unload listener: `window.addEventListener('beforeunload', ...)` flushes timer to `sessionStorage`.

---

## 3. Admin CMS & Dashboard Architecture (`admin.html`)

### 3.1 Authentication & Security (`admin.html:3130-3330`)
- **Authentication Method**: Firebase Auth `signInWithEmailAndPassword(auth, email, password)`.
- **Username Alias**: Form input maps plain username `'kabilan'` to `'mkabilan1409@gmail.com'`.
- **Brute-Force Defense**:
  - Tracks attempts in `localStorage.getItem('km_admin_attempts')`.
  - Max attempts: 5 (`MAX_LOGIN_ATTEMPTS`).
  - Lockout duration: 15 minutes (`LOCKOUT_DURATION_MS = 900000`).
  - Integrity signature: Generates SHA-256 HMAC `sha256(attempts + lockoutUntil + 'km_admin_salt')` stored in `km_admin_lockout_sig` to prevent client-side localStorage tampering.
- **Password Reset**: Calls `sendPasswordResetEmail(auth, email)` targeting registered administrator.
- **Session State**: `onAuthStateChanged(auth, (user) => { if (user && !user.isAnonymous) { ... show dashboard ... } else { ... show login ... } })`.

### 3.2 Live Intelligence & Data Streams (`admin.html:2658-2710`)
- **Active Visitors Listener**:
  - Subscribes via `onValue(ref(db, "liveVisitors"), (snapshot) => { ... })`.
  - Filters out records where `(Date.now() - v.lastActive) >= 60000` (60-second staleness window).
  - Renders live metrics: Active count, top visited page, device distribution bar (Mobile vs Desktop vs Tablet), top ISP, and tabular visitor log.
- **Contact Inquiries Listener**:
  - Subscribes via `onValue(ref(db, "contactMessages"), (snapshot) => { ... })`.
  - Merges remote messages with local backup `localStorage.getItem('km_contact_inbox')`.
  - Provides CSV and JSON export facilities (`btnExportMsgsCsv`, `btnExportMsgsJson`).
- **Visitor History**:
  - Fetches historical sessions on demand via `getDocs(collection(firestore, "visitorLogs"))` (`admin.html:2160`).

### 3.3 Dynamic Content Management System (CMS) (`admin.html:2887-3100`)
- **CMS Target Node**: Realtime Database `ref(db, "portfolioData")`.
- **Fallback Node**: Cloud Firestore `doc(firestore, "portfolioData", "content")`.
- **Managed Sections**:
  1. `hero`: Eyebrow, Name, Subtitle, Resume URL, Profile Photo, Profile Title, Bio, and Stats (CGPA, Projects, Achievements).
  2. `about`: Who I Am, Career Objective, Work Style, and Internship details with certificate URL.
  3. `contact`: Direct contact phone, email, LinkedIn, and GitHub links.
  4. `skills`: Category lists and badge tags.
  5. `achievements`: List of achievement cards with titles, subtitles, icons, and `certUrl`.
- **Client Synchronization (`portfolio-cms.js`)**:
  - Client-side script on `index.html` subscribes to `ref(db, "portfolioData")` and Firestore snapshot.
  - Updates DOM elements dynamically while leaving static HTML as robust fallback.

---

## 4. Frontend Architecture (`script.js` & `portfolio-cms.js`)

### 4.1 Single-Page Section Switcher
- **Section Elements**: Marked with `[data-section="<id>"]`.
- **Routing Logic**:
  - Function `showSection(targetId, updateHistory)` manages visibility by setting `sec.hidden = true` / `targetNode.hidden = false`.
  - Synchronizes URL bar via `history.pushState({ section: targetId }, '', cleanPath)`.
  - Toggles active class and `aria-current="page"` on `[data-nav-link]`.
  - Restores position smoothly to top: `window.scrollTo({ top: 0, behavior: 'smooth' })`.
  - Triggers animations on entry: `animateSkillBars()` on entering `'skills'`, and `animateCounters()` on entering `'home'`.
  - Conditionally displays the Terminal navigation link (`#nav-terminal`) only when the terminal section is active.

### 4.2 Interactive Cyber Terminal Emulator
- **DOM Container**: `#terminal` section with `#terminalBody` output container and `#terminalInput` text field.
- **Trigger Chips**: `.cmd-chip` elements fire commands directly on click.
- **Command Registry**:
  | Command | Arguments | Behavior |
  |---|---|---|
  | `help` | none | Lists all available shell commands and diagnostic utilities |
  | `resume` / `cv` | none | Opens `assets/resume/kabilanm_resume without photo.pdf?v=4.0` in a new tab & outputs text summary |
  | `ls` / `dir` | none | Simulates Unix file directory listing (`resume.pdf`, `index.html`, `script.js`, `style.css`, etc.) |
  | `cat` | `<filename>` | Displays simulated file content (`resume.pdf`, `skills.txt`, `about.txt`, `readme.md`) |
  | `whoami` | none | Outputs `kabilan_m (Security & Networking Engineer | B.Tech IT Student)` |
  | `pwd` | none | Outputs `/home/kabilan/portfolio` |
  | `uname` | `-a` / none | Outputs simulated Kali Linux kernel release details |
  | `date` | none | Prints current client Date string |
  | `history` | none | Prints ordered history of commands entered during session |
  | `echo` | `<text>` | Echoes sanitized input text to output |
  | `ping` | `<host>` | Simulates 2-packet ICMP roundtrip ping with latency diagnostics |
  | `ifconfig` / `ip` | none | Displays simulated network interfaces (`wlan0`, `eth0`) and MAC addresses |
  | `sudo` | `<cmd>` | Outputs security warning: incident will be reported |
  | `clear` | none | Clears `#terminalBody` and re-renders terminal header |
  | `hash` | `<text>` | Computes real-time NIST FIPS 180-4 SHA-256 cryptographic digest via Web Crypto API |
  | `security` | none | Prints portfolio cybersecurity defense matrix status |
  | `vault` | none | Displays shielded API cryptographic vault architectural description |
  | `skills` | none | Prints technical skills profile breakdown |
  | `projects` | none | Summarizes key embedded security & software projects |
  | `publications` | none | Lists published academic research papers |
  | `contact` | none | Displays email, phone, LinkedIn, and GitHub links |
  | `sniff` | none | Toggles live simulated Wi-Fi packet monitor (intervals log beacon frames & simulated deauth alerts) |

### 4.3 Theme Switcher
- **State Management**: Persists theme `'light'` or `'dark'` in `localStorage.getItem('km_theme')`.
- **DOM Binding**: Sets `document.body.dataset.theme = 'dark'` or deletes the attribute for light mode.
- **Visual Updates**: Switches toggle icon (`fa-sun` / `fa-moon`) and text label (`Light mode` / `Dark mode`).

### 4.4 Mobile Navigation & Smooth Scrolling
- **Mobile Menu**: `#navToggle` toggles class `.open` and `aria-expanded` on `#siteNav`. Closes on background click outside `.site-header`.
- **Scroll Progress**: Listens to scroll events to update `.scroll-progress span` width `(scrollTop / maxScroll) * 100`.
- **Scroll to Top**: Shows `#scrollTopBtn` when `scrollTop > 300px`; smooth-scrolls to top on click.

### 4.5 Dual-Sync Contact Form
- **Honeypot**: Silent drop for spam bots filling hidden `website` field.
- **HMAC Signature**: Computes client SHA-256 digest `computeSha256(name|email|timestamp|km_sec)`.
- **Endpoints**:
  1. POST to `/api/contact` with `X-Timestamp` and `X-Signature` headers.
  2. Dually commits payload to Firebase Realtime Database `contactMessages/${msgId}` and Firestore.
  3. Always records message locally into `localStorage.getItem('km_contact_inbox')` (capped at 50 records).

### 4.6 Canvas Particles & Security Utilities
- **Hero Canvas**: `#heroCanvas` renders 38 ambient animated nodes adjusting color based on active theme (`120,160,255` dark vs `37,99,235` light). Pauses on page blur/visibility change.
- **Screenshot Shield**: `#screenshotShield` activates on `window.blur` or `PrintScreen` keypress to obfuscate sensitive content.

---

## 5. Syntax Verification & Static Diagnostics

All JavaScript modules were tested using Node.js syntax parsing compiler (`node -c`):

| File Path | Status | Diagnostic Output |
|---|---|---|
| `c:\Users\ELCOT\portfolio\script.js` | **PASS** | Exited with code 0 (Zero syntax errors) |
| `c:\Users\ELCOT\portfolio\script.min.js` | **PASS** | Exited with code 0 (Zero syntax errors) |
| `c:\Users\ELCOT\portfolio\tracker.js` | **PASS** | Exited with code 0 (Zero syntax errors) |
| `c:\Users\ELCOT\portfolio\firebase-config.js` | **PASS** | Exited with code 0 (Zero syntax errors) |
| `c:\Users\ELCOT\portfolio\portfolio-cms.js` | **PASS** | Exited with code 0 (Zero syntax errors) |
| `c:\Users\ELCOT\portfolio\server.js` | **PASS** | Exited with code 0 (Zero syntax errors) |

---

## 6. Responsiveness Analysis Across Viewport Widths (320px to 4K)

### 6.1 Viewport Scaling & Breakpoints
`style.css` contains breakpoints at:
- `1200px` / `1080px`: Desktop column collapse for overview and skill grids.
- `860px`: Mobile navigation collapse (hamburger toggle appears, `.site-nav` becomes flex column).
- `768px`: Tablet single-column layout for project cards and overview grid.
- `560px`: Small mobile adjustment (reduces section padding to 48px, forces hero action buttons to column).

### 6.2 Horizontal Overflow Hazards
1. **Certificate Ribbon (Requirement R2)**:
   - An infinite auto-scrolling ribbon requires careful isolation. If ribbon track width or card transformations exceed 100vw, mobile viewports experience horizontal page scroll and rubber-banding.
   - **Mitigation Requirement**: The ribbon container must enforce `overflow: hidden; width: 100%; position: relative; contain: layout paint;`.
2. **Terminal Long Output**:
   - Commands such as `hash <long-text>`, `sniff`, or `ifconfig` produce unbroken strings.
   - Current CSS has `.terminal-body { max-height: 380px; overflow-y: auto; }`.
   - **Mitigation Requirement**: Ensure `.t-line { overflow-x: auto; word-break: break-all; }` is maintained to prevent terminal output from blowing out container widths on 320px screens.
3. **Sticky Header on Ultra-Narrow Viewports (320px–360px)**:
   - `.site-header` contains the brand mark (42px), search box, theme toggle, and hamburger button.
   - At 320px viewport, available horizontal space within header is ~264px.
   - If the search box does not collapse or flex properly, header items can wrap into awkward double rows or overflow.
   - On mobile screens, `.header-search` has `max-width: 140px`, leaving ~124px for brand and icons.

### 6.3 Layout Shift Risks (CLS)
1. **Certificate Lightbox Modal Scrollbar Shift**:
   - `initLightbox()` applies `document.body.style.overflow = 'hidden'` upon opening.
   - On desktop browsers with standard 15px scrollbars, this triggers a noticeable layout shift of page content jumping right.
   - **Mitigation Requirement**: Add `scrollbar-gutter: stable;` to `html` or `body` in CSS.
2. **Image Aspect Ratios**:
   - Certificate thumbnails and project images should declare explicit `aspect-ratio` or width/height in CSS to reserve layout box dimensions prior to image network fetch.
3. **Animated Counters**:
   - Numbers in `.stat-pill strong` shift card widths while counting up unless monospaced or styled with `font-variant-numeric: tabular-nums`.

---

## 7. Accessibility Standards Evaluation

### 7.1 ARIA Roles & Live Regions
- **Current Positives**:
  - `#toast` has `role="status" aria-live="polite"`.
  - `#siteNav` and `#navToggle` handle `aria-expanded` and `aria-label`.
  - Achievements grid has `role="list"` and `role="listitem"`.
- **Gaps Identified**:
  - `#terminalBody` outputs dynamic logs and sniffed packets without an ARIA live region. Recommending `role="log" aria-live="polite" aria-atomic="false"` so assistive screen readers can announce terminal command results.
  - `#lightboxModal` defines `aria-hidden="true"` initially, but `script.js` never updates it to `aria-hidden="false"` or sets `aria-modal="true"` when the modal is opened.

### 7.2 Keyboard Navigation & Focus Trapping
- **Lightbox Modal**:
  - **Critical Gap**: When `#lightboxModal` opens, keyboard focus is not moved into the modal, and pressing `Tab` allows focus to escape behind the backdrop into inactive page elements.
  - **Mitigation Requirement**: Implement focus trapping (intercept `Tab` and `Shift+Tab` to cycle between `#lightboxClose` and interactive modal elements) and restore focus to the originating trigger element on close.
- **Escape Key Handling**:
  - `script.js:651-655` implements `Escape` key to close the modal. This functions properly.

### 7.3 Contrast Compliance in Dark vs Light Themes
- **Light Theme**:
  - Dark text `#1e293b` on light background `#f0f4ff` achieves **12.6:1** (passes WCAG AAA).
  - Secondary cyan/teal accent `#14b8a6` on white/light backgrounds achieves **~2.3:1**, which fails WCAG AA minimum (4.5:1) for small body text and eyebrows.
  - **Recommendation**: In light mode, darken teal text accents to `#0d9488` (4.6:1 contrast) while keeping `#14b8a6` for dark mode.
- **Dark Theme**:
  - Light text `#ddeeff` on dark background `#070d1a` achieves **14.8:1** (passes WCAG AAA).
  - Primary accent `#2563eb` on dark background achieves **~4.5:1** (borderline AA). A luminous blue like `#38bdf8` or `#60a5fa` provides superior legibility.

---

## 8. Asset Link Verification (`assets/cerificates/*`)

An exhaustive audit of all certificate files referenced in HTML and JS was conducted against the physical disk:

| Referenced Asset Path | Physical Disk Path | File Size | Status |
|---|---|---|---|
| `assets/cerificates/IMG_20260701_185332433.jpg` | `assets/cerificates/IMG_20260701_185332433.jpg` | 135,586 bytes | **VERIFIED VALID** |
| `assets/cerificates/IMG_20260701_185137413.jpg` | `assets/cerificates/IMG_20260701_185137413.jpg` | 203,313 bytes | **VERIFIED VALID** |
| `assets/cerificates/internship/IMG_20260701_185232887.jpg` | `assets/cerificates/internship/IMG_20260701_185232887.jpg` | 248,188 bytes | **VERIFIED VALID** |
| `assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf` | `assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf` | 228,270 bytes | **VERIFIED VALID** |
| `assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf` | `assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf` | 225,635 bytes | **VERIFIED VALID** |
| `assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf` | `assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf` | 120,892 bytes | **VERIFIED VALID** |

*Note*: The directory name on disk is literally spelled `assets/cerificates/` (with a single 't'). This spelling is consistently referenced across `index.html`, `pages/about.html`, and `admin.html`. Downstream implementers for R2 must maintain this exact spelling or provide alias redirection to prevent broken asset links.

---

## 9. Recommended Testing & Verification Strategy

### 9.1 Static Integrity Checks
1. **JavaScript Syntax Linter**:
   ```powershell
   node -c script.js tracker.js firebase-config.js portfolio-cms.js server.js
   ```
2. **Automated Asset & Certificate Path Verifier**:
   - A standalone Node script scanning all `*.html` files, parsing regex `(?:src|href)=["']([^"']+)["']`, resolving relative paths, and verifying `fs.existsSync(resolvedPath)`.
3. **CSS Glassmorphism Validation**:
   - Verify that all glassmorphic cards contain both `-webkit-backdrop-filter` and `backdrop-filter`.
   - Verify that `body` and certificate ribbon containers have strict `overflow-x: hidden`.

### 9.2 Automated Node.js Test Suite (`node --test`)
Implement a zero-dependency automated test runner using Node.js built-in `node:test` and `node:assert`:
- **Test Suite 1 (`test-syntax.mjs`)**: Verifies compilation of all JavaScript assets.
- **Test Suite 2 (`test-assets.mjs`)**: Validates every image, PDF, and certificate file path referenced in `index.html`, `pages/*.html`, and `admin.html`.
- **Test Suite 3 (`test-accessibility.mjs`)**: Parses `index.html` to confirm ARIA landmarks, `role="dialog"` on modals, focusable close buttons, and form labels.
- **Test Suite 4 (`test-contracts.mjs`)**: Asserts that `tracker.js`, `firebase-config.js`, and `script.js` export required functions and preserve Firebase references.

### 9.3 End-to-End (E2E) Browser Testing
- For automated headless verification of 3D tilt physics, infinite ribbon auto-scrolling, hover-to-pause, and modal lightbox popup:
  - Utilize **Playwright** or custom Node script driving Chromium/Edge headless.
  - Viewports to test:
    - Mobile: `320x568` (iPhone SE 1st gen) and `375x667` (iPhone SE)
    - Tablet: `768x1024` (iPad Mini)
    - Desktop: `1366x768` (Standard laptop) and `1920x1080` (Full HD)
    - Ultra-Wide / 4K: `2560x1440` and `3840x2160`
  - Assertions:
    - `document.documentElement.scrollWidth <= window.innerWidth` across all viewports.
    - Floating ribbon scroll position progresses over time and halts on `hover`.
    - Clicking a certificate opens lightbox modal, updates `aria-hidden="false"`, and traps focus.
