import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'vitepress';
import { livePlayerVue3Plugin } from '../../scripts/vitepress-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'liveplayer-vue3';
const isGithubPages = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY;

export default defineConfig({
  title: 'liveplayer-vue3',
  description: 'A Vue 3 live streaming wrapper with typed controls, VitePress docs, and GitHub Pages support.',
  base: isGithubPages ? `/${repoName}/` : '/',
  cleanUrls: true,
  srcDir: '.',
  vite: {
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        '@playground': resolve(root, 'playground/src'),
      },
    },
    plugins: [
      livePlayerVue3Plugin({
        assetBaseUrl: isGithubPages ? `/${repoName}/assets/liveplayer` : '/assets/liveplayer'
      }),
    ],
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/your-github-username/liveplayer-vue3' }],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright ? 2026 liveplayer-vue3',
    },
  },
});