const fs = require('fs');
const path = require('path');

const skPath = path.join(__dirname, 'apps', 'web', 'messages', 'sk.json');
const enPath = path.join(__dirname, 'apps', 'web', 'messages', 'en.json');

const sk = JSON.parse(fs.readFileSync(skPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function collectKeys(obj, prefix = '') {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const k of collectKeys(value, fullKey)) keys.add(k);
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

const skKeys = collectKeys(sk);
const enKeys = collectKeys(en);

const onlyInSk = [...skKeys].filter(k => !enKeys.has(k)).sort();
const onlyInEn = [...enKeys].filter(k => !skKeys.has(k)).sort();

if (onlyInSk.length) {
  console.log('--- Keys in sk.json but MISSING from en.json ---');
  onlyInSk.forEach(k => console.log('  ' + k));
  console.log();
}

if (onlyInEn.length) {
  console.log('--- Keys in en.json but MISSING from sk.json ---');
  onlyInEn.forEach(k => console.log('  ' + k));
  console.log();
}

console.log(`sk.json keys: ${skKeys.size}`);
console.log(`en.json keys: ${enKeys.size}`);

if (onlyInSk.length === 0 && onlyInEn.length === 0) {
  console.log('\nKEY PARITY OK');
} else {
  console.log(`\n${onlyInSk.length + onlyInEn.length} mismatched key(s) found.`);
}
