<script setup lang="ts">
import { computed, ref } from 'vue';

import { LivePlayer } from '@/index';
import type { LivePlayerPublicInstance, LivePlayerStatus } from '@/types';

import StatusBadge from '../components/StatusBadge.vue';

const liveSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const vodSource = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const flvHint = 'ws://localhost:8080/live.flv';

const source = ref(vodSource);
const mode = ref<'live' | 'vod'>('vod');
const fit = ref<'contain' | 'fill'>('contain');
const muted = ref(true);
const autoplay = ref(true);
const status = ref<LivePlayerStatus>('idle');
const logs = ref<string[]>([]);
const playerRef = ref<LivePlayerPublicInstance | null>(null);

const baseAssetUrl = computed(() => `${import.meta.env.BASE_URL}assets/liveplayer`);
const sourceLabel = computed(() => (mode.value === 'live' ? 'Live HLS source' : 'MP4 replay source'));

const pushLog = (message: string) => {
  logs.value = [message, ...logs.value].slice(0, 10);
};

const usePreset = (preset: 'vod' | 'live' | 'flv') => {
  if (preset === 'live') {
    source.value = liveSource;
    mode.value = 'live';
    pushLog('Switched to the HLS live preset.');
    return;
  }

  if (preset === 'flv') {
    source.value = flvHint;
    mode.value = 'live';
    pushLog('Switched to the WS-FLV placeholder preset.');
    return;
  }

  source.value = vodSource;
  mode.value = 'vod';
  pushLog('Switched to the MP4 replay preset.');
};

const callApi = (action: string) => {
  if (!playerRef.value) {
    pushLog(`Skipped ${action}: player is not ready yet.`);
    return;
  }

  switch (action) {
    case 'play':
      playerRef.value.play();
      break;
    case 'pause':
      playerRef.value.pause();
      break;
    case 'snapshot':
      playerRef.value.snapshot();
      break;
    case 'fullscreen':
      playerRef.value.toggleFullscreen();
      break;
  }

  pushLog(`Called ${action}() from the public instance.`);
};
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <article class="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/50 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl md:p-6">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge :label="status" tone="sky" />
        <StatusBadge :label="mode" tone="amber" />
        <StatusBadge :label="fit" tone="emerald" />
      </div>
      <LivePlayer
        ref="playerRef"
        :src="source"
        :mode="mode"
        :fit="fit"
        :muted="muted"
        :autoplay="autoplay"
        :controls="true"
        :asset-base-url="baseAssetUrl"
        title="Demo stream"
        @ready="pushLog('Player emitted ready.')"
        @status-change="status = $event"
        @error="pushLog(`Player error: ${$event.message}`)"
        @play="pushLog(`Play event at ${$event.toFixed?.(2) ?? $event}s`)"
        @pause="pushLog(`Pause event at ${$event.toFixed?.(2) ?? $event}s`)"
        @ended="pushLog('Playback ended.')"
      >
        <template #overlay="{ status: overlayStatus }">
          <div class="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {{ overlayStatus }}
          </div>
        </template>
      </LivePlayer>
    </article>

    <aside class="grid gap-4">
      <div class="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <h2 class="text-xl font-semibold text-white">Interactive controls</h2>
        <p class="mt-2 text-sm leading-7 text-slate-300">
          The playground uses the same public API that the npm package exports. Swap between replay and live presets, then call the exposed player methods.
        </p>
        <div class="mt-5 grid gap-3">
          <label class="text-xs uppercase tracking-[0.26em] text-slate-400">{{ sourceLabel }}</label>
          <input v-model="source" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0" />
          <div class="grid grid-cols-3 gap-3">
            <button class="rounded-2xl bg-amber-300/90 px-4 py-3 text-sm font-semibold text-slate-950" @click="usePreset('vod')">MP4</button>
            <button class="rounded-2xl bg-sky-300/90 px-4 py-3 text-sm font-semibold text-slate-950" @click="usePreset('live')">HLS</button>
            <button class="rounded-2xl bg-rose-300/90 px-4 py-3 text-sm font-semibold text-slate-950" @click="usePreset('flv')">WS-FLV</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="mode = mode === 'live' ? 'vod' : 'live'">Toggle mode</button>
            <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="fit = fit === 'contain' ? 'fill' : 'contain'">Toggle fit</button>
            <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="muted = !muted">Toggle muted</button>
            <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="autoplay = !autoplay">Toggle autoplay</button>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <h2 class="text-xl font-semibold text-white">Public instance</h2>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="callApi('play')">play()</button>
          <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="callApi('pause')">pause()</button>
          <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="callApi('snapshot')">snapshot()</button>
          <button class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" @click="callApi('fullscreen')">toggleFullscreen()</button>
        </div>
      </div>

      <div class="rounded-[28px] border border-white/10 bg-slate-950/65 p-5 backdrop-blur-xl">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-white">Event log</h2>
          <StatusBadge label="latest 10" tone="rose" />
        </div>
        <ul class="mt-4 grid gap-2 text-sm text-slate-300">
          <li v-for="(log, index) in logs" :key="`${log}-${index}`" class="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
            {{ log }}
          </li>
        </ul>
      </div>
    </aside>
  </section>
</template>