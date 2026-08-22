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

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};

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

// Simple uptime check — useful for free-tier hosts that sleep idle servers
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
