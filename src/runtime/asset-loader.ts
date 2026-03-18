import type { LivePlayerAssetUrls } from '../types';

const SCRIPT_FLAG = 'data-liveplayer-vue3-runtime';

export const ensureRuntimeScript = async (assetUrls: LivePlayerAssetUrls): Promise<void> => {
  if (typeof document === 'undefined' || import.meta.env.MODE === 'test') {
    return;
  }

  if (import.meta.env.DEV) {
    console.log('[LivePlayer] Loading runtime script:', assetUrls.script);
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_FLAG}]`);
  if (existing?.dataset.loaded === 'true') {
    return;
  }

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${assetUrls.script}`)), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = assetUrls.script;
    script.async = true;
    script.setAttribute(SCRIPT_FLAG, 'true');
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      if (import.meta.env.DEV) {
        console.log('[LivePlayer] Runtime script loaded successfully');
      }
      resolve();
    }, { once: true });
    script.addEventListener('error', (event) => {
      const error = event as ErrorEvent;
      if (import.meta.env.DEV) {
        console.error('[LivePlayer] Failed to load runtime script:', assetUrls.script, error);
      }
      reject(new Error(`Failed to load ${assetUrls.script}`));
    }, { once: true });
    document.head.append(script);
  });
};