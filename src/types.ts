import type { App, CSSProperties, DefineComponent } from 'vue';

export type LivePlayerMode = 'live' | 'vod';
export type LivePlayerStatus = 'idle' | 'loading' | 'ready' | 'error' | 'ended';
export type LivePlayerFit = 'contain' | 'cover' | 'fill';

export interface LivePlayerRetryOptions {
  attempts?: number;
  delay?: number;
  backoffMultiplier?: number;
}

export interface LivePlayerAssetUrls {
  script: string;
}

export interface LivePlayerError {
  code: 'load_failed' | 'runtime_error';
  message: string;
  cause?: unknown;
}

export interface LivePlayerProps {
  src: string;
  title?: string;
  poster?: string;
  mode?: LivePlayerMode;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  fit?: LivePlayerFit;
  timeout?: number;
  playbackRates?: number[];
  playbackRate?: number;
  resolution?: string;
  assetBaseUrl?: string;
  retry?: LivePlayerRetryOptions;
  lowLatency?: boolean;
  debug?: boolean;
  class?: string;
  style?: CSSProperties;
}

export interface LivePlayerReadyPayload {
  api: LivePlayerPublicInstance;
  assets: LivePlayerAssetUrls;
}

export interface LivePlayerInnerInstance {
  play?: () => void;
  pause?: () => void;
  setCurrentTime?: (time: number) => void;
  snap?: () => void;
  setMuted?: (muted: boolean) => void;
  setVolume?: (volume: number) => void;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  toggleFullscreen?: () => void;
  getCurrentTime?: () => number;
  isFullscreen?: () => boolean;
  getVolume?: () => number;
  getMuted?: () => boolean;
  getDuration?: () => number;
}

export interface LivePlayerPublicInstance {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  snapshot: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  getInternalPlayer: () => LivePlayerInnerInstance | null;
}

export interface LoadedPlayerModule {
  component: DefineComponent<Record<string, unknown>, {}, any>;
  assetUrls: LivePlayerAssetUrls;
}

export type LivePlayerPlugin = {
  install: (app: App) => void;
};