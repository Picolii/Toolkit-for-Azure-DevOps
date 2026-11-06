// Project labels only: never reorder, replace or intercept Azure's options.
(async () => {
  const modules = await (globalThis.azureToolsModulesReady || {});
  if (modules.projects === false) return;
  const CLASS = 'ado-related-project';
  const cache = new Map();
  let scheduled = false;
  let running = false;
  let rerun = false;

  function context(href) {
    const url = new URL(href);
    const parts = url.pathname.split('/').filter(Boolean);
    const modern = url.hostname === 'dev.azure.com';
    const offset = modern || parts[0]?.toLowerCase() === 'defaultcollection' ? 1 : 0;
    const project = parts[offset];
    return {
      api: `${url.origin}/${offset ? parts[0] + '/' : ''}_apis/wit/workitems`,
      project: project && !project.startsWith('_') ? decodeURIComponent(project) : '',
    };
  }

  function itemId(row) {
    const clone = row.cloneNode(true);
    clone.querySelectorAll(`.${CLASS}`).forEach((badge) => badge.remove());
    const text = clone.textContent || '';
    return text.match(/\b(\d+)\s*:/)?.[1] || null;
  }

  function rows() {
    const result = new Set();
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      const input = dialog.querySelector(
        'input[placeholder*="Search work items" i], input[placeholder*="Pesquisar itens" i], ' +
        'input[role="combobox"][aria-controls], input[role="combobox"][aria-owns]',
      );
      if (!input) continue;
      const heading = dialog.querySelector('h1, h2, [role="heading"], .bolt-dialog-title');
      if (!/add link|adicionar v[ií]nculo|adicionar link/i.test(heading?.textContent || '')) continue;
      const ids = `${input.getAttribute('aria-controls') || ''} ${input.getAttribute('aria-owns') || ''}`;
      const lists = [dialog, ...ids.split(/\s+/).filter(Boolean)
        .map((id) => document.getElementById(id)).filter(Boolean)];
      // Azure may render the popup in a portal outside its dialog.
      for (const list of document.querySelectorAll('[role="listbox"]')) {
        if (list.getClientRects().length) lists.push(list);
      }
      for (const list of lists) {
        for (const row of list.querySelectorAll('[role="option"], [role="row"]')) {
          if (itemId(row)) result.add(row);
        }
      }
    }
    return [...result];
  }

  function label(row, id, project, current) {
    if (!row.isConnected || itemId(row) !== id) return;
    let badge = row.querySelector(`.${CLASS}`);
    if (badge?.dataset.itemId !== id) {
      badge?.remove();
      badge = null;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = CLASS;
      badge.dataset.itemId = id;
      // Inline content adds no selectable/focusable controls or fixed row height.
      badge.style.cssText = 'display:inline-block;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;margin-inline-start:8px;padding:1px 6px;border:1px solid currentColor;border-radius:4px;font-size:11px;line-height:16px;pointer-events:none;';
      row.appendChild(badge);
    }
    const own = Boolean(current) && project.toLowerCase() === current.toLowerCase();
    const text = own ? `${project} · Projeto atual` : project;
    if (badge.textContent !== text) badge.textContent = text;
    badge.title = `Projeto: ${project}`;
    badge.style.color = own ? 'var(--communication-foreground, #0078d4)' : 'inherit';
  }

  async function scan() {
    if (running) { rerun = true; return; }
    running = true;
    const scopeHref = location.href;
    try {
      const scope = context(location.href);
      const candidates = rows().map((row) => ({ row, id: itemId(row) }));
      const missing = new Set();
      for (const { row, id } of candidates) {
        const badge = row.querySelector(`.${CLASS}`);
        if (badge && badge.dataset.itemId !== id) badge.remove();
        const entry = cache.get(`${scope.api}/${id}`);
        if (entry?.project) label(row, id, entry.project, scope.project);
        else if (!entry || entry.retryAt <= Date.now()) missing.add(id);
      }
      const ids = [...missing];
      for (let index = 0; index < ids.length; index += 200) {
        const batch = ids.slice(index, index + 200);
        const url = new URL(scope.api);
        url.searchParams.set('ids', batch.join(','));
        url.searchParams.set('fields', 'System.TeamProject');
        url.searchParams.set('errorPolicy', 'Omit');
        url.searchParams.set('api-version', '7.1');
        batch.forEach((id) => cache.set(`${scope.api}/${id}`, { retryAt: Date.now() + 60000 }));
        try {
          const response = await fetch(url, {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) continue;
          const data = await response.json();
          for (const item of data.value || []) {
            const project = item.fields?.['System.TeamProject'];
            if (typeof project === 'string' && batch.includes(String(item.id))) {
              if (cache.size >= 1000) cache.delete(cache.keys().next().value);
              cache.set(`${scope.api}/${item.id}`, { project });
            }
          }
        } catch {
          // Optional enrichment must never prevent Azure's native selection.
        }
      }
      if (location.href !== scopeHref) return;
      for (const { row, id } of candidates) {
        const project = cache.get(`${scope.api}/${id}`)?.project;
        if (project) label(row, id, project, scope.project);
      }
    } finally {
      running = false;
      if (rerun) { rerun = false; schedule(); }
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(() => {
      scheduled = false;
      scan();
    }, 150);
  }

  new MutationObserver((records) => {
    if (records.every((record) => record.target.nodeType === 1 &&
      record.target.closest(`.${CLASS}`))) return;
    schedule();
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('input', schedule, true);
  schedule();
})();
