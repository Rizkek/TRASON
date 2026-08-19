const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys.push(...flattenKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function loadLang(file) {
  const content = fs.readFileSync(file, 'utf8');
  const cleaned = content
    .replace(/^export\s+const\s+\w+\s*=\s*/, 'module.exports = ')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/as\s+const\s*;?\s*$/, ';');
  try { return eval(cleaned); } catch(e) { return null; }
}

const en = loadLang('./src/libs/i18n/en.ts');
const enKeys = new Set(flattenKeys(en));

// Grep all t('key') calls from app files
const grepOut = execSync(`grep -rho --include="*.tsx" --include="*.ts" "t('[^']*')" ./src/app/\\(app\\)/`, {encoding:'utf8'});
const usedKeys = new Set();
const keyRe = /t\('([^']+)'\)/g;
let m;
while ((m = keyRe.exec(grepOut)) !== null) {
  const k = m[1];
  // Skip dynamic keys or non-dot keys
  if (k.includes('{') || !k.includes('.')) continue;
  usedKeys.add(k);
}

const missingFromEn = [...usedKeys].filter(k => !enKeys.has(k));
console.log(`\n=== Keys used in app but MISSING from en.ts ===`);
console.log(`Total used keys: ${usedKeys.size}`);
console.log(`Missing from en.ts: ${missingFromEn.length}`);
missingFromEn.forEach(k => console.log(`  MISSING: ${k}`));

// Keys in en.ts but never used in app
const unusedInEn = [...enKeys].filter(k => ![...usedKeys].some(u => u === k || k.startsWith(u)));
console.log(`\n=== Keys in en.ts but NOT used in app (potentially orphaned): ${unusedInEn.length} ===`);
// Only show if small set
if (unusedInEn.length <= 50) unusedInEn.forEach(k => console.log(`  UNUSED: ${k}`));
else console.log(`(too many to list, sample:)`, unusedInEn.slice(0, 30));
