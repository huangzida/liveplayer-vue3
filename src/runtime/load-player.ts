import type { LivePlayerAssetUrls, LoadedPlayerModule } from '../types';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveAssetBaseUrlFromPublic = (): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return trimTrailingSlash(`${normalizedBase}assets/liveplayer`);
};

const resolveAssetBaseUrl = (assetBaseUrl?: string): string => {
  if (assetBaseUrl) {
    return trimTrailingSlash(assetBaseUrl);
  }

  return resolveAssetBaseUrlFromPublic();
};

export const resolveRuntimeAssetUrls = (assetBaseUrl?: string): LivePlayerAssetUrls => {
  const baseUrl = resolveAssetBaseUrl(assetBaseUrl);
  return {
    script: `${baseUrl}/liveplayer-lib.min.js`,
  };
};

export const loadPlayerComponent = async (assetBaseUrl?: string): Promise<LoadedPlayerModule> => {
  const module = await import('@liveqing/liveplayer-v3');
  const resolvedAssetUrls = resolveRuntimeAssetUrls(assetBaseUrl);

  return {
    component: module.default,
    assetUrls: resolvedAssetUrls,
  };
};