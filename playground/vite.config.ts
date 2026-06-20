import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

import { liveplayerVue3Plugin } from '../src/vite-plugin';

const playgroundRoot = fileURLToPath(new URL('./', import.meta.url));
const isGithubPages = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'liveplayer-vue3';

export default defineConfig({
  root: playgroundRoot,
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [vue(), liveplayerVue3Plugin()],
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@playground': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});