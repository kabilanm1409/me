const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../../style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const lines = css.split('\n');
const backdropMatches = [];
lines.forEach((line, idx) => {
  if (line.includes('backdrop-filter')) {
    backdropMatches.push({ line: idx + 1, content: line.trim() });
  }
});

// Check specular linear-gradient highlights
const specularMatches = [];
lines.forEach((line, idx) => {
  if (line.includes('specular') || (line.includes('linear-gradient') && line.includes('rgba(255, 255, 255'))) {
    specularMatches.push({ line: idx + 1, content: line.trim() });
  }
});

// Check glowing box-shadows
const glowShadowMatches = [];
lines.forEach((line, idx) => {
  if (line.includes('box-shadow') && (line.includes('glow') || line.includes('var(--primary-glow)') || line.includes('var(--glass-border-glow)'))) {
    glowShadowMatches.push({ line: idx + 1, content: line.trim() });
  }
});

// Check active CSS custom properties
const customProps = [];
lines.forEach((line, idx) => {
  if (line.trim().startsWith('--glass-') || line.trim().startsWith('--cyber-')) {
    customProps.push({ line: idx + 1, content: line.trim() });
  }
});

console.log(JSON.stringify({
  totalBackdropFilterCount: backdropMatches.length,
  sampleBackdropFilters: backdropMatches.slice(0, 10),
  totalSpecularMatches: specularMatches.length,
  sampleSpecular: specularMatches.slice(0, 10),
  totalGlowShadowMatches: glowShadowMatches.length,
  sampleGlowShadow: glowShadowMatches.slice(0, 10),
  totalCustomProps: customProps.length,
  sampleCustomProps: customProps.slice(0, 15)
}, null, 2));
