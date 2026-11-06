(() => {
  const t = globalThis.toolkitText;
  document.documentElement.lang = chrome.i18n?.getUILanguage() || 'en';
  document.title = t('extensionName');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelector('.updates')?.setAttribute('aria-label', t('updates'));
  const ids = ['copyTask', 'copyPr', 'projects'];
  const status = document.getElementById('status');
  const updateButton = document.getElementById('check-update');
  if (updateButton && chrome.runtime) {
    document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
    updateButton.addEventListener('click', async () => {
      const message = document.getElementById('update-status');
      updateButton.disabled = true;
      message.textContent = t('checking');
      try {
        const result = await chrome.runtime.requestUpdateCheck();
        if (result.status === 'update_available') {
          message.textContent = t('available') + (result.version ? ` (${result.version})` : '');
        } else if (result.status === 'throttled') {
          message.textContent = t('throttled');
        } else {
          message.textContent = t('noUpdate');
        }
      } catch {
        message.textContent = t('updateError');
      } finally {
        updateButton.disabled = false;
      }
    });
  }
  async function init() {
    try {
      const { modules = {} } = await chrome.storage.local.get('modules');
      for (const id of ids) {
        const input = document.getElementById(id);
        input.checked = modules[id] !== false;
        input.disabled = false;
        input.addEventListener('change', async () => {
          ids.forEach((key) => { document.getElementById(key).disabled = true; });
          try {
            await chrome.storage.local.set({ modules: Object.fromEntries(
              ids.map((key) => [key, document.getElementById(key).checked]),
            ) });
            status.textContent = t('saved');
          } catch {
            input.checked = !input.checked;
            status.textContent = t('saveError');
          } finally {
            ids.forEach((key) => { document.getElementById(key).disabled = false; });
          }
        });
      }
      status.textContent = t('choose');
    } catch {
      status.textContent = t('loadError');
    }
  }
  init();
})();
