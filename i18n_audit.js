const fs = require('fs');
const path = require('path');

// Read en.ts and extract as flat key-value map via text parsing
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

// Load language files
function loadLang(file) {
  const content = fs.readFileSync(file, 'utf8');
  // Strip TS export syntax, eval as JS
  const cleaned = content
    .replace(/^export\s+const\s+\w+\s*=\s*/, 'module.exports = ')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/as\s+const\s*;?\s*$/, ';');
  try {
    return eval(cleaned);
  } catch(e) {
    return null;
  }
}

const i18nDir = './src/libs/i18n';
const langs = ['en', 'id', 'ja', 'es'];
const langData = {};
for (const lang of langs) {
  const d = loadLang(path.join(i18nDir, `${lang}.ts`));
  langData[lang] = d ? flattenKeys(d) : [];
  console.log(`${lang}: ${langData[lang].length} keys`);
}

// Find missing keys per language compared to EN
const enKeys = new Set(langData['en']);
const report = {};
for (const lang of ['id', 'ja', 'es']) {
  const langKeys = new Set(langData[lang]);
  const missingInLang = [...enKeys].filter(k => !langKeys.has(k));
  const extraInLang = [...langKeys].filter(k => !enKeys.has(k));
  report[lang] = { missing: missingInLang, extra: extraInLang };
  console.log(`\n=== ${lang.toUpperCase()} ===`);
  console.log(`Missing (in EN but not in ${lang}): ${missingInLang.length}`);
  if (missingInLang.length > 0) missingInLang.slice(0, 20).forEach(k => console.log(`  - ${k}`));
  console.log(`Extra (in ${lang} but not in EN): ${extraInLang.length}`);
}

fs.writeFileSync('./i18n_audit.json', JSON.stringify(report, null, 2));
console.log('\nFull report saved to i18n_audit.json');
