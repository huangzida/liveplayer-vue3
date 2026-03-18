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

const clearLogs = () => {
  logs.value = [];
};
</script>

<template>
  <section class="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
    <article class="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_30px_80px_rgba(15,23,42,0.45)] md:p-6">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge :label="status" tone="sky" />
        <StatusBadge :label="mode" tone="amber" />
        <StatusBadge :label="fit" tone="emerald" />
      </div>

      <div class="rounded-[24px] border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-900/70">
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
            <div class="pointer-events-none absolute right-4 top-4 rounded-full border border-slate-300/60 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-black/35 dark:text-white/80">
              {{ overlayStatus }}
            </div>
          </template>
        </LivePlayer>
      </div>

      <div class="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/65">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Quick controls</h2>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Public instance</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="callApi('play')">play()</button>
          <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="callApi('pause')">pause()</button>
          <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="callApi('snapshot')">snapshot()</button>
          <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="callApi('fullscreen')">toggleFullscreen()</button>
        </div>
      </div>
    </article>

    <aside class="grid gap-4">
      <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.1)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Interactive controls</h2>
        <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Switch between replay and live presets, tweak mode and fit, then verify status and behavior from the event stream.
        </p>
        <div class="mt-5 grid gap-3">
          <label class="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-300">{{ sourceLabel }}</label>
          <input v-model="source" class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-white" />
          <div class="grid grid-cols-3 gap-3">
            <button class="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200" @click="usePreset('vod')">MP4</button>
            <button class="rounded-2xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-200" @click="usePreset('live')">HLS</button>
            <button class="rounded-2xl bg-rose-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-rose-200" @click="usePreset('flv')">WS-FLV</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="mode = mode === 'live' ? 'vod' : 'live'">Toggle mode</button>
            <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="fit = fit === 'contain' ? 'fill' : 'contain'">Toggle fit</button>
            <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="muted = !muted">Toggle muted</button>
            <button class="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="autoplay = !autoplay">Toggle autoplay</button>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Event log</h2>
          <div class="flex items-center gap-2">
            <StatusBadge label="latest 10" tone="rose" />
            <button class="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800" @click="clearLogs">Clear</button>
          </div>
        </div>
        <ul class="mt-4 grid max-h-64 gap-2 overflow-auto pr-1 text-sm text-slate-700 dark:text-slate-300">
          <li v-for="(log, index) in logs" :key="`${log}-${index}`" class="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {{ log }}
          </li>
        </ul>
      </div>
    </aside>
  </section>
</template>