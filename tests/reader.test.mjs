import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { parseHTML, DOMParser } from 'linkedom';

function setup(html) {
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  const scrolling = [];
  const context = vm.createContext({
    document,
    DOMParser,
    URL,
    window: { scrollX: 0, scrollY: 120, scrollTo: (...args) => scrolling.push(args) },
  });
  for (const file of ['vendor/marked.js', 'renderer.js', 'reader.js']) {
    vm.runInContext(readFileSync(`extension/${file}`, 'utf8'), context);
  }
  return { document, api: context.MarkdownDirettoReader, context, scrolling };
}

test('plain-text received Markdown renders and restores the exact original nodes', () => {
  const { document, api, scrolling } = setup(
    '<div class="moz-text-plain"><pre># Ciao\n\nTesto **forte**\n\n- Uno\n- Due</pre></div>',
  );
  const original = document.body.firstChild;
  const before = document.body.innerHTML;
  const result = api.render();
  assert.equal(result.ok, true, result.error);
  assert.equal(document.querySelector('h1').textContent, 'Ciao');
  assert.equal(document.querySelector('strong').textContent, 'forte');
  assert.equal(document.querySelectorAll('li').length, 2);
  assert.equal(api.restore().ok, true);
  assert.equal(document.body.firstChild, original);
  assert.equal(document.body.innerHTML, before);
  assert.deepEqual(scrolling, [
    [0, 0],
    [0, 120],
  ]);
});

test('HTML line wrappers and BR preserve Markdown line structure', () => {
  const { document, api } = setup(
    '<div class="moz-text-html"><div>## Titolo</div><div><br></div><div>- Primo<br>- Secondo</div></div>',
  );
  assert.equal(api.render().ok, true);
  assert.equal(document.querySelector('h2').textContent, 'Titolo');
  assert.equal(document.querySelectorAll('li').length, 2);
});

test('incoming HTML syntax and remote Markdown images remain inert in the preview', () => {
  const { document, api } = setup(
    '<pre>&lt;img src=x onerror=alert(1)&gt;\n\n![pixel](https://example.com/pixel)\n\n[x](javascript:alert%281%29)</pre>',
  );
  assert.equal(api.render().ok, true);
  assert.equal(document.querySelectorAll('img,script,[onerror],a[href]').length, 0);
  assert.match(document.body.textContent, /immagine: pixel/);
});

test('repeated render and reinjection retain the original view', () => {
  const { document, api, context } = setup('<pre>**Ciao**</pre>');
  const original = document.body.firstChild;
  assert.equal(api.render().ok, true);
  vm.runInContext(readFileSync('extension/reader.js', 'utf8'), context);
  assert.equal(api.render().ok, true);
  assert.equal(document.querySelectorAll('[data-markdown-diretto-reader]').length, 1);
  assert.equal(api.restore().ok, true);
  assert.equal(document.body.firstChild, original);
  assert.equal(api.restore().ok, true);
});

test('changing message cannot restore the previous message into the new one', () => {
  const { document, api } = setup('<pre>**Primo**</pre>');
  assert.equal(api.render().ok, true);
  document.body.innerHTML = '<pre>**Secondo**</pre>';
  const second = document.body.firstChild;
  assert.equal(api.restore().ok, true);
  assert.equal(document.body.firstChild, second);
  assert.equal(api.render().ok, true);
  assert.equal(document.querySelector('strong').textContent, 'Secondo');
  assert.equal(api.restore().ok, true);
  assert.equal(document.body.firstChild, second);
});

test('empty and oversized messages are refused without modifying their DOM', () => {
  for (const html of ['', '<pre>' + 'x'.repeat(200001) + '</pre>']) {
    const { document, api } = setup(html);
    const before = document.body.innerHTML;
    assert.equal(api.render().ok, false);
    assert.equal(document.body.innerHTML, before);
  }
});

test('script, style and hidden contents are not treated as Markdown', () => {
  const { document, api } = setup(
    '<style>body { color: red }</style><script>bad()</script><div hidden>hidden</div><pre>**Visibile**</pre>',
  );
  assert.equal(api.render().ok, true);
  assert.equal(document.body.textContent.trim(), 'Visibile');
});
