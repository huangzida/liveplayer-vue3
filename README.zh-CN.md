# liveplayer-vue3

[English](./README.md) | 中文

面向 Vue 3 的播放器封装组件，基于 @liveqing/liveplayer-v3，提供：

- 类型完善的 props、事件与实例方法
- 自动化 runtime 资源加载
- VitePress 文档与本地 playground
- 基于 CI 的 npm 发布与 GitHub Release 流程

## 安装

```bash
pnpm add liveplayer-vue3 @liveqing/liveplayer-v3
```

Peer 依赖：

- vue ^3.5.0
- @liveqing/liveplayer-v3 ^3.7.37

## 快速开始

### 第 1 步：注册 Vite 插件（推荐）

Vite 插件会自动将 `liveplayer-lib.min.js` 从 `@liveqing/liveplayer-v3` 拷贝到 `public/assets/liveplayer/`（开发环境）和 `dist/assets/liveplayer/`（构建环境），无需手动拷贝。

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { liveplayerVue3Plugin } from 'liveplayer-vue3/vite-plugin';

export default defineConfig({
  plugins: [liveplayerVue3Plugin()],
});
```

### 第 2 步：使用组件

### 方式一：作为插件注册

```ts
import { createApp } from 'vue';
import App from './App.vue';
import LivePlayerVue3 from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

const app = createApp(App);
app.use(LivePlayerVue3);
app.mount('#app');
```

### 方式二：按组件直接引入

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
    title="演示流"
  />
</template>
```

## Runtime 资源加载机制

底层播放器（`@liveqing/liveplayer-v3`）依赖 runtime 脚本（`liveplayer-lib.min.js`）来提供 `window.videojs`。有两种方式加载该脚本：

### 方式 A：Vite 插件（推荐，零配置）

使用 `liveplayerVue3Plugin` 自动处理资源拷贝（见上方快速开始）。脚本会自动位于 `/assets/liveplayer/liveplayer-lib.min.js`，即默认路径，无需传 `assetBaseUrl`。

### 方式 B：手动拷贝 + 自定义路径

如果不使用 Vite 插件，需手动拷贝文件：

```bash
cp node_modules/@liveqing/liveplayer-v3/dist/component/liveplayer-lib.min.js public/assets/liveplayer/
```

或通过 `assetBaseUrl` 指向自定义地址（如 CDN）：

```vue
<LivePlayer
  src="https://example.com/live.m3u8"
  asset-base-url="https://cdn.example.com/liveplayer"
/>
```

加载器内置去重、超时、重试和就绪校验（window.videojs）。

## 组件 API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | string | 必填 | 播放地址 |
| title | string | undefined | 视频标题 |
| poster | string | undefined | 封面图 |
| mode | 'live' \| 'vod' | 'vod' | 播放模式 |
| autoplay | boolean | true | 自动播放 |
| controls | boolean | false | 是否显示控制条 |
| muted | boolean | true | 是否静音 |
| loop | boolean | false | 是否循环 |
| fit | 'contain' \| 'cover' \| 'fill' | fill | 画面填充方式 |
| timeout | number | 10 | 播放超时 |
| playbackRates | number[] | [0.5, 1, 1.5, 2] | 倍速列表 |
| playbackRate | number | 1 | 初始倍速 |
| resolution | string | undefined | 清晰度提示 |
| assetBaseUrl | string | 基于 BASE_URL 推导 | runtime 资源根路径 |
| retry | { attempts?: number; delay?: number; backoffMultiplier?: number } | { attempts: 0, delay: 1000, backoffMultiplier: 1 } | 兼容保留参数 |
| lowLatency | boolean | false | 兼容保留参数 |
| debug | boolean | false | 兼容保留参数 |
| class | string | '' | 外层容器 class |
| style | CSSProperties | {} | 外层容器 style |

### Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| ready | { api, assets } | runtime 就绪，返回公开 API 与资源信息 |
| play | currentTime: number | 开始播放 |
| pause | currentTime: number | 暂停播放 |
| ended | 无 | 播放结束 |
| error | { code, message, cause } | 加载/运行时错误 |
| message | { message, type } | 底层播放器消息 |
| timeupdate | currentTime: number | 播放进度更新 |
| volumechange | volume: number, isMuted: boolean | 音量/静音状态变化 |
| fullscreen-change | isFullscreen: boolean | 全屏状态变化 |
| status-change | 'idle' \| 'loading' \| 'ready' \| 'error' \| 'ended' | 组件生命周期状态 |

### 暴露方法

通过模板 ref 调用：

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
  <button @click="jumpToTen">跳转到 10 秒</button>
</template>
```

可用方法：

- play()
- pause()
- seek(time: number)
- snapshot()
- setMuted(muted: boolean)
- setVolume(volume: number)
- enterFullscreen()
- exitFullscreen()
- toggleFullscreen()
- getInternalPlayer()

### Slots

- empty：当 src 为空时渲染
- loading：加载态覆盖层
- error：错误态覆盖层
- overlay：叠加层，接收 { status }

## 状态与错误模型

状态流转：

- 未传 src：idle
- 加载 runtime / 组件：loading
- 可播放：ready
- 播放结束：ended
- 加载失败或运行时异常：error

错误码：

- load_failed：runtime 资源或模块加载失败
- runtime_error：底层播放器抛出错误

## SSR 与测试说明

- 支持 SSR 场景安全导入（非浏览器环境不触发脚本注入）
- 在 vitest、jsdom、happy-dom 中会跳过真实 runtime 脚本注入

## 开发

```bash
pnpm install
pnpm dev
pnpm dev:docs
```

## 构建与校验

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:docs
pnpm publint
```

一键校验：

```bash
pnpm verify
```

## 发布自动化

GitHub Actions：

- Prepare Release 工作流使用 bumpp + changelogithub
- 手动选择版本类型：patch / minor / major
- 执行 pnpm verify，更新版本与 CHANGELOG，自动提交并打 tag
- tag 推送后触发 .github/workflows/release.yml，发布 npm 并创建 GitHub Release

本地发布命令：

```bash
pnpm release
```

## 文档与演示

- 文档站：pnpm dev:docs
- 本地演示：pnpm dev

常用文件：

- docs/.vitepress/config.ts
- playground/src/demos/FeatureShowcase.vue
- .github/workflows/release-prepare.yml
- .github/workflows/release.yml
