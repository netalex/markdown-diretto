(() => {
  if (globalThis.MarkdownDirettoReader) return;
  let currentView = null;
  const blockTags = new Set([
    'DIV',
    'P',
    'PRE',
    'BLOCKQUOTE',
    'LI',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'TR',
  ]);
  const ignoredTags = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);

  function readText(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1 || ignoredTags.has(node.tagName) || node.hidden) return '';
    if (node.tagName === 'BR') return '\n';
    const text = [...node.childNodes].map(readText).join('');
    return blockTags.has(node.tagName) && !text.endsWith('\n') ? text + '\n' : text;
  }

  function activeView() {
    // A different message may reuse the display context. Never restore an old message into it.
    if (currentView && currentView.preview.parentNode !== document.body) currentView = null;
    return currentView;
  }

  function render() {
    if (activeView()) return 'Il messaggio è già visualizzato come Markdown formattato.';
    const sourceRoot =
      document.querySelector('.moz-text-plain, .moz-text-flowed, .moz-text-html') || document.body;
    const source = readText(sourceRoot)
      .replace(/\r\n?/g, '\n')
      .replace(/\u00a0/g, ' ');
    if (!source.trim()) throw new Error('Il messaggio non contiene testo da formattare.');
    if (source.length > 200000)
      throw new Error('Il messaggio è troppo lungo (massimo 200.000 caratteri).');
    const preview = document.createElement('div');
    preview.setAttribute('data-markdown-diretto-reader', '');
    preview.style.cssText =
      'font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;padding:16px;overflow-wrap:anywhere;white-space:normal';
    preview.innerHTML = globalThis.MarkdownMailRenderer.render(source);
    const original = document.createDocumentFragment();
    const scroll = { x: window.scrollX || 0, y: window.scrollY || 0 };
    // Keep original nodes intact rather than serializing and rebuilding a received email.
    while (document.body.firstChild) original.append(document.body.firstChild);
    document.body.append(preview);
    currentView = { original, preview, scroll };
    window.scrollTo?.(0, 0);
    return 'Vista Markdown attiva. Il messaggio salvato non è stato modificato.';
  }

  function restore() {
    const view = activeView();
    if (!view) return 'Il messaggio è già nella vista originale.';
    document.body.replaceChildren(view.original);
    currentView = null;
    window.scrollTo?.(view.scroll.x, view.scroll.y);
    return 'Vista originale ripristinata.';
  }

  const safe = (fn) => () => {
    try {
      return { ok: true, message: fn() };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };
  globalThis.MarkdownDirettoReader = { render: safe(render), restore: safe(restore) };
})();
