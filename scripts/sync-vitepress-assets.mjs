import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourceDir = resolve(root, 'node_modules/@liveqing/liveplayer-v3/dist/component');
const targetDir = resolve(root, '.vitepress/dist/assets/liveplayer');

async function syncVitepressAssets() {
  try {
    await mkdir(targetDir, { recursive: true });
    await cp(sourceDir, targetDir, { recursive: true, force: true });
    console.log(`[liveplayer-vue3] Synced LivePlayer assets -> ${targetDir}`);
  } catch (error) {
    console.error('[liveplayer-vue3] Failed to sync assets:', error);
    process.exit(1);
  }
}

syncVitepressAssets();
