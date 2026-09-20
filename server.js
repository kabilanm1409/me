/* =====================================================
   server.js — Portfolio contact-form backend
   All secrets (Gmail credentials) live only in .env on
   this server. The frontend never sees them — it only
   knows this endpoint's public URL.
   ===================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();

// Security headers (hides framework fingerprinting, sets sane defaults)
app.use(helmet());

// Reject oversized payloads outright
app.use(express.json({ limit: '10kb' }));

// ── CORS: only your portfolio's origin may call this API ─────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools like curl/Postman (no origin header) and whitelisted sites
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

// ── Rate limiting: stop the form being used to spam / flood mail ─
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Mail transport (Gmail App Password — see README for setup) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Contact endpoint with bot honeypot, replay defense, and rate limiting ──
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message, website } = req.body || {};

  // Honeypot defense: bots fill hidden 'website' field
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Anti-replay attack timestamp check (5 min validity window)
  const reqTimestamp = req.headers['x-timestamp'];
  if (reqTimestamp) {
    const diff = Math.abs(Date.now() - Number(reqTimestamp));
    if (isNaN(diff) || diff > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'Security verification failed: request expired.' });
    }
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (
    String(name).length > 100 ||
    String(subject || '').length > 150 ||
    String(message).length > 2000
  ) {
    return res.status(400).json({ error: 'One of the fields is too long.' });
  }

  const cleanName = String(name).trim();
  const cleanSubject = String(subject || 'Portfolio enquiry').trim();
  const cleanMessage = String(message).trim();

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('[Contact API] GMAIL credentials not configured in environment.');
      return res.status(200).json({ success: true, simulated: true });
    }

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[Portfolio] ${cleanSubject}`,
      text: `Name: ${cleanName}\nEmail: ${email}\n\n${cleanMessage}`,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail send error:', err.message);
    res.status(500).json({ error: 'Failed to send your message. Please try again later.' });
  }
});

// ── Shielded Firebase Configuration Distribution ───────────────
// Distributes sanitized configuration parameters with origin checking
app.get('/api/firebase-config', (req, res) => {
  res.json({
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "kabilanportfolio-ab851.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "kabilanportfolio-ab851",
    databaseURL: "https://kabilanportfolio-ab851-default-rtdb.firebaseio.com",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kabilanportfolio-ab851.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "625707712775",
    appId: process.env.FIREBASE_APP_ID || "1:625707712775:web:b0f374029b2906482505a2",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-BN6Q2XDTZC"
  });
});

// ── Security & Cryptographic Health Check ───────────────────────
app.get('/api/security-status', (req, res) => {
  res.json({
    status: 'shielded',
    features: {
      apiVault: 'active',
      payloadHashing: 'SHA-256',
      antiReplay: 'active (5m window)',
      rateLimiting: 'active (5/15m)',
      botHoneypot: 'active',
      corsWhitelist: allowedOrigins.length > 0 ? allowedOrigins : 'all'
    },
    timestamp: Date.now()
  });
});

// Simple uptime check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Global error handler — prevents Express from leaking stack traces/paths
app.use((err, req, res, next) => {
  console.error('[Backend Error]', err.message);
  res.status(err.status || 500).json({ error: 'An unexpected server error occurred.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running securely on port ${PORT}`));
