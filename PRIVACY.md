# Privacy Policy — Toolkit for Azure DevOps

Last updated: November 6, 2026

Toolkit for Azure DevOps (previously Copy Task for Azure DevOps) helps users work with Azure DevOps work items by copying commit messages and identifying projects in related-work selections.

## Data accessed

To provide its user-facing features, the extension accesses only the Azure DevOps page currently open by the user. This may include the work item number, title, type, tags, relations, and current page URL.

When copying a work item linked to a pull request, the extension may request that item's details from the same Azure DevOps organization already open in the browser. Authentication remains managed by Azure DevOps. The extension does not read, collect, or store the user's password or authentication tokens.

## How data is used

Information is processed locally to copy commit messages after user action and display project labels in Add link. The picker requests only System.TeamProject for result IDs from the same organization's API. Names and IDs are cached only in bounded tab memory and discarded on reload.

The publisher does not receive, collect, store, sell, share, or use this information for advertising, analytics, profiling, or any purpose unrelated to the extension's stated functionality. No data is sent to publisher-controlled servers or unrelated third parties.

## Data storage and retention

The extension does not maintain a user account or a remote database. Work item information and generated commit messages are not persistently stored. Only module enable/disable and interface language preferences are saved in chrome.storage.local on the device and are not transmitted to the publisher.

## Permissions and site access

The extension runs only on Azure DevOps domains (`dev.azure.com` and `*.visualstudio.com`). This access is required to read the currently displayed work item information and insert the extension's copy controls into Azure DevOps pages.

## Changes to this policy

This policy will be updated if the extension's data practices or functionality change.

## Contact

For privacy questions or support, open an issue at:

https://github.com/Picolii/Toolkit-for-Azure-DevOps/issues

---

# Política de Privacidade — Toolkit for Azure DevOps

Última atualização: 6 de novembro de 2026

Toolkit for Azure DevOps (anteriormente Copy Task for Azure DevOps) auxilia o trabalho com work items: copia commits e identifica projetos na seleção de vínculos.

## Dados acessados

Para oferecer suas funcionalidades, a extensão acessa somente a página do Azure DevOps aberta pelo usuário. Isso pode incluir número, título, tipo, tags e relações do work item, além da URL da página atual.

Ao copiar um work item vinculado a um pull request, a extensão pode solicitar os detalhes do item à mesma organização do Azure DevOps já aberta no navegador. A autenticação continua sendo gerenciada pelo Azure DevOps. A extensão não lê, coleta ou armazena senhas ou tokens de autenticação do usuário.

## Como os dados são utilizados

As informações são processadas localmente para copiar commits após uma ação do usuário e exibir projetos em Add link. O seletor consulta somente System.TeamProject dos IDs dos resultados na API da própria organização. Nomes e IDs ficam em cache limitado na memória da aba e são descartados ao recarregar.

O desenvolvedor não recebe, coleta, armazena, vende, compartilha nem utiliza essas informações para publicidade, análise, criação de perfis ou qualquer finalidade que não esteja relacionada à funcionalidade declarada da extensão. Nenhum dado é enviado a servidores controlados pelo desenvolvedor ou a terceiros não relacionados.

## Armazenamento e retenção

A extensão não mantém contas de usuário nem banco de dados remoto. Informações dos work items e commits não são armazenadas de forma persistente. Somente preferências de ativação dos módulos e idioma da interface são salvas em chrome.storage.local no dispositivo, sem transmissão ao desenvolvedor.

## Permissões e acesso a sites

A extensão é executada somente nos domínios do Azure DevOps (`dev.azure.com` e `*.visualstudio.com`). Esse acesso é necessário para ler as informações do work item exibido e inserir os controles de cópia nas páginas do Azure DevOps.

## Alterações nesta política

Esta política será atualizada caso as práticas de dados ou as funcionalidades da extensão sejam alteradas.

## Contato

Para dúvidas sobre privacidade ou suporte, abra uma issue em:

https://github.com/Picolii/Toolkit-for-Azure-DevOps/issues
