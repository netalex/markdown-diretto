import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { DOMParser, parseHTML } from 'linkedom';
function render(source) {
  const { document } = parseHTML('<!doctype html><html><body></body></html>');
  const context = vm.createContext({ document, DOMParser, URL, console });
  for (const file of ['extension/vendor/marked.js', 'extension/renderer.js'])
    vm.runInContext(readFileSync(file, 'utf8'), context);
  const html = context.MarkdownMailRenderer.render(source);
  const result = document.createElement('div');
  result.innerHTML = html;
  return result;
}
test('headings, nested lists, emphasis and Unicode', () => {
  const dom = render('# Caffè ☕\n\n**forte** *corsivo* ~~barrato~~\n\n- uno\n  - due');
  assert.equal(dom.querySelector('h1').textContent, 'Caffè ☕');
  assert.equal(dom.querySelector('strong').textContent, 'forte');
  assert.equal(dom.querySelector('em').textContent, 'corsivo');
  assert.equal(dom.querySelector('del').textContent, 'barrato');
  assert.equal(dom.querySelector('ul ul li').textContent, 'due');
});
test('GFM tables, task markers, code escaping', () => {
  const dom = render(
    '| A | B |\n| - | - |\n| à | € |\n\n- [x] pronto\n- [ ] dopo\n\n```js\nconst x = "<tag>";\n```',
  );
  assert.equal(dom.querySelectorAll('td').length, 2);
  assert.match(dom.textContent, /☑ pronto/);
  assert.match(dom.textContent, /☐ dopo/);
  assert.equal(dom.querySelector('code').textContent, 'const x = "<tag>";\n');
  assert.equal(dom.querySelector('tag'), null);
});
test('raw HTML cannot introduce active elements or attributes', () => {
  const dom = render(
    '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n<svg onload=alert(1)>bad</svg>',
  );
  assert.equal(dom.querySelectorAll('script,img,svg,[onerror],[onload]').length, 0);
  assert.match(dom.textContent, /<script>/);
});
test('only approved absolute link protocols survive', () => {
  const dom = render(
    '[a](javascript:alert%281%29) [b](data:text/html,boom) [c](file:///tmp/x) [d](/relative) [e](https://example.com) [f](mailto:test@example.com)',
  );
  const hrefs = [...dom.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  assert.deepEqual(hrefs, ['https://example.com/', 'mailto:test@example.com']);
});
test('remote Markdown images become inert descriptions', () => {
  const dom = render('![Tracking](https://example.com/pixel.png)');
  assert.equal(dom.querySelector('img'), null);
  assert.match(dom.textContent, /\[immagine: Tracking\]/);
});
test('standard soft breaks and explicit hard breaks', () => {
  assert.equal(render('prima\nseconda').querySelectorAll('br').length, 0);
  assert.equal(render('prima  \nseconda').querySelectorAll('br').length, 1);
  assert.equal(render('prima\n\nseconda').querySelectorAll('p').length, 2);
});
