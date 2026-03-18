import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'vitepress';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'liveplayer-vue3';
const isGithubPages = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY;
const basePath = isGithubPages ? `/${repoName}` : '';

export default defineConfig({
  title: 'liveplayer-vue3',
  description: 'A Vue 3 live streaming wrapper with typed controls, VitePress docs, and GitHub Pages support.',
  base: isGithubPages ? `/${repoName}/` : '/',
  cleanUrls: true,
  srcDir: '.',
  head: [
    ['script', { src: `${basePath}/assets/liveplayer/liveplayer-lib.min.js`, async: 'true' }],
  ],
  vite: {
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        '@playground': resolve(root, 'playground/src'),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API', link: '/api-reference' },
      { text: 'Examples', link: '/examples' },
      { text: 'FAQ', link: '/faq' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Installation', link: '/installation' },
          { text: 'Basic Usage', link: '/basic-usage' },
          { text: 'API Reference', link: '/api-reference' },
          { text: 'Examples', link: '/examples' },
          { text: 'FAQ', link: '/faq' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/huangzida/liveplayer-vue3' }],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright ? 2026 liveplayer-vue3',
    },
  },
});