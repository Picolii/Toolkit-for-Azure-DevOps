// Appended to the packaged catalog by build-locales.js.
(() => {
  const catalogs = globalThis.toolkitCatalogs;
  let selected = 'auto';
  globalThis.toolkitSetLanguage = (language) => {
    selected = Object.hasOwn(catalogs, language) ? language : 'auto';
  };
  globalThis.toolkitLanguage = () => selected;
  globalThis.toolkitText = (key, substitutions = []) => {
    const values = Array.isArray(substitutions) ? substitutions : [substitutions];
    if (selected === 'auto') {
      try {
        const native = globalThis.chrome?.i18n?.getMessage(key, substitutions);
        if (native) return native;
      } catch {}
    }
    return (catalogs[selected]?.[key] || catalogs.en[key] || key)
      .replace(/\$(\d)/g, (_, index) => String(values[Number(index) - 1] ?? ''));
  };
  globalThis.toolkitLanguageReady = (async () => {
    try {
      const stored = await chrome.storage.local.get('language');
      globalThis.toolkitSetLanguage(stored.language);
    } catch {}
  })();
})();
