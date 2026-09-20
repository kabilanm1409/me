/**
 * tests/helpers/test_fixtures.js
 * Authoritative ground truth schemas, expected values, and test fixtures.
 * Sources: ORIGINAL_REQUEST.md, PROJECT.md, and Explorer Survey Reports.
 */

const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const CERTIFICATE_FILES = [
  {
    id: 'C1',
    relPath: 'assets/cerificates/IMG_20260701_185332433.jpg',
    title: 'Artiverse 3.0 Intra-College Hackathon',
    award: '1st Place',
    category: 'Hackathon',
    type: 'image/jpeg',
    minSizeBytes: 100000,
  },
  {
    id: 'C2',
    relPath: 'assets/cerificates/IMG_20260701_185137413.jpg',
    title: 'Advanced Cyber Security (Penetration Testing Course)',
    award: 'Security / Pentest',
    category: 'Security',
    type: 'image/jpeg',
    minSizeBytes: 150000,
  },
  {
    id: 'C3',
    relPath: 'assets/cerificates/internship/IMG_20260701_185232887.jpg',
    title: 'Full Stack Developer Trainee (e-soft IT Solutions)',
    award: 'Internship / Full Stack',
    category: 'Web Dev',
    type: 'image/jpeg',
    minSizeBytes: 200000,
  },
  {
    id: 'C4',
    relPath: 'assets/cerificates/Infosys spring board/1-0873ed08-16af-452e-829d-6639b42222b3.pdf',
    title: 'Infosys Springboard — HTML5 Certification',
    award: 'Technical Certified',
    category: 'Web Dev',
    type: 'application/pdf',
    minSizeBytes: 200000,
  },
  {
    id: 'C5',
    relPath: 'assets/cerificates/Infosys spring board/1-1331af90-be4b-4074-bf6a-8db9f0230d64.pdf',
    title: 'Infosys Springboard — CSS3 Certification',
    award: 'Technical Certified',
    category: 'Web Dev',
    type: 'application/pdf',
    minSizeBytes: 200000,
  },
  {
    id: 'C6',
    relPath: 'assets/cerificates/Infosys spring board/1-d4d1128f-a5ea-479d-8dea-c5da93d73668.pdf',
    title: 'Infosys Springboard — JavaScript Certification',
    award: 'Technical Certified',
    category: 'Web Dev',
    type: 'application/pdf',
    minSizeBytes: 100000,
  },
];

const JAVASCRIPT_FILES = [
  'script.js',
  'tracker.js',
  'firebase-config.js',
  'portfolio-cms.js',
  'server.js',
];

const EXPECTED_CYBER_TOKENS = {
  light: [
    '--glass-surface',
    '--glass-border',
    '--glass-blur',
    '--cyber-cyan',
    '--cyber-teal',
    '--cyber-indigo',
  ],
  dark: [
    '--glass-surface',
    '--glass-border',
    '--glass-blur',
    '--cyber-cyan',
    '--cyber-teal',
    '--cyber-indigo',
  ],
};

const TERMINAL_COMMAND_REGISTRY = [
  'help',
  'resume',
  'cv',
  'ls',
  'dir',
  'cat',
  'whoami',
  'pwd',
  'uname',
  'date',
  'history',
  'echo',
  'ping',
  'ifconfig',
  'ip',
  'sudo',
  'clear',
  'hash',
  'security',
  'vault',
  'skills',
  'projects',
  'publications',
  'contact',
  'sniff',
];

const FEATURES = {
  F1: { id: 'F1', name: 'Cyber Glassmorphism CSS Tokens', milestone: 'M1' },
  F2: { id: 'F2', name: 'Glassmorphic Cards & UI Modernization', milestone: 'M1' },
  F3: { id: 'F3', name: 'Developer Typography & Pill Badges', milestone: 'M1' },
  F4: { id: 'F4', name: 'Certificate Asset Integration', milestone: 'M2' },
  F5: { id: 'F5', name: 'Infinite Horizontal 3D Floating Ribbon', milestone: 'M2' },
  F6: { id: 'F6', name: '3D Tilt Physics & Elevation Drop Shadows', milestone: 'M2' },
  F7: { id: 'F7', name: 'Award & Category Badges', milestone: 'M2' },
  F8: { id: 'F8', name: 'Dual-Mode Lightbox Preview Modal', milestone: 'M2' },
  F9: { id: 'F9', name: 'Touch & Swipe Controls', milestone: 'M2' },
  F10: { id: 'F10', name: 'Telemetry & CMS Preservation', milestone: 'M3' },
  F11: { id: 'F11', name: 'Cyber Terminal Emulator Preservation', milestone: 'M3' },
  F12: { id: 'F12', name: 'Theme Switcher Harmony', milestone: 'M3' },
  F13: { id: 'F13', name: 'Responsive & Zero Layout Shift', milestone: 'M3' },
  F14: { id: 'F14', name: 'Accessibility (ARIA & Focus Trap)', milestone: 'M3' },
  F15: { id: 'F15', name: 'Zero JavaScript Syntax Errors', milestone: 'M3' },
};

module.exports = {
  ROOT_DIR,
  CERTIFICATE_FILES,
  JAVASCRIPT_FILES,
  EXPECTED_CYBER_TOKENS,
  TERMINAL_COMMAND_REGISTRY,
  FEATURES,
};
