const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
(async () => {
  for (const [file, key] of [['CopyTask.js', 'copyTask'], ['PR_WorkItem_CopyTask.js', 'copyPr'], ['RelatedWorkProjects.js', 'projects']]) {
    const context = vm.createContext({ azureToolsModulesReady: Promise.resolve({ [key]: false }) });
    await vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
    // No DOM supplied: a disabled module must exit before any DOM/API access.
  }
  const inputs = Object.fromEntries(['copyTask', 'copyPr', 'projects'].map((id) => [id, {
    addEventListener(event, callback) { this.change = callback; },
  }]));
  inputs.status = {};
  inputs.language = { value: 'auto', addEventListener(event, callback) { this.change = callback; } };
  inputs.language = { value: 'auto', addEventListener(event, callback) { this.change = callback; } };
  inputs.version = {};
  inputs['update-status'] = {};
  inputs['check-update'] = { addEventListener(event, callback) { this.click = callback; } };
  let saved;
  let updateResult = { status: 'no_update' };
  let updateFailure = false;
  const context = vm.createContext({
    document: { documentElement: {}, querySelectorAll: () => [], querySelector: () => null, getElementById: (id) => inputs[id] },
    chrome: { i18n: {
      getUILanguage: () => 'pt-BR',
      getMessage: (key) => require('../_locales/pt_BR/messages.json')[key]?.message || '',
    }, runtime: {
      getManifest: () => ({ version: '1.1.1' }),
      requestUpdateCheck: async () => {
        if (updateFailure) throw new Error('unavailable');
        return updateResult;
      },
    }, storage: { local: {
      get: async () => ({ modules: { copyPr: false } }),
      set: async (value) => { saved = value; },
    } } },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../I18n.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../popup.js'), 'utf8'), context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(inputs.copyTask.checked, true);
  assert.equal(inputs.copyPr.checked, false);
  inputs.projects.checked = false;
  await inputs.projects.change();
  assert.equal(saved.modules.projects, false);
  assert.equal(saved.modules.copyTask, true);
  assert.equal(saved.modules.copyPr, false);
  assert.equal(inputs.projects.disabled, false);
  assert.equal(inputs.version.textContent, 'v1.1.1');
  await inputs['check-update'].click();
  assert.match(inputs['update-status'].textContent, /Nenhuma atualização/);
  updateResult = { status: 'update_available', version: '1.1.2' };
  await inputs['check-update'].click();
  assert.match(inputs['update-status'].textContent, /1.1.2/);
  updateResult = { status: 'throttled' };
  await inputs['check-update'].click();
  assert.match(inputs['update-status'].textContent, /recentemente/);
  updateFailure = true;
  await inputs['check-update'].click();
  assert.match(inputs['update-status'].textContent, /indisponível/);
  assert.equal(inputs['check-update'].disabled, false);
  assert.equal(inputs.language.value, 'auto');
  inputs.language.value = 'fr';
  await inputs.language.change();
  assert.equal(saved.language, 'fr');
  assert.equal(context.toolkitLanguage(), 'fr');
  assert.equal(context.document.documentElement.lang, 'fr');
  assert.equal(inputs.status.textContent, require('../_locales/fr/messages.json').saved.message);
  inputs.language.value = 'auto';
  await inputs.language.change();
  assert.equal(context.toolkitLanguage(), 'auto');
  assert.equal(context.document.documentElement.lang, 'pt-BR');
  assert.equal(inputs.language.value, 'auto');
  inputs.language.value = 'fr';
  await inputs.language.change();
  assert.equal(saved.language, 'fr');
  assert.equal(context.toolkitLanguage(), 'fr');
  assert.equal(context.document.documentElement.lang, 'fr');
  assert.equal(inputs.status.textContent, require('../_locales/fr/messages.json').saved.message);
  inputs.language.value = 'auto';
  await inputs.language.change();
  assert.equal(context.toolkitLanguage(), 'auto');
  assert.equal(context.document.documentElement.lang, 'pt-BR');
  console.log('PASS: disabled modules do not touch DOM/API; popup loads and saves independent preferences');
})().catch((error) => { console.error(error); process.exitCode = 1; });
