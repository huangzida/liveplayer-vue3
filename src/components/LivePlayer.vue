<script setup lang="ts">
import type {
  LivePlayerAssetUrls,
  LivePlayerError,
  LivePlayerInnerInstance,
  LivePlayerProps,
  LivePlayerPublicInstance,
  LivePlayerReadyPayload,
  LivePlayerStatus,
} from '../types';

import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';

import { ensureRuntimeScript } from '../runtime/asset-loader';
import { loadPlayerComponent } from '../runtime/load-player';

const props = withDefaults(defineProps<LivePlayerProps>(), {
  mode: 'vod',
  autoplay: true,
  controls: false,
  muted: false,
  loop: false,
  fit: 'contain',
  timeout: 10,
  playbackRates: () => [0.5, 1, 1.5, 2],
  playbackRate: 1,
  retry: () => ({
    attempts: 0,
    delay: 1000,
    backoffMultiplier: 1,
  }),
  lowLatency: false,
  debug: false,
  class: '',
  style: () => ({}),
});

const emit = defineEmits<{
  ready: [payload: LivePlayerReadyPayload];
  play: [currentTime: number];
  pause: [currentTime: number];
  ended: [];
  error: [error: LivePlayerError];
  message: [payload: { message: string; type: string }];
  timeupdate: [currentTime: number];
  volumechange: [volume: number, isMuted: boolean];
  'fullscreen-change': [isFullscreen: boolean];
  'status-change': [status: LivePlayerStatus];
}>();

const playerComponent = shallowRef();
const playerRef = ref<LivePlayerInnerInstance | null>(null);
const assetUrls = ref<LivePlayerAssetUrls | null>(null);
const status = ref<LivePlayerStatus>(props.src ? 'loading' : 'idle');
const renderKey = ref(0);

const wrappedProps = computed(() => ({
  autoplay: props.autoplay,
  controls: props.controls,
  live: props.mode === 'live',
  loop: props.loop,
  muted: props.muted,
  playbackRate: props.playbackRate,
  playbackRates: props.playbackRates,
  poster: props.poster,
  resolution: props.resolution,
  stretch: props.fit === 'fill',
  timeout: props.timeout,
  videoTitle: props.title,
  videoUrl: props.src,
}));

const setStatus = (nextStatus: LivePlayerStatus) => {
  status.value = nextStatus;
  emit('status-change', nextStatus);
};

const publicApi: LivePlayerPublicInstance = {
  play: () => playerRef.value?.play?.(),
  pause: () => playerRef.value?.pause?.(),
  seek: (time) => playerRef.value?.setCurrentTime?.(time),
  snapshot: () => playerRef.value?.snap?.(),
  setMuted: (muted) => playerRef.value?.setMuted?.(muted),
  setVolume: (volume) => playerRef.value?.setVolume?.(volume),
  enterFullscreen: () => playerRef.value?.requestFullscreen?.(),
  exitFullscreen: () => playerRef.value?.exitFullscreen?.(),
  toggleFullscreen: () => playerRef.value?.toggleFullscreen?.(),
  getInternalPlayer: () => playerRef.value,
};

const emitReady = () => {
  if (!assetUrls.value) {
    return;
  }

  setStatus('ready');
  emit('ready', {
    api: publicApi,
    assets: assetUrls.value,
  });
};

const emitLoadError = (cause: unknown, code: LivePlayerError['code'], message: string) => {
  const error: LivePlayerError = {
    code,
    message,
    cause,
  };

  setStatus('error');
  emit('error', error);
};

const initializePlayer = async () => {
  if (typeof window === 'undefined' || !props.src) {
    return;
  }

  setStatus('loading');

  try {
    const loaded = await loadPlayerComponent(props.assetBaseUrl);
    assetUrls.value = loaded.assetUrls;
    playerComponent.value = loaded.component;
    renderKey.value += 1;
    await nextTick();
    emitReady();

    void ensureRuntimeScript(loaded.assetUrls).catch((cause) => {
      emitLoadError(cause, 'load_failed', 'Failed to load LivePlayer runtime assets.');
    });
  } catch (cause) {
    emitLoadError(cause, 'load_failed', 'Failed to load LivePlayer runtime assets.');
  }
};

const handleError = (cause: unknown) => {
  emitLoadError(cause, 'runtime_error', 'The wrapped player reported an error.');
};

const handleEnded = () => {
  setStatus('ended');
  emit('ended');
};

const handleFullscreen = (isFullscreen: boolean) => {
  emit('fullscreen-change', isFullscreen);
};

const handleVolumeChange = (...payload: unknown[]) => {
  const [volume = 0, isMuted = false] = payload as [number?, boolean?];
  emit('volumechange', volume, isMuted);
};

onMounted(async () => {
  await initializePlayer();
});

watch(
  () => props.src,
  async (nextSrc, previousSrc) => {
    if (nextSrc === previousSrc) {
      return;
    }

    playerRef.value = null;
    if (!nextSrc) {
      setStatus('idle');
      return;
    }

    await initializePlayer();
  },
);

defineExpose<LivePlayerPublicInstance>(publicApi);
</script>

<template>
  <div
    class="liveplayer-vue3"
    :class="props.class"
    :style="props.style"
    :data-liveplayer-status="status"
  >
    <span class="liveplayer-vue3__status-probe" :data-liveplayer-status="status" />
    <span v-if="status === 'ready'" class="liveplayer-vue3__ready-probe" data-liveplayer-status="ready" />
    <slot v-if="!props.src" name="empty">
      <div class="liveplayer-vue3__empty">No source provided.</div>
    </slot>
    <template v-else>
      <div v-if="status === 'loading'" class="liveplayer-vue3__layer liveplayer-vue3__layer--loading">
        <slot name="loading">
          <div class="liveplayer-vue3__panel">Loading stream...</div>
        </slot>
      </div>
      <div v-if="status === 'error'" class="liveplayer-vue3__layer liveplayer-vue3__layer--error">
        <slot name="error">
          <div class="liveplayer-vue3__panel">Unable to load the player.</div>
        </slot>
      </div>
      <component
        :is="playerComponent"
        v-if="playerComponent"
        :key="renderKey"
        ref="playerRef"
        v-bind="wrappedProps"
        @play="emit('play', $event)"
        @pause="emit('pause', $event)"
        @ended="handleEnded"
        @error="handleError"
        @message="emit('message', $event)"
        @timeupdate="emit('timeupdate', $event)"
        @volumechange="handleVolumeChange"
        @fullscreen="handleFullscreen"
      />
      <div class="liveplayer-vue3__overlay">
        <slot name="overlay" :status="status" />
      </div>
    </template>
  </div>
</template>