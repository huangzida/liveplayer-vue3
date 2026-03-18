# API Reference

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | required | Stream or file URL |
| `title` | `string` | `undefined` | Overlay title |
| `poster` | `string` | `undefined` | Poster image |
| `mode` | `'live' \| 'vod'` | `'vod'` | Playback mode |
| `autoplay` | `boolean` | `true` | Autoplay hint |
| `controls` | `boolean` | `false` | Show player controls |
| `muted` | `boolean` | `false` | Start muted |
| `loop` | `boolean` | `false` | Loop playback |
| `fit` | `'contain' \| 'cover' \| 'fill'` | `'contain'` | Layout strategy |
| `timeout` | `number` | `10` | Load timeout in seconds |
| `playbackRates` | `number[]` | `[0.5, 1, 1.5, 2]` | Rate menu |
| `playbackRate` | `number` | `1` | Initial rate |
| `resolution` | `string` | `undefined` | LiveQing resolution label |
| `assetBaseUrl` | `string` | inferred | Asset host override |
| `retry` | `LivePlayerRetryOptions` | `{ attempts: 0, delay: 1000, backoffMultiplier: 1 }` | Reserved retry config |
| `lowLatency` | `boolean` | `false` | Reserved low-latency hint |
| `debug` | `boolean` | `false` | Reserved debug hook |

## Exposed methods

```ts
interface LivePlayerPublicInstance {
  play(): void;
  pause(): void;
  seek(time: number): void;
  snapshot(): void;
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  enterFullscreen(): void;
  exitFullscreen(): void;
  toggleFullscreen(): void;
  getInternalPlayer(): LivePlayerInnerInstance | null;
}
```