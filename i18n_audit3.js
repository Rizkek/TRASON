const fs = require('fs');

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
  try { return eval(cleaned); } catch(e) { console.error('Parse error:', e.message); return {}; }
}

const en = loadLang('./src/libs/i18n/en.ts');
const enKeys = new Set(flattenKeys(en));
console.log(`EN keys total: ${enKeys.size}`);

const usedKeys = fs.readFileSync('C:/Users/m/.gemini/antigravity-ide/brain/9294215c-bf9b-4818-b786-bd556b8b4a8c/scratch/app_used_keys.txt', 'utf8')
  .split('\n')
  .map(k => k.trim().replace(/\r/g,''))
  .filter(k => k.length > 0);

console.log(`Used keys in app: ${usedKeys.length}`);

const missing = usedKeys.filter(k => !enKeys.has(k));
console.log(`\n=== Keys used in APP but MISSING from en.ts: ${missing.length} ===`);
missing.forEach(k => console.log(`  MISSING: ${k}`));

// Group by page section
const bySection = {};
usedKeys.forEach(k => {
  const section = k.split('.')[0];
  bySection[section] = (bySection[section] || 0) + 1;
});
console.log('\n=== Key sections used in app ===');
Object.entries(bySection).sort((a,b)=>b[1]-a[1]).forEach(([s,c]) => console.log(`  ${s}: ${c} keys`));
