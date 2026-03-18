import type { LoadedPlayerModule } from '../types';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveAssetBaseUrl = (assetBaseUrl?: string): string => {
  if (assetBaseUrl) {
    return trimTrailingSlash(assetBaseUrl);
  }

  /* @vite-ignore */
  const moduleUrl = new URL('.', import.meta.url);
  const baseUrl = trimTrailingSlash(moduleUrl.toString());
  return `${baseUrl}/assets/liveplayer`;
};

export const loadPlayerComponent = async (assetBaseUrl?: string): Promise<LoadedPlayerModule> => {
  const module = await import('@liveqing/liveplayer-v3');
  const baseUrl = resolveAssetBaseUrl(assetBaseUrl);
  const resolvedAssetUrls = {
    script: `${baseUrl}/liveplayer-lib.min.js`,
    swf: `${baseUrl}/liveplayer.swf`,
    crossdomain: `${baseUrl}/crossdomain.xml`,
  };

  return {
    component: module.default,
    assetUrls: resolvedAssetUrls,
  };
};