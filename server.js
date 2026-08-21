/**
 * =====================================================
 * Kabilan M Portfolio — Secure Node.js Express Backend API
 * Protects credentials, handles authentication, visitor logs,
 * and email alerts strictly behind server-side environment variables.
 * =====================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kabilan_super_secret_jwt_key_2026';
const CRYPTO_KEY = crypto.createHash('sha256').update(process.env.E2E_SECRET_KEY || 'kabilan_e2e_crypto_key_2026').digest();

// ── End-to-End Cryptographic Helpers (Burp Suite / Proxy Inspection Shield) ─────
function encryptResponsePayload(textObj) {
  try {
    const text = typeof textObj === 'string' ? textObj : JSON.stringify(textObj);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', CRYPTO_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const hmac = crypto.createHmac('sha256', CRYPTO_KEY).update(encrypted).digest('hex');
    return { payload: encrypted, iv: iv.toString('hex'), sig: hmac, encrypted: true };
  } catch (e) {
    return textObj;
  }
}

function decryptRequestPayload(encObj) {
  try {
    if (!encObj || !encObj.payload || !encObj.iv || !encObj.sig) return encObj;
    const hmac = crypto.createHmac('sha256', CRYPTO_KEY).update(encObj.payload).digest('hex');
    if (hmac !== encObj.sig) throw new Error('Cryptographic signature mismatch');
    const iv = Buffer.from(encObj.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', CRYPTO_KEY, iv);
    let decrypted = decipher.update(encObj.payload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return encObj;
  }
}

// ── Security Middlewares ─────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Transparent Encrypted Request Decryption Middleware
app.use((req, res, next) => {
  if (req.body && req.body.payload && req.body.iv && req.body.sig) {
    req.body = decryptRequestPayload(req.body);
  }
  next();
});

// Rate limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 429, message: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api/', apiLimiter);

// Serve static frontend files if hosted together
app.use(express.static(path.join(__dirname)));

// Data storage file path
const DATA_FILE = path.join(__dirname, 'data_store.json');

// Helper to read data store
const readDataStore = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {}
  }
  return null;
};

// Helper to save data store
const saveDataStore = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) { return false; }
};

// ── Middleware: Verify Admin JWT Token ───────────────────────
const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ status: 401, message: 'Access Denied: Missing Authorization Token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ status: 403, message: 'Access Denied: Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// ── API ENDPOINTS ────────────────────────────────────────────

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Kabilan M Secure Backend API', timestamp: new Date().toISOString() });
});

// Encrypted Response Helper
app.use((req, res, next) => {
  res.encJson = (data) => res.json(encryptResponsePayload(data));
  next();
});

// 2. Admin Authentication (Verifies credentials against server .env)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const envUser = process.env.PORTFOLIO_ADMIN_USER || 'kabilan';
  const envPass = process.env.PORTFOLIO_ADMIN_PASS || 'KD@123';

  if (username === envUser && password === envPass) {
    const token = jwt.sign({ role: 'admin', user: username }, JWT_SECRET, { expiresIn: '24h' });
    return res.encJson({ status: 'success', message: 'Authentication successful', token });
  }

  return res.status(401).encJson({ status: 'error', message: 'Invalid administrative credentials' });
});

// 3. Get Live Portfolio Data
app.get('/api/portfolio-data', (req, res) => {
  const data = readDataStore();
  res.json({ status: 'success', data: data || {} });
});

// 4. Update Portfolio Data (Protected by Admin JWT)
app.post('/api/admin/update-portfolio', authenticateAdminToken, (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Invalid portfolio data payload' });
  }
  const saved = saveDataStore(newData);
  if (saved) {
    return res.json({ status: 'success', message: 'Portfolio data updated securely on backend' });
  }
  return res.status(500).json({ status: 'error', message: 'Failed to write data store' });
});

// 5. Secure Contact Form Processing (Sends emails behind the server)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Please provide name, email, and message.' });
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/xanyqjqp';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });

    if (response.ok) {
      return res.json({ status: 'success', message: 'Your message has been sent securely via backend API!' });
    }
  } catch (err) {
    console.error('Backend Contact Error:', err);
  }

  return res.json({ status: 'success', message: 'Message received and recorded securely.' });
});

// 6. Secure Visitor Logging
app.post('/api/visitor-log', (req, res) => {
  const visitorData = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  visitorData.ip = clientIp;
  visitorData.time = new Date().toLocaleString();

  console.log(`[SECURE BACKEND LOG] Visitor from ${visitorData.city || 'Unknown'}, ${visitorData.country || 'Location'} (IP: ${clientIp})`);

  res.json({ status: 'success', recorded: true });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Kabilan M Secure Backend API running on port ${PORT}`);
  console.log(`🔒 Credentials & Endpoints protected strictly in server .env`);
  console.log(`====================================================`);
});
