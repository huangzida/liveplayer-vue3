# Basic Usage

```vue
<script setup lang="ts">
import { LivePlayer } from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';
</script>

<template>
  <LivePlayer
    src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    mode="live"
    title="Office live feed"
    :controls="true"
    :muted="true"
  />
</template>
```

## Slots

- `loading`
- `error`
- `empty`
- `overlay`

## Events

- `ready`
- `play`
- `pause`
- `ended`
- `error`
- `message`
- `timeupdate`
- `volumechange`
- `fullscreen-change`
- `status-change`