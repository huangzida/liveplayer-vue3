const SCRIPT_FLAG = 'data-liveplayer-vue3-runtime';

const getBaseUrl = (): string => {
  if (typeof document === 'undefined') {
    return '';
  }

  const getPathFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/\/[^/]*$/, '');
    } catch {
      return '';
    }
  };

  const currentScript = document.currentScript as HTMLScriptElement | null;
  if (currentScript?.src && (
    currentScript.src.includes('liveplayer-vue3') ||
    currentScript.dataset[SCRIPT_FLAG]
  )) {
    return getPathFromUrl(currentScript.src);
  }

  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script'));
  
  const liveplayerScripts = scripts.filter(s => 
    s.dataset[SCRIPT_FLAG] ||
    (s.src && s.src.includes('liveplayer-vue3'))
  );
  
  if (liveplayerScripts.length > 0) {
    return getPathFromUrl(liveplayerScripts[0].src);
  }

  const indexScripts = scripts.filter(s => 
    s.src && 
    (s.src.includes('/index.js') || s.src.includes('/index.mjs')) &&
    !s.src.includes('node_modules')
  );
  
  if (indexScripts.length > 0) {
    return getPathFromUrl(indexScripts[0].src);
  }

  return '';
};

export const ensureLivePlayerRuntime = async (): Promise<void> => {
  if (typeof document === 'undefined' || import.meta.env.MODE === 'test') {
    return;
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_FLAG}]`);
  if (existing?.dataset.loaded === 'true') {
    return;
  }

  const baseUrl = getBaseUrl();
  const scriptUrl = baseUrl
    ? `${baseUrl}/assets/liveplayer/liveplayer-lib.min.js`
    : './assets/liveplayer/liveplayer-lib.min.js';

  if (import.meta.env.DEV) {
    console.log('[LivePlayer Vue3] Auto-loading runtime from:', scriptUrl);
  }

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load LivePlayer runtime`)), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute(SCRIPT_FLAG, 'true');
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      if (import.meta.env.DEV) {
        console.log('[LivePlayer Vue3] Runtime loaded successfully');
      }
      resolve();
    }, { once: true });
    script.addEventListener('error', (event) => {
      const error = event as ErrorEvent;
      if (import.meta.env.DEV) {
        console.error('[LivePlayer Vue3] Failed to load runtime:', error);
      }
      reject(new Error(`Failed to load LivePlayer runtime from ${scriptUrl}`));
    }, { once: true });
    document.head.append(script);
  });
};
