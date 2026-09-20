const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const filesToCheck = [
  path.join(rootDir, 'index.html'),
  path.join(rootDir, 'pages/about.html'),
  path.join(rootDir, 'pages/contact.html'),
  path.join(rootDir, 'pages/projects.html'),
  path.join(rootDir, 'admin.html')
];

let brokenCount = 0;
let totalChecked = 0;
const results = [];

for (const filePath of filesToCheck) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const regex = /(?:src|href|data-cert-src)=["']([^"']*assets\/cerificates[^"']*)["']/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    totalChecked++;
    const link = m[1];
    const resolvedPath = path.resolve(dir, link);
    const exists = fs.existsSync(resolvedPath);
    let size = 0;
    if (exists) {
      size = fs.statSync(resolvedPath).size;
    }
    const record = {
      sourceFile: path.relative(rootDir, filePath),
      link,
      resolvedPath: path.relative(rootDir, resolvedPath),
      exists,
      size,
      status: exists && size > 0 ? 'OK' : 'FAIL'
    };
    results.push(record);
    if (!exists || size === 0) {
      brokenCount++;
    }
  }
}

console.log(JSON.stringify({ totalChecked, brokenCount, results }, null, 2));
if (brokenCount > 0) process.exit(1);
