// Shared isolated-world settings. Standalone scripts keep their default behavior.
globalThis.azureToolsModulesReady = (async () => {
  try {
    const stored = await chrome.storage.local.get('modules');
    return stored.modules || {};
  } catch {
    return {};
  }
})();
