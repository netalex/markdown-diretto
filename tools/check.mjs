import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync('extension/manifest.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(manifest.version, pkg.version, 'Package and extension versions must match');
assert.deepEqual(
  manifest.permissions,
  ['compose', 'messagesModify'],
  'Review permission changes explicitly',
);
for (const action of ['compose_action', 'message_display_action']) {
  assert.ok(existsSync(join('extension', manifest[action].default_popup)));
}

function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checkDirectory(path);
    else if (/\.(?:m?js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
      if (result.status !== 0) process.exit(result.status || 1);
    }
  }
}
for (const directory of ['extension', 'tests', 'tools']) checkDirectory(directory);
console.log('JavaScript syntax, manifest entry point and versions checked.');
