# liveplayer-vue3

English | [中文](./README.zh-CN.md)

Vue 3 wrapper around `@liveqing/liveplayer-v3` with:

- typed props, events, and exposed instance methods
- automatic runtime asset loading
- VitePress docs and a local playground
- CI-based npm + GitHub Release workflow

## Install

```bash
pnpm add liveplayer-vue3 @liveqing/liveplayer-v3
```

Peer dependencies:

- `vue` `^3.5.0`
- `@liveqing/liveplayer-v3` `^3.7.37`

## Quick Start

### 1. Register the Vite plugin (recommended)

The Vite plugin automatically copies `liveplayer-lib.min.js` from `@liveqing/liveplayer-v3` to `public/assets/liveplayer/` (dev) and `dist/assets/liveplayer/` (build). No manual copy needed.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { liveplayerVue3Plugin } from 'liveplayer-vue3/vite-plugin';

export default defineConfig({
  plugins: [liveplayerVue3Plugin()],
});
```

### 2. Use the component

### Option 1: Register as plugin

```ts
import { createApp } from 'vue';
import App from './App.vue';
import LivePlayerVue3 from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

const app = createApp(App);
app.use(LivePlayerVue3);
app.mount('#app');
```

### Option 2: Import component directly

```vue
<script setup lang="ts">
import { LivePlayer } from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';
</script>

<template>
	<LivePlayer
		src="https://example.com/live.m3u8"
		mode="live"
		controls
		title="Demo Stream"
	/>
</template>
```

## Runtime Asset Loading

The wrapped player (`@liveqing/liveplayer-v3`) depends on a runtime script (`liveplayer-lib.min.js`) that provides `window.videojs`. There are two ways to make this script available:

### Option A: Vite plugin (recommended, zero config)

Use the `liveplayerVue3Plugin` — it handles copying automatically (see Quick Start above). The script will be available at `/assets/liveplayer/liveplayer-lib.min.js`, which is the default path. No `assetBaseUrl` needed.

### Option B: Manual copy + custom path

If you prefer not to use the Vite plugin, copy the file manually:

```bash
cp node_modules/@liveqing/liveplayer-v3/dist/component/liveplayer-lib.min.js public/assets/liveplayer/
```

Or point to a custom host/path via `assetBaseUrl`:

```vue
<LivePlayer
	src="https://example.com/live.m3u8"
	asset-base-url="https://cdn.example.com/liveplayer"
/>
```

The loader has dedupe, timeout, retry, and readiness checks (`window.videojs`).

## Component API

### Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | required | Stream URL |
| `title` | `string` | `undefined` | Video title |
| `poster` | `string` | `undefined` | Poster image |
| `mode` | `'live' \| 'vod'` | `'live'` | Player mode |
| `autoplay` | `boolean` | `true` | Auto-play behavior |
| `controls` | `boolean` | `false` | Native controls visibility |
| `muted` | `boolean` | `true` | Mute state |
| `loop` | `boolean` | `false` | Loop playback |
| `fit` | `'contain' \| 'cover' \| 'fill'` | `'fill'` | Layout fit |
| `timeout` | `number` | `10` | Player timeout |
| `playbackRates` | `number[]` | `[0.5, 1, 1.5, 2]` | Speed options |
| `playbackRate` | `number` | `1` | Initial speed |
| `resolution` | `string` | `undefined` | Resolution hint |
| `assetBaseUrl` | `string` | inferred from `BASE_URL` | Runtime asset host/path |
| `retry` | `{ attempts?: number; delay?: number; backoffMultiplier?: number }` | `{ attempts: 0, delay: 1000, backoffMultiplier: 1 }` | Reserved compatibility prop |
| `lowLatency` | `boolean` | `false` | Reserved compatibility prop |
| `debug` | `boolean` | `false` | Reserved compatibility prop |
| `class` | `string` | `''` | Wrapper class |
| `style` | `CSSProperties` | `{}` | Wrapper style |

### Events

| Event | Payload | Description |
| --- | --- | --- |
| `ready` | `{ api, assets }` | Runtime ready, exposes public API and asset URLs |
| `play` | `currentTime: number` | Playback started |
| `pause` | `currentTime: number` | Playback paused |
| `ended` | none | Playback ended |
| `error` | `{ code, message, cause }` | Load/runtime error |
| `message` | `{ message, type }` | Wrapped player message |
| `timeupdate` | `currentTime: number` | Progress update |
| `volumechange` | `volume: number, isMuted: boolean` | Volume or mute changed |
| `fullscreen-change` | `isFullscreen: boolean` | Fullscreen state changed |
| `status-change` | `'idle' \| 'loading' \| 'ready' \| 'error' \| 'ended'` | Wrapper lifecycle status |

### Exposed Methods

Use a template ref to call methods:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { LivePlayerPublicInstance } from 'liveplayer-vue3';

const playerRef = ref<LivePlayerPublicInstance | null>(null);

const jumpToTen = () => {
	playerRef.value?.seek(10);
};
</script>

<template>
	<LivePlayer ref="playerRef" src="https://example.com/video.mp4" />
	<button @click="jumpToTen">Seek 10s</button>
</template>
```

Available methods:

- `play()`
- `pause()`
- `seek(time: number)`
- `snapshot()`
- `setMuted(muted: boolean)`
- `setVolume(volume: number)`
- `enterFullscreen()`
- `exitFullscreen()`
- `toggleFullscreen()`
- `getInternalPlayer()`

### Slots

- `empty`: rendered when `src` is empty
- `loading`: loading layer content
- `error`: error layer content
- `overlay`: overlay content, receives `{ status }`

## Status and Error Model

Status flow:

- no `src`: `idle`
- loading runtime/component: `loading`
- ready to play: `ready`
- player end event: `ended`
- load/runtime failures: `error`

Error codes:

- `load_failed`: runtime assets or module load failed
- `runtime_error`: wrapped player emitted error

## SSR and Testing Notes

- SSR-safe import: runtime loading is gated for non-browser environments.
- test environments (`vitest`, `jsdom`, `happy-dom`) skip real script injection.

## Development

```bash
pnpm install
pnpm dev
pnpm dev:docs
```

## Build and Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:docs
pnpm publint
```

All-in-one verification:

```bash
pnpm verify
```

## Release Automation

GitHub Actions:

- `Prepare Release` workflow uses `bumpp` + `changelogithub`
- manual input: `patch`, `minor`, or `major`
- runs `pnpm verify`, bumps version, updates `CHANGELOG.md`, creates commit/tag, and pushes
- tag push triggers `.github/workflows/release.yml` for npm publish + GitHub Release

Local command:

```bash
pnpm release
```

## Docs and Playground

- docs site: `pnpm dev:docs`
- playground: `pnpm dev`

Useful files:

- `docs/.vitepress/config.ts`
- `playground/src/demos/FeatureShowcase.vue`
- `.github/workflows/release-prepare.yml`
- `.github/workflows/release.yml`