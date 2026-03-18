import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'fs';

export const livePlayerVue3Plugin = (options: { 
  assetBaseUrl?: string 
} = {}): Plugin => {
  return {
    name: 'liveplayer-vue3:runtime-inject',
    enforce: 'pre',
    
    transformIndexHtml(html) {
      const cdnBase = 'https://cdn.jsdelivr.net/npm/@liveqing/liveplayer-v3@3.7.40/dist/component';
      const scriptUrl = options.assetBaseUrl 
        ? `${options.assetBaseUrl}/liveplayer-lib.min.js`
        : `${cdnBase}/liveplayer-lib.min.js`;
      
      return html.replace(
        '</head>',
        `  <script src="${scriptUrl}" async></script>
</head>`
      );
    },
    
    closeBundle() {
      const srcFile = resolve(process.cwd(), 'node_modules/@liveqing/liveplayer-v3/dist/component/liveplayer-lib.min.js');
      const destDir = resolve(process.cwd(), '.vitepress/dist/assets/liveplayer');
      const destFile = resolve(destDir, 'liveplayer-lib.min.js');
      
      if (existsSync(srcFile)) {
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(srcFile, destFile);
        console.log('[liveplayer-vue3] Copied liveplayer-lib.min.js to .vitepress/dist/assets/liveplayer/');
      }
    },
  };
};
