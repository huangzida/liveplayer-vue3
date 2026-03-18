# Installation

```bash
pnpm add liveplayer-vue3 vue
```

## Import styles

```ts
import 'liveplayer-vue3/style.css';
```

## Runtime assets

The package expects the LivePlayer runtime assets under `assets/liveplayer/` relative to the built package output. When you use the provided build scripts, those files are copied automatically.

If you need to override the asset host, pass `assetBaseUrl`:

```vue
<LivePlayer asset-base-url="/my-cdn/liveplayer" />
```