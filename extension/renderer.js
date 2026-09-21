/* global marked */
(() => {
  if (globalThis.MarkdownMailRenderer) return;
  const escape = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const parser = new marked.Marked({gfm:true, breaks:false, async:false});
  parser.use({renderer:{
    html({text}) { return escape(text); },
    image({text}) { return `[immagine: ${escape(text)}]`; }
  }});
  const styles = {
    p:'margin:0 0 12px;line-height:1.5',
    h1:'font-size:26px;margin:18px 0 12px', h2:'font-size:22px;margin:16px 0 10px',
    h3:'font-size:18px;margin:14px 0 8px',
    blockquote:'border-left:3px solid #b8c5d6;margin:12px 0;padding-left:12px;color:#526174',
    pre:'background:#f2f4f7;border:1px solid #d6dde5;padding:12px;white-space:pre-wrap;font-family:monospace',
    code:'font-family:monospace;background:#f2f4f7',
    table:'border-collapse:collapse;margin:12px 0',
    th:'border:1px solid #bac5d2;padding:6px 10px;background:#edf1f6;text-align:left',
    td:'border:1px solid #bac5d2;padding:6px 10px',
    a:'color:#175ca4;text-decoration:underline'
  };
  const allowed = new Set('p br hr h1 h2 h3 h4 h5 h6 strong em del s blockquote pre code ul ol li table thead tbody tr th td a'.split(' '));
  function render(source) {
    const parsed = new DOMParser().parseFromString('<!doctype html><html><body>' + parser.parse(source) + '</body></html>', 'text/html');
    const output = document.createElement('div');
    function copy(node, parent) {
      if (node.nodeType === 3) { parent.append(document.createTextNode(node.textContent)); return; }
      if (node.nodeType !== 1) return;
      const tag = node.localName;
      if (tag === 'input') { parent.append(document.createTextNode(node.hasAttribute('checked') ? '☑' : '☐')); return; }
      if (!allowed.has(tag)) { for (const child of node.childNodes) copy(child, parent); return; }
      const element = document.createElement(tag);
      if (styles[tag]) element.setAttribute('style', styles[tag]);
      if (tag === 'a') {
        try {
          const url = new URL(node.getAttribute('href'));
          if (['https:', 'http:', 'mailto:'].includes(url.protocol)) element.setAttribute('href', url.href);
        } catch { /* Relative links have no meaningful base in email. */ }
        if (node.hasAttribute('title')) element.setAttribute('title', node.getAttribute('title'));
      }
      if (tag === 'ol' && /^\d+$/.test(node.getAttribute('start') || '')) element.setAttribute('start', node.getAttribute('start'));
      if (['th','td'].includes(tag) && ['left','center','right'].includes(node.getAttribute('align'))) element.style.textAlign = node.getAttribute('align');
      for (const child of node.childNodes) copy(child, element);
      parent.append(element);
    }
    for (const child of parsed.body.childNodes) copy(child, output);
    return output.innerHTML;
  }
  globalThis.MarkdownMailRenderer = {render};
})();
