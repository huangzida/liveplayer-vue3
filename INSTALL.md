# Usage Guide

## Basic Usage (Recommended)

The package now **automatically loads** the `liveplayer-lib.min.js` runtime when imported. No manual setup required!

```typescript
import { createApp } from 'vue';
import LivePlayer from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

const app = createApp(App);
app.component('LivePlayer', LivePlayer);
```

**Or in SFC:**

```vue
<script setup lang="ts">
import { LivePlayer } from 'liveplayer-vue3';
</script>

<template>
  <LivePlayer
    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    mode="live"
  />
</template>
```

## Global Plugin Installation

```typescript
import { createApp } from 'vue';
import LivePlayer, { install } from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

const app = createApp(App);
app.use(install);
```

## Manual Asset Loading (Advanced)

If you need to control where assets are hosted, you can provide a custom asset base URL:

```vue
<script setup lang="ts">
import { LivePlayer } from 'liveplayer-vue3';

const customAssetBaseUrl = 'https://cdn.example.com/liveplayer-assets';
</script>

<template>
  <LivePlayer
    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    mode="live"
    :asset-base-url="customAssetBaseUrl"
  />
</template>
```

## How It Works

1. **Automatic Detection**: When you import `liveplayer-vue3`, it automatically detects the script's location
2. **Smart Path Resolution**: Uses `document.currentScript` to determine the correct asset path
3. **Runtime Loading**: Dynamically loads `liveplayer-lib.min.js` before mounting components
4. **Error Handling**: Logs errors to console if loading fails

## Browser Requirements

- Modern browsers with ES Module support
- JavaScript enabled
- Internet connection (for initial load)

## Troubleshooting

### Runtime Not Loading?

If you see errors like "Failed to load LivePlayer runtime", check:

1. **Network Tab**: Ensure `liveplayer-lib.min.js` is being requested
2. **Console Errors**: Look for specific error messages
3. **Asset Path**: Verify assets are in `./assets/liveplayer/` relative to your script

### Custom Deployment?

If you deploy to a CDN or subdirectory, you may need to:

1. Copy the `assets/liveplayer/` folder to your deployment
2. Use the `assetBaseUrl` prop to point to the correct location

### Development vs Production

- **Development**: Logs asset loading paths to console
- **Production**: Silent loading, only logs errors

## CDN Usage

You can also use via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/liveplayer-vue3/dist/index.css">
</head>
<body>
  <div id="app">
    <live-player
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      mode="live"
    ></live-player>
  </div>

  <script type="module">
    import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
    import LivePlayer from 'https://unpkg.com/liveplayer-vue3/dist/index.js';

    const app = createApp({});
    app.component('live-player', LivePlayer);
    app.mount('#app');
  </script>
</body>
</html>
```

## API Reference

### Props

See [LivePlayer Props](https://github.com/your-github-username/liveplayer-vue3/blob/main/docs/props.md) for all available properties.

### Events

```vue
<LivePlayer
  src="..."
  @ready="onReady"
  @error="onError"
  @play="onPlay"
  @pause="onPause"
  @ended="onEnded"
  @timeupdate="onTimeUpdate"
  @volumechange="onVolumeChange"
/>

<script setup>
const onReady = (payload) => {
  console.log('Player ready!', payload);
  // payload.api - Public player API
  // payload.assets - Asset URLs
};

const onError = (error) => {
  console.error('Player error:', error);
};
</script>
```

### Methods

```vue
<script setup>
import { ref } from 'vue';
import { LivePlayer } from 'liveplayer-vue3';

const playerRef = ref(null);

const controls = {
  play: () => playerRef.value?.play(),
  pause: () => playerRef.value?.pause(),
  seek: (time) => playerRef.value?.seek(time),
  snapshot: () => playerRef.value?.snapshot(),
  toggleFullscreen: () => playerRef.value?.toggleFullscreen(),
};
</script>

<template>
  <LivePlayer ref="playerRef" src="..." />
  <button @click="controls.play">Play</button>
  <button @click="controls.pause">Pause</button>
</template>
```
