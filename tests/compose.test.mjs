import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { parseHTML, DOMParser } from 'linkedom';

// LinkeDOM supplies the DOM; this adapter supplies only selection and insertHTML.
// It exercises the real compose entry points, but does not model native undo or layout.
function setup(existing = '') {
  const { document } = parseHTML(
    `<!doctype html><html><body><div id="draft">**Ciao**</div>${existing}</body></html>`,
  );
  class SelectionRange {
    constructor(node) {
      this.selectNodeContents(node);
      this.collapsed = false;
    }
    get commonAncestorContainer() {
      return this.node;
    }
    get startContainer() {
      return this.node;
    }
    cloneRange() {
      return this;
    }
    selectNodeContents(node) {
      this.node = node;
      this.wholeNode = false;
    }
    selectNode(node) {
      this.node = node;
      this.wholeNode = true;
    }
    collapse() {
      this.collapsed = true;
    }
    intersectsNode(node) {
      return this.node.contains(node) || node.contains(this.node);
    }
    cloneContents() {
      const fragment = document.createDocumentFragment();
      for (const child of this.node.childNodes) fragment.append(child.cloneNode(true));
      return fragment;
    }
  }
  let current = new SelectionRange(document.getElementById('draft'));
  const selection = {
    rangeCount: 1,
    getRangeAt: () => current,
    removeAllRanges() {},
    addRange(range) {
      current = range;
    },
  };
  document.createRange = () => new SelectionRange(document.body);
  document.body.focus = () => {};
  document.execCommand = (command, _showUi, html) => {
    assert.equal(command, 'insertHTML');
    const content = document.createElement('div');
    content.innerHTML = html;
    if (current.wholeNode) current.node.replaceWith(...content.childNodes);
    else current.node.replaceChildren(...content.childNodes);
    return true;
  };
  const context = vm.createContext({
    document,
    DOMParser,
    URL,
    window: { getSelection: () => selection },
  });
  // Deliberately omit crypto entirely, as the command must not depend on Web Crypto.
  for (const file of ['vendor/marked.js', 'renderer.js', 'compose.js']) {
    vm.runInContext(readFileSync(`extension/${file}`, 'utf8'), context);
  }
  return {
    document,
    api: context.MarkdownDiretto,
    selectDraft() {
      current = new SelectionRange(document.getElementById('draft'));
    },
  };
}

test('convert and restore without crypto or randomUUID', () => {
  const { document, api } = setup();
  const original = document.body.innerHTML;
  const result = api.render();
  assert.equal(result.ok, true, result.error);
  assert.equal(document.querySelector('strong').textContent, 'Ciao');
  const restored = api.restore();
  assert.equal(restored.ok, true, restored.error);
  assert.equal(document.body.innerHTML, original);
});

test('new IDs do not reuse markers already present in a reopened draft', () => {
  const { document, api } = setup('<div data-markdown-diretto="md-1">Preesistente</div>');
  const result = api.render();
  assert.equal(result.ok, true, result.error);
  const blocks = [...document.querySelectorAll('[data-markdown-diretto]')];
  assert.equal(new Set(blocks.map((node) => node.getAttribute('data-markdown-diretto'))).size, 2);
  assert.equal(
    document.querySelector('[data-markdown-diretto="md-1"]').textContent,
    'Preesistente',
  );
  assert.equal(api.restore().ok, true);
});

test('convert-restore-convert uses distinct snapshot IDs', () => {
  const { document, api, selectDraft } = setup();
  assert.equal(api.render().ok, true);
  const firstId = document
    .querySelector('[data-markdown-diretto]')
    .getAttribute('data-markdown-diretto');
  assert.equal(api.restore().ok, true);
  selectDraft();
  assert.equal(api.render().ok, true);
  const secondId = document
    .querySelector('[data-markdown-diretto]')
    .getAttribute('data-markdown-diretto');
  assert.notEqual(secondId, firstId);
  assert.equal(api.restore().ok, true);
});
