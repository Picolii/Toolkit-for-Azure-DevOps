(() => {
  const ids = ['copyTask', 'copyPr', 'projects'];
  const status = document.getElementById('status');
  const updateButton = document.getElementById('check-update');
  if (updateButton && chrome.runtime) {
    document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
    updateButton.addEventListener('click', async () => {
      const message = document.getElementById('update-status');
      updateButton.disabled = true;
      message.textContent = 'Consultando o serviço de atualizações do navegador…';
      try {
        const result = await chrome.runtime.requestUpdateCheck();
        if (result.status === 'update_available') {
          message.textContent = `Versão ${result.version || 'nova'} disponível. Feche este painel para o navegador concluir a atualização; depois atualize a página do Azure.`;
        } else if (result.status === 'throttled') {
          message.textContent = 'O navegador verificou recentemente. Tente mais tarde; a atualização automática continua ativa para a versão da loja.';
        } else {
          message.textContent = 'Nenhuma atualização disponibilizada pelo navegador. Versões novas precisam estar aprovadas na loja. Se instalou por pasta, siga as instruções abaixo.';
        }
      } catch {
        message.textContent = 'Verificação indisponível. Em edge://extensions, use Atualizar para a versão da loja ou Recarregar após substituir os arquivos da pasta local.';
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
