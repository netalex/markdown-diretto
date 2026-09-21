import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { resolve } from 'node:path';
let browser;
before(async () => {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
});
after(async () => {
  await browser?.close();
});
async function setup(t, html) {
  const page = await browser.newPage();
  t.after(() => page.close());
  await page.goto('file://' + resolve('tests/fixture.html'));
  await page.evaluate((html) => {
    document.body.innerHTML = html;
    document.body.contentEditable = 'true';
  }, html);
  for (const file of ['vendor/marked.js', 'renderer.js', 'compose.js'])
    await page.addScriptTag({ path: resolve('extension', file) });
  await page.evaluate(() => {
    // Script elements belong to the test harness, not the composition body.
    document.querySelectorAll('script').forEach((node) => node.remove());
    const range = document.createRange();
    range.selectNodeContents(document.body);
    range.collapse(true);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  return page;
}
test('GFM: headings, nested lists, tables, code, tasks and Unicode', async (t) => {
  const page = await setup(t, '');
  const html = await page.evaluate(() =>
    MarkdownMailRenderer.render(
      '# Caffè ☕\n\n- uno\n  - due\n\n| A | B |\n| - | - |\n| à | € |\n\n```js\nconst a = "<tag>";\n```\n\n- [x] pronto',
    ),
  );
  assert.match(html, /<h1/);
  assert.match(html, /<table/);
  assert.match(html, /<pre/);
  assert.match(html, /☑/);
  assert.match(html, /&lt;tag&gt;/);
});
test('unsafe HTML, protocols and remote images never become active content', async (t) => {
  const page = await setup(t, '');
  const result = await page.evaluate(() => {
    const holder = document.createElement('div');
    holder.innerHTML = MarkdownMailRenderer.render(
      '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[x](javascript:alert%281%29) [d](data:text/html,boom) [ok](https://example.com)\n\n![tracking](https://example.com/pixel)',
    );
    return {
      bad: holder.querySelectorAll(
        'script,img,iframe,[onerror],a[href^="javascript:"],a[href^="data:"]',
      ).length,
      good: holder.querySelector('a[href="https://example.com/"]') !== null,
    };
  });
  assert.equal(result.bad, 0);
  assert.equal(result.good, true);
});
test('whole message conversion and exact original restoration', async (t) => {
  const page = await setup(t, '<div># Titolo</div><div><br></div><div>Testo **forte** e à.</div>');
  const original = await page.locator('body').innerHTML();
  const result = await page.evaluate(() => MarkdownDiretto.render());
  assert.equal(result.ok, true, result.error);
  assert.equal(await page.locator('h1').textContent(), 'Titolo');
  assert.equal(await page.locator('strong').textContent(), 'forte');
  const restored = await page.evaluate(() => MarkdownDiretto.restore());
  assert.equal(restored.ok, true, restored.error);
  assert.equal(await page.locator('body').innerHTML(), original);
});
test('signatures and quoted replies require selection and remain untouched', async (t) => {
  const page = await setup(
    t,
    '<div id="mine">**Ciao**</div><div class="moz-signature">Firma</div><blockquote type="cite">Originale</blockquote>',
  );
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, false);
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('mine'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  const result = await page.evaluate(() => MarkdownDiretto.render());
  assert.equal(result.ok, true, result.error);
  assert.equal(await page.locator('.moz-signature').innerHTML(), 'Firma');
  assert.equal(await page.locator('blockquote').innerHTML(), 'Originale');
});
test('selection crossing a signature is refused without mutation', async (t) => {
  const page = await setup(t, '**Ciao**<div class="moz-signature">Firma</div>');
  const original = await page.locator('body').innerHTML();
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.body);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, false);
  assert.equal(await page.locator('body').innerHTML(), original);
});
test('modified rendered content cannot be silently overwritten', async (t) => {
  const page = await setup(t, '**Ciao**');
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, true);
  await page.evaluate(() => document.querySelector('strong').append(' modificato'));
  const original = await page.locator('body').innerHTML();
  assert.equal((await page.evaluate(() => MarkdownDiretto.restore())).ok, false);
  assert.equal(await page.locator('body').innerHTML(), original);
});
test('native undo restores Markdown; second conversion is blocked', async (t) => {
  const page = await setup(t, '**Ciao**');
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, true);
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, false);
  await page.evaluate(() => document.execCommand('undo'));
  assert.equal(await page.locator('body').innerText(), '**Ciao**');
});
test('source is kept in memory, absent from generated message', async (t) => {
  const page = await setup(t, '**segreto**');
  assert.equal((await page.evaluate(() => MarkdownDiretto.render())).ok, true);
  assert.doesNotMatch(await page.locator('body').innerHTML(), /\*\*segreto\*\*/);
});
