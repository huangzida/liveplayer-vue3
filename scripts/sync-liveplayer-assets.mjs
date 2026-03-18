import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourceDir = resolve(root, 'node_modules/@liveqing/liveplayer-v3/dist/component');
const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error('sync-liveplayer-assets requires at least one target directory.');
  process.exit(1);
}

for (const target of targets) {
  const destination = resolve(root, target, 'assets/liveplayer');
  await mkdir(destination, { recursive: true });
  await cp(sourceDir, destination, { recursive: true, force: true });
  console.log(`Synced LivePlayer assets -> ${destination}`);
}