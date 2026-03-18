import { ensureRuntimeScript } from './asset-loader';
import { resolveRuntimeAssetUrls } from './load-player';

const isTestEnvironment = () => {
  const testByImportMeta = import.meta.env.MODE === 'test' || import.meta.env.VITEST;
  const testByProcess = typeof process !== 'undefined' && !!(process.env.VITEST || process.env.NODE_ENV === 'test');
  const testByUserAgent = typeof navigator !== 'undefined' && /happy-dom|jsdom/i.test(navigator.userAgent);

  return testByImportMeta || testByProcess || testByUserAgent;
};

export const ensureLivePlayerRuntime = async (): Promise<void> => {
  if (
    typeof document === 'undefined' ||
    isTestEnvironment()
  ) {
    return;
  }

  const scriptUrl = resolveRuntimeAssetUrls().script;

  if (import.meta.env.DEV) {
    console.log('[LivePlayer Vue3] Auto-loading runtime from:', scriptUrl);
  }

  await ensureRuntimeScript({ script: scriptUrl });

  if (import.meta.env.DEV) {
    console.log('[LivePlayer Vue3] Runtime loaded successfully');
  }
};
