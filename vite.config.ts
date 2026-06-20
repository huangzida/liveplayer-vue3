import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'vite-plugin': 'src/vite-plugin.ts',
      },
      name: 'LivePlayerVue3',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@liveqing/liveplayer-v3', 'vite', 'node:fs', 'node:path'],
    },
  },
});