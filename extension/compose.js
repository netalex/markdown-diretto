(() => {
  if (globalThis.MarkdownDiretto) return;
  const snapshots = new Map();
  const protectedSelector = '.moz-signature, blockquote[type="cite"], .moz-cite-prefix, .moz-forward-container';
  const marker = 'data-markdown-diretto';
  const elementOf = node => node?.nodeType === 1 ? node : node?.parentElement;
  function selectedRange() {
    const selection = window.getSelection();
    if (!selection.rangeCount) throw new Error('Posiziona il cursore nel corpo del messaggio.');
    const range = selection.getRangeAt(0).cloneRange();
    if (!document.body.contains(range.commonAncestorContainer)) throw new Error('Seleziona il testo nel corpo del messaggio.');
    return range;
  }
  function overlaps(range, selector) {
    return [...document.querySelectorAll(selector)].some(node => range.intersectsNode(node));
  }
  function sourceText(range) {
    const holder = document.createElement('div');
    holder.style.cssText = 'position:fixed;left:-100000px;top:0;white-space:pre-wrap';
    holder.append(range.cloneContents());
    document.body.append(holder);
    try { return holder.innerText.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' '); }
    finally { holder.remove(); }
  }
  function replace(range, html) {
    const selection = window.getSelection();
    document.body.focus();
    selection.removeAllRanges(); selection.addRange(range);
    if (!document.execCommand('insertHTML', false, html)) throw new Error('L’editor non ha accettato la modifica.');
  }
  function render() {
    let range = selectedRange();
    if (elementOf(range.startContainer)?.closest(`[${marker}]`)) throw new Error('Questo blocco è già formattato. Torna prima al Markdown.');
    if (range.collapsed) {
      if (document.querySelector(protectedSelector)) throw new Error('Seleziona il tuo testo escludendo firma e messaggi citati.');
      range.selectNodeContents(document.body);
    }
    if (overlaps(range, protectedSelector)) throw new Error('La selezione comprende una firma o un messaggio citato. Seleziona solo il tuo testo.');
    if (overlaps(range, `[${marker}]`)) throw new Error('La selezione comprende un blocco già formattato.');
    if (overlaps(range, 'img, table, pre')) throw new Error('La selezione contiene contenuti già formattati o immagini. Seleziona solo il Markdown.');
    const source = sourceText(range);
    if (!source.trim()) throw new Error('Scrivi prima del testo Markdown.');
    if (source.length > 200000) throw new Error('Seleziona un testo più breve (massimo 200.000 caratteri).');
    const original = document.createElement('div'); original.append(range.cloneContents());
    const id = crypto.randomUUID();
    const html = globalThis.MarkdownMailRenderer.render(source);
    replace(range, `<div ${marker}="${id}">${html}</div>`);
    const block = document.querySelector(`[${marker}="${id}"]`);
    if (!block) throw new Error('Il contenuto è stato inserito, ma l’editor ha rimosso il riferimento al sorgente. Usa Ctrl+Z per annullare.');
    snapshots.set(id, { original: original.innerHTML, rendered: block.innerHTML });
    const cursor = document.createRange(); cursor.selectNodeContents(block); cursor.collapse(true);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(cursor);
    return 'Markdown formattato. Controlla il risultato prima di inviare.';
  }
  function restore() {
    const range = selectedRange();
    const block = elementOf(range.startContainer)?.closest(`[${marker}]`);
    if (!block) throw new Error('Posiziona il cursore dentro il blocco formattato.');
    const snapshot = snapshots.get(block.getAttribute(marker));
    if (!snapshot) throw new Error('Il sorgente non è disponibile dopo la riapertura di una bozza o il riavvio dell’estensione.');
    if (block.innerHTML !== snapshot.rendered) throw new Error('Hai modificato il testo formattato: il ripristino cancellerebbe le modifiche. Annullale con Ctrl+Z oppure conserva il testo attuale.');
    const target = document.createRange(); target.selectNode(block);
    replace(target, snapshot.original);
    return 'Sorgente Markdown ripristinato.';
  }
  const safe = fn => () => { try { return {ok:true, message:fn()}; } catch (error) { return {ok:false, error:error.message}; } };
  globalThis.MarkdownDiretto = {render:safe(render), restore:safe(restore)};
})();
