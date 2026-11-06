const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../RelatedWorkProjects.js'), 'utf8');
const badges = [];
const row = {
  isConnected: true,
  text: 'User Story 6094: Manutenções',
  cloneNode() { return { textContent: this.text, querySelectorAll: () => [] }; },
  querySelector: () => badges[0],
  appendChild(badge) { badges.push(badge); },
};
let calls = 0;
const input = { getAttribute: () => 'results' };
const dialog = {
  querySelector: (s) => s.startsWith('input') ? input : { textContent: 'Add link' },
  querySelectorAll: () => [row],
};
const document = {
  querySelectorAll: (s) => s === '[role="dialog"]' ? [dialog] : [],
  getElementById: () => null,
  addEventListener() {}, body: {},
  createElement: () => ({ dataset: {}, style: {}, remove() { badges.splice(badges.indexOf(this), 1); } }),
};
const sandbox = vm.createContext({
  chrome: { i18n: { getMessage: (key) => require('../_locales/pt_BR/messages.json')[key]?.message || '' } },
  document, URL, AbortSignal, Date, location: { href: 'https://dev.azure.com/org/Meu%20Projeto/_workitems/edit/1' },
  window: { setTimeout() {} }, MutationObserver: class { observe() {} },
  fetch: async (url, options) => {
    calls++;
    assert.equal(url.searchParams.get('fields'), 'System.TeamProject');
    assert.equal(url.searchParams.get('ids'), '6094');
    assert.equal(options.credentials, 'same-origin');
    return { ok: true, json: async () => ({ value: [{ id: 6094, fields: { 'System.TeamProject': 'Meu Projeto' } }] }) };
  },
});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../I18n.js'), 'utf8'), sandbox);
const ready = vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.api = { context, itemId, label, scan };})();'), sandbox);
(async () => {
  await ready;
  const { api } = sandbox;
  assert.equal(api.context(sandbox.location.href).project, 'Meu Projeto');
  assert.equal(api.context(sandbox.location.href).api, 'https://dev.azure.com/org/_apis/wit/workitems');
  assert.equal(api.context('https://org.visualstudio.com/DefaultCollection/Project/_workitems/edit/1').api,
    'https://org.visualstudio.com/DefaultCollection/_apis/wit/workitems');
  await api.scan();
  assert.equal(badges.length, 1);
  assert.equal(badges[0].textContent, '★ Meu Projeto');
  assert.equal(badges[0].title, 'Projeto: Meu Projeto · Projeto atual');
  assert.match(badges[0].style.cssText, /flex:0 0 auto/);
  assert.match(badges[0].style.cssText, /width:auto/);
  assert.match(badges[0].style.cssText, /min-width:0/);
  assert.match(badges[0].style.cssText, /max-width:min\(35%, 180px\)/);
  await api.scan();
  assert.equal(calls, 1, 'cache prevents repeated requests');
  assert.equal(badges.length, 1, 'repeated scans do not duplicate badges');
  row.text = 'Epic 42: Outro';
  api.label(row, '6094', 'Antigo', '');
  assert.equal(badges[0].textContent, '★ Meu Projeto', 'stale responses cannot label a recycled row');
  row.isConnected = false;
  api.label(row, '42', 'Outro', '');
  assert.equal(badges[0].dataset.itemId, '6094');
  console.log('PASS: organization URLs, batched fields, labels, cache, deduplication and stale rows');
})().catch((error) => { console.error(error); process.exitCode = 1; });
