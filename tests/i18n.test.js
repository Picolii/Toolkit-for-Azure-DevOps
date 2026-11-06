const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const english = require('../_locales/en/messages.json');
const source = fs.readFileSync(path.join(root, 'I18n.js'), 'utf8');
const manifest = require('../manifest.json');
assert.equal(manifest.default_locale, 'en');
assert.equal(manifest.content_scripts[0].js[0], 'I18n.js');
for (const locale of fs.readdirSync(path.join(root, '_locales'))) {
  const messages = JSON.parse(fs.readFileSync(path.join(root, '_locales', locale, 'messages.json'), 'utf8'));
  assert.deepEqual(Object.keys(messages).sort(), Object.keys(english).sort());
  for (const [key, entry] of Object.entries(messages)) {
    assert.ok(entry.message.trim(), `${locale}/${key} must not be empty`);
    assert.deepEqual(entry.message.match(/\$\d/g) || [], english[key].message.match(/\$\d/g) || [], `${locale}/${key}: placeholders`);
  }
  assert.ok(messages.description.message.length <= 132, `${locale}: description length`);
  const context = vm.createContext({ chrome: { i18n: { getMessage: (key, substitutions) => {
    return (messages[key]?.message || '').replace(/\$(\d)/g, (_, index) => substitutions[Number(index) - 1]);
  } } } });
  vm.runInContext(source, context);
  assert.equal(context.toolkitText('copy'), messages.copy.message);
  assert.ok(context.toolkitText('apiError', ['403']).includes('403'));
  context.toolkitSetLanguage('fr');
  assert.equal(context.toolkitText('copy'), require('../_locales/fr/messages.json').copy.message);
  context.toolkitSetLanguage('not-supported');
  assert.equal(context.toolkitLanguage(), 'auto');
  context.toolkitSetLanguage('fr');
  assert.equal(context.toolkitText('copy'), require('../_locales/fr/messages.json').copy.message);
  context.toolkitSetLanguage('not-supported');
  assert.equal(context.toolkitLanguage(), 'auto');
}
const fallback = vm.createContext({});
vm.runInContext(source, fallback);
assert.equal(fallback.toolkitText('copy'), 'Copy task');
assert.equal(fallback.toolkitText('apiError', ['404']), 'Azure API returned HTTP 404.');
console.log('PASS: all 10 locale catalogs, placeholders, description limits, load order and English fallback');
