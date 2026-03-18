# liveplayer-vue3

`liveplayer-vue3` is a standalone Vue 3 npm package that wraps `@liveqing/liveplayer-v3` with a cleaner public API, typed instance methods, VitePress documentation, and a local playground.

## Highlights

- Standardized props like `src`, `mode`, and `fit`.
- Emits `status-change` with `idle`, `loading`, `ready`, `error`, and `ended`.
- Exposes typed imperative methods such as `play()`, `pause()`, and `toggleFullscreen()`.
- Syncs the LiveQing runtime assets into package, docs, and playground outputs.
- Publishes docs to GitHub Pages and packages to npm from GitHub Actions.

## Development

```bash
pnpm install
pnpm dev
pnpm dev:docs
```

## Build and verify

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm build:docs
pnpm publint
```

## Runtime assets

If you keep the package defaults, the wrapper resolves runtime assets relative to the built package output. To serve them from a CDN or custom public path, pass `assetBaseUrl`.

## Files worth editing in a fresh repo

- `package.json`
- `docs/.vitepress/config.ts`
- `playground/src/demos/FeatureShowcase.vue`
- `.github/workflows/pages.yml`
- `.github/workflows/release.yml`