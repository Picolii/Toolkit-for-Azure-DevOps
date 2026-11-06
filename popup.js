(() => {
  const ids = ['copyTask', 'copyPr', 'projects'];
  const status = document.getElementById('status');
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
            status.textContent = 'Preferências salvas. Atualize a página do Azure.';
          } catch {
            input.checked = !input.checked;
            status.textContent = 'Não foi possível salvar. Tente novamente.';
          } finally {
            ids.forEach((key) => { document.getElementById(key).disabled = false; });
          }
        });
      }
      status.textContent = 'Escolha os módulos que deseja usar.';
    } catch {
      status.textContent = 'Não foi possível carregar as preferências.';
    }
  }
  init();
})();
