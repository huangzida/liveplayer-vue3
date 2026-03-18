import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';

import { LivePlayer } from '../../../src';
import FeatureShowcase from '../../../playground/src/demos/FeatureShowcase.vue';
import '../../../src/style.css';
import './custom.css';

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('FeatureShowcase', FeatureShowcase);
    app.component('LivePlayer', LivePlayer);
  },
};

export default theme;