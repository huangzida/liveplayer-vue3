import type { App } from 'vue';

import LivePlayer from './components/LivePlayer.vue';

export * from './types';
export { LivePlayer };
export { default as default } from './components/LivePlayer.vue';

import './style.css';

export const install = (app: App) => {
  app.component('LivePlayer', LivePlayer);
};