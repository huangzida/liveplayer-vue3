---
layout: home

hero:
  name: liveplayer-vue3
  text: Typed Vue 3 live streaming wrapper for docs, demos, and npm delivery.
  tagline: Built on top of @liveqing/liveplayer-v3 with a cleaner API, runtime asset handling, and a polished VitePress + playground workflow.
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: API Reference
      link: /api-reference
    - theme: alt
      text: Playground
      link: /examples

features:
  - title: Typed public API
    details: New `src`, `mode`, `fit`, `status-change`, and imperative instance methods designed for Vue 3 consumption.
  - title: Runtime asset handling
    details: Syncs `liveplayer-lib.min.js`, SWF, and `crossdomain.xml` into package, docs, and playground targets.
  - title: Docs-first publishing
    details: VitePress is the public face, while the same interactive demo is reused locally and on GitHub Pages.
---

## Interactive demo

<FeatureShowcase />