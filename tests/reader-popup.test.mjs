import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function setup(type, fail = false) {
  const buttons = ['render', 'restore'].map((id) => ({
    id,
    disabled: false,
    addEventListener(_event, handler) {
      this.click = handler;
    },
  }));
  const status = { textContent: '' };
  const calls = [];
  const document = {
    getElementById: (id) => (id === 'status' ? status : buttons.find((button) => button.id === id)),
    querySelectorAll: () => buttons,
  };
  // Only tabs is exposed: any attempt to write via messages or compose fails the test.
  const messenger = {
    tabs: {
      query: async () => [{ id: 42, type }],
      executeScript: async (id, details) => {
        calls.push({ id, ...details });
        if (fail) throw new Error('Injection failed');
        return details.code ? [{ ok: true, message: 'OK' }] : [];
      },
    },
  };
  vm.runInNewContext(readFileSync('extension/reader-popup.js', 'utf8'), { document, messenger });
  return { buttons, status, calls };
}

for (const type of ['mail', 'messageDisplay']) {
  test(`reader popup targets the current ${type} tab without write APIs`, async () => {
    const { buttons, status, calls } = setup(type);
    await buttons[0].click();
    assert.deepEqual(calls.map((call) => call.file).filter(Boolean), [
      'vendor/marked.js',
      'renderer.js',
      'reader.js',
    ]);
    assert.ok(calls.every((call) => call.id === 42));
    assert.equal(calls.at(-1).code, 'globalThis.MarkdownDirettoReader.render()');
    assert.equal(status.textContent, 'OK');
    await buttons[1].click();
    assert.equal(calls.at(-1).code, 'globalThis.MarkdownDirettoReader.restore()');
    assert.ok(buttons.every((button) => !button.disabled));
  });
}

test('reader popup refuses the composer and reports injection failures', async () => {
  const composer = setup('messageCompose');
  await composer.buttons[0].click();
  assert.equal(composer.calls.length, 0);
  assert.match(composer.status.textContent, /Apri un singolo messaggio/);
  const failure = setup('mail', true);
  await failure.buttons[0].click();
  assert.equal(failure.status.textContent, 'Injection failed');
  assert.ok(failure.buttons.every((button) => !button.disabled));
});
