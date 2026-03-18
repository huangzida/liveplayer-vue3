import type { LivePlayerAssetUrls } from '../types';

const SCRIPT_FLAG = 'data-liveplayer-vue3-runtime';
const RUNTIME_PROMISES_KEY = '__liveplayer_vue3_runtime_loading_map__';

type RuntimeGlobal = typeof globalThis & {
  [RUNTIME_PROMISES_KEY]?: Map<string, Promise<void>>;
};

const isTestEnvironment = () => {
  const testByImportMeta = import.meta.env.MODE === 'test' || import.meta.env.VITEST;
  const testByProcess = typeof process !== 'undefined' && !!(process.env.VITEST || process.env.NODE_ENV === 'test');
  const testByUserAgent = typeof navigator !== 'undefined' && /happy-dom|jsdom/i.test(navigator.userAgent);

  return testByImportMeta || testByProcess || testByUserAgent;
};

const toAbsoluteUrl = (value: string) => new URL(value, document.baseURI).href;

const isRuntimeReady = () => typeof (window as Window & { videojs?: unknown }).videojs !== 'undefined';

const waitRuntimeReady = (scriptUrl: string) =>
  new Promise<void>((resolve, reject) => {
    if (isRuntimeReady()) {
      resolve();
      return;
    }

    const start = Date.now();
    const timeoutMs = 3000;

    const check = () => {
      if (isRuntimeReady()) {
        resolve();
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        reject(new Error(`Runtime loaded but videojs is not defined (${scriptUrl})`));
        return;
      }

      window.setTimeout(check, 16);
    };

    check();
  });

const isScriptReady = (script: HTMLScriptElement) => {
  const readyState = (script as HTMLScriptElement & { readyState?: string }).readyState;
  return script.dataset.loaded === 'true' || readyState === 'loaded' || readyState === 'complete';
};

const withRetryQuery = (url: string, attempt: number) => {
  if (attempt <= 1) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_lpv3_retry=${Date.now()}`;
};

const resolvePublicRuntimeScriptUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}assets/liveplayer/liveplayer-lib.min.js`;
};

const getScriptCandidates = (primaryScriptUrl: string) => {
  const fallbackUrl = resolvePublicRuntimeScriptUrl();
  if (toAbsoluteUrl(primaryScriptUrl) === toAbsoluteUrl(fallbackUrl)) {
    return [primaryScriptUrl];
  }

  return [primaryScriptUrl, fallbackUrl];
};

const getLoadingPromises = () => {
  const runtimeGlobal = globalThis as RuntimeGlobal;
  if (!runtimeGlobal[RUNTIME_PROMISES_KEY]) {
    runtimeGlobal[RUNTIME_PROMISES_KEY] = new Map();
  }

  return runtimeGlobal[RUNTIME_PROMISES_KEY];
};

const getExistingScriptByUrl = (absoluteUrl: string) =>
  Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).find(
    (script) => toAbsoluteUrl(script.src) === absoluteUrl,
  );

const waitScriptLoaded = (script: HTMLScriptElement, scriptUrl: string) =>
  new Promise<void>((resolve, reject) => {
    if (isScriptReady(script)) {
      resolve();
      return;
    }

    if (script.dataset.failed === 'true') {
      reject(new Error(`Failed to load ${scriptUrl}`));
      return;
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out while loading ${scriptUrl}`));
    }, 15000);

    const handleLoad = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error(`Failed to load ${scriptUrl}`));
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
  });

export const ensureRuntimeScript = async (assetUrls: LivePlayerAssetUrls): Promise<void> => {
  if (
    typeof document === 'undefined' ||
    isTestEnvironment()
  ) {
    return;
  }

  if (import.meta.env.DEV) {
    console.log('[LivePlayer] Loading runtime script:', assetUrls.script);
  }

  const desiredScriptUrl = toAbsoluteUrl(assetUrls.script);
  const existingScript = getExistingScriptByUrl(desiredScriptUrl);
  if (existingScript && isScriptReady(existingScript)) {
    try {
      await waitRuntimeReady(assetUrls.script);
      existingScript.dataset.loaded = 'true';
      if (!existingScript.hasAttribute(SCRIPT_FLAG)) {
        existingScript.setAttribute(SCRIPT_FLAG, 'true');
      }
      return;
    } catch {
      existingScript.dataset.failed = 'true';
      existingScript.remove();
    }
  }

  const loadingPromises = getLoadingPromises();
  const inFlight = loadingPromises.get(desiredScriptUrl);
  if (inFlight) {
    await inFlight;
    return;
  }

  const loadingPromise = (async () => {
    const matchingScript = getExistingScriptByUrl(desiredScriptUrl);
    if (matchingScript) {
      if (matchingScript.dataset.failed === 'true') {
        matchingScript.remove();
      }

      if (!matchingScript.hasAttribute(SCRIPT_FLAG)) {
        matchingScript.setAttribute(SCRIPT_FLAG, 'true');
      }

      if (matchingScript.isConnected && isScriptReady(matchingScript)) {
        try {
          await waitRuntimeReady(assetUrls.script);
          matchingScript.dataset.loaded = 'true';
          return;
        } catch {
          matchingScript.dataset.failed = 'true';
          matchingScript.remove();
        }
      }

      if (matchingScript.isConnected) {
        try {
          await waitScriptLoaded(matchingScript, assetUrls.script);
          await waitRuntimeReady(assetUrls.script);
          matchingScript.dataset.loaded = 'true';
          return;
        } catch {
          matchingScript.dataset.failed = 'true';
          matchingScript.remove();
        }
      }
    }

    let lastError: Error | null = null;

    const scriptCandidates = getScriptCandidates(assetUrls.script);

    for (const candidateScriptUrl of scriptCandidates) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const scriptUrlWithRetry = withRetryQuery(candidateScriptUrl, attempt);
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptUrlWithRetry;
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
              script.dataset.failed = 'true';
              script.remove();
              if (import.meta.env.DEV) {
                console.error('[LivePlayer] Failed to load runtime script:', candidateScriptUrl, error);
              }
              reject(new Error(`Failed to load ${candidateScriptUrl}`));
            }, { once: true });
            document.head.append(script);
          });

          await waitRuntimeReady(scriptUrlWithRetry);

          return;
        } catch (error) {
          lastError = error as Error;
        }
      }
    }

    throw lastError ?? new Error(`Failed to load ${assetUrls.script}`);
  })();

  loadingPromises.set(desiredScriptUrl, loadingPromise);
  try {
    await loadingPromise;
  } finally {
    loadingPromises.delete(desiredScriptUrl);
  }
};