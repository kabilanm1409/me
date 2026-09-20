const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../../style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const checks = {
  marqueeAnimation: /@keyframes\s+marqueeRibbon\s*\{[^}]*translate3d\(-50%[^}]*\}/s.test(css) || /@keyframes\s+ribbonScroll\s*\{[^}]*translate3d\(-50%[^}]*\}/s.test(css) || /@keyframes[^{]+(-50%|translateX|translate3d)[^}]+}/s.test(css),
  hoverToPause: /\.cert-ribbon-track:hover|\.cert-ribbon-viewport:hover\s+\.cert-ribbon-track/.test(css) && css.includes('animation-play-state: paused'),
  perspective: css.includes('perspective:') || css.includes('perspective :'),
  tiltTransform: /transform:[^;]*rotate[XY]/i.test(css) || /transform:[^;]*translateY/i.test(css),
  cardElevation: /\.cert-card/.test(css) && css.includes('box-shadow')
};

console.log('Ribbon CSS audit:', checks);
