import type { App } from 'vue';

import { ensureLivePlayerRuntime } from './runtime/auto-loader';
import LivePlayer from './components/LivePlayer.vue';

export * from './types';
export { LivePlayer };
export { default as default } from './components/LivePlayer.vue';

import './style.css';

export const install = async (app: App) => {
  await ensureLivePlayerRuntime();
  app.component('LivePlayer', LivePlayer);
};

if (typeof window !== 'undefined') {
  ensureLivePlayerRuntime().catch((err) => {
    console.error('[LivePlayer Vue3] Failed to auto-load LivePlayer runtime:', err);
  });
}