# Getting Started

`liveplayer-vue3` is a Vue 3 wrapper around `@liveqing/liveplayer-v3` with a normalized API, typed instance methods, and a docs-plus-playground workflow.

## What this package focuses on

- Live and replay playback with a Vue-friendly prop surface.
- Typed imperative controls such as `play()`, `pause()`, and `toggleFullscreen()`.
- Status-aware UI with `idle`, `loading`, `ready`, `error`, and `ended` states.
- Reusable docs/demo setup for GitHub Pages and local iteration.

## Quick preview

```vue
<script setup lang="ts">
import { LivePlayer } from 'liveplayer-vue3';
</script>

<template>
  <LivePlayer
    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    mode="vod"
    :controls="true"
  />
</template>
```