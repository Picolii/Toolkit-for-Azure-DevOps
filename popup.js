(() => {
  const t = globalThis.toolkitText;
  function translatePanel() {
    const language = globalThis.toolkitLanguage();
    document.documentElement.lang = language === 'auto'
      ? chrome.i18n?.getUILanguage() || 'en' : language.replace('_', '-');
    document.title = t('extensionName');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelector('.updates')?.setAttribute('aria-label', t('updates'));
  }
  translatePanel();
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
      await globalThis.toolkitLanguageReady;
      translatePanel();
      const languageSelect = document.getElementById('language');
      if (languageSelect) {
        languageSelect.value = globalThis.toolkitLanguage();
        languageSelect.disabled = false;
        languageSelect.addEventListener('change', async () => {
          const previous = globalThis.toolkitLanguage();
          const choice = languageSelect.value;
          languageSelect.disabled = true;
          try {
            await chrome.storage.local.set({ language: choice });
            globalThis.toolkitSetLanguage(choice);
            translatePanel();
            document.getElementById('update-status').textContent = '';
            status.textContent = t('saved');
          } catch {
            languageSelect.value = previous;
            status.textContent = t('saveError');
          } finally {
            languageSelect.disabled = false;
          }
        });
      }
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
