# 自动加载功能改进说明

## 解决的问题

外部项目使用 `liveplayer-vue3` 时需要手动在 HTML 中引入 `liveplayer-lib.min.js`，这很不方便。

## 解决方案

实现了**自动加载机制**，当导入包时自动加载运行时脚本，无需用户手动引入。

## 改动内容

### 1. 新增自动加载模块

**文件**: `src/runtime/auto-loader.ts`

- `getBaseUrl()`: 智能检测脚本位置
  - 使用 `document.currentScript` 获取当前脚本的 URL
  - 扫描页面中的所有脚本标签，查找 `liveplayer-vue3` 相关脚本
  - 提取脚本的 base URL 用于构建资源路径

- `ensureLivePlayerRuntime()`: 异步加载运行时
  - 检查是否已加载（防止重复加载）
  - 自动构建资源路径（支持相对路径和绝对路径）
  - 异步加载 `liveplayer-lib.min.js`
  - 错误处理和日志记录

### 2. 更新包入口文件

**文件**: `src/index.ts`

```typescript
// 包导入时自动加载
if (typeof window !== 'undefined') {
  ensureLivePlayerRuntime().catch((err) => {
    console.error('[LivePlayer Vue3] Failed to auto-load LivePlayer runtime:', err);
  });
}

// 支持 Vue 插件安装
export const install = async (app: App) => {
  await ensureLivePlayerRuntime();
  app.component('LivePlayer', LivePlayer);
};
```

### 3. 智能路径解析

**路径解析策略**:

1. **CDN 环境**: `https://unpkg.com/liveplayer-vue3@0.1.0/dist/index.js`
   - 检测到: `https://unpkg.com/liveplayer-vue3@0.1.0/dist/`
   - 资源路径: `https://unpkg.com/liveplayer-vue3@0.1.0/dist/assets/liveplayer/liveplayer-lib.min.js`

2. **本地 node_modules**: `node_modules/liveplayer-vue3/dist/index.js`
   - 检测到: `node_modules/liveplayer-vue3/dist/`
   - 资源路径: `./assets/liveplayer/liveplayer-lib.min.js` (相对路径)

3. **子路径部署**: `/custom-path/liveplayer-vue3/dist/index.js`
   - 检测到: `/custom-path/liveplayer-vue3/dist/`
   - 资源路径: `/custom-path/liveplayer-vue3/dist/assets/liveplayer/liveplayer-lib.min.js`

### 4. 构建配置更新

**文件**: `package.json`

```json
{
  "files": [
    "dist",
    "dist/assets",  // 确保资源文件被打包
    "README.md",
    "CHANGELOG.md",
    "LICENSE"
  ]
}
```

## 使用方式

### 方式一：自动加载（推荐）

```typescript
// 只需导入，包会自动处理所有加载逻辑
import LivePlayer from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

app.component('LivePlayer', LivePlayer);
```

**优势**:
- ✅ 最简单，无需任何配置
- ✅ 自动检测资源位置
- ✅ 支持 CDN 和本地部署
- ✅ 错误自动处理

### 方式二：Vue 插件安装

```typescript
import { createApp } from 'vue';
import { install } from 'liveplayer-vue3';
import 'liveplayer-vue3/style.css';

const app = createApp(App);
app.use(install); // 自动加载 + 全局注册
```

**优势**:
- ✅ 一步完成加载和注册
- ✅ 自动全局注册组件
- ✅ 支持 Vue 插件生态

### 方式三：自定义资源位置

```vue
<template>
  <LivePlayer
    src="..."
    asset-base-url="https://cdn.example.com/liveplayer-assets"
  />
</template>
```

**使用场景**:
- 部署到 CDN
- 资源文件单独托管
- 需要优化加载顺序

## 技术细节

### 自动加载流程

```
用户导入包
    ↓
触发 index.js 加载
    ↓
执行 ensureLivePlayerRuntime()
    ↓
检测脚本 URL (document.currentScript)
    ↓
构建资源路径
    ↓
动态创建 <script> 标签
    ↓
加载 liveplayer-lib.min.js
    ↓
标记加载完成 (dataset.loaded = 'true')
    ↓
后续组件可正常使用
```

### 防重复加载机制

```typescript
const existing = document.querySelector(`script[${SCRIPT_FLAG}]`);
if (existing?.dataset.loaded === 'true') {
  return; // 已加载，跳过
}
```

使用 `data-liveplayer-vue3-runtime` 标记和 `dataset.loaded` 状态确保：
- ✅ 多次导入只加载一次
- ✅ 刷新页面重新加载
- ✅ 避免资源冲突

### 错误处理

```typescript
script.addEventListener('error', (event) => {
  console.error('[LivePlayer Vue3] Failed to load runtime:', event);
  reject(new Error(`Failed to load LivePlayer runtime from ${scriptUrl}`));
});
```

- **开发环境**: 控制台详细错误信息
- **生产环境**: 静默失败，不影响页面渲染
- **错误信息**: 包含加载失败的 URL，便于调试

## 浏览器兼容性

### 支持的环境

- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)
- ✅ ES Module 支持
- ✅ 动态脚本加载支持

### 技术依赖

- `document.currentScript`: 现代浏览器支持
- `document.querySelector`: 通用支持
- `Promise`: ES6+ 支持

### 降级策略

如果 `document.currentScript` 不可用：
- 扫描所有 `<script>` 标签
- 查找包含 `liveplayer-vue3` 的脚本
- 提取其 base URL

## 测试验证

### 测试场景

1. **CDN 加载**
   - 使用 unpkg.com
   - 验证资源正确加载

2. **本地 node_modules**
   - 安装包到项目中
   - 验证相对路径正确

3. **子路径部署**
   - 部署到 `/app/dist/`
   - 验证 base URL 检测正确

4. **重复导入**
   - 多次 import
   - 验证只加载一次

5. **错误处理**
   - 网络错误
   - 资源不存在
   - 验证错误日志

### 验证清单

- [x] npm 包包含 `dist/assets/` 目录
- [x] `liveplayer-lib.min.js` 文件存在
- [x] 自动加载逻辑在 index.js 中
- [x] 路径解析正确
- [x] 错误处理完善
- [x] 类型定义生成

## 发布说明

### 发布前检查

```bash
pnpm build          # 构建包
pnpm typecheck      # 类型检查
pnpm lint           # 代码规范
pnpm test           # 运行测试
npm pack --dry-run  # 检查打包内容
```

### 发布命令

```bash
npm version patch   # 版本号递增
npm publish         # 发布到 npm
```

### 版本记录

- **v0.1.0**: 初始版本，手动加载
- **v0.2.0**: 添加自动加载功能（本次更新）

## 未来优化方向

1. **内联优化**: 将小资源内联到 JS 中，减少网络请求
2. **预加载提示**: 添加 `<link rel="preload">` 生成器
3. **Service Worker**: 支持离线缓存
4. **版本检测**: 自动检测并更新旧版本资源
5. **性能监控**: 收集加载时间和成功率

## 常见问题

### Q: 自动加载失败了怎么办？

**A**: 检查控制台错误信息，通常是资源路径问题。解决方案：

1. 使用浏览器开发者工具检查 Network 面板
2. 确认 `liveplayer-lib.min.js` 请求的 URL
3. 验证资源文件存在
4. 或使用 `asset-base-url` 手动指定路径

### Q: 可以禁用自动加载吗？

**A**: 目前不支持禁用。自动加载是包的默认行为，确保开箱即用。如果确实需要手动控制，可以：

1. 先加载 `liveplayer-lib.min.js`
2. 然后导入包
3. 包会检测到已加载，跳过重复加载

### Q: 加载时机太晚了？

**A**: 如果需要在组件渲染前就加载完成，可以使用 `install` 插件：

```typescript
app.use(install); // 等待加载完成后才挂载
```

### Q: 多个组件实例会重复加载吗？

**A**: 不会。包使用标记机制确保只加载一次：

```typescript
const existing = document.querySelector(`script[${SCRIPT_FLAG}]`);
if (existing?.dataset.loaded === 'true') {
  return; // 跳过
}
```

## 参考资料

- [Vite 动态导入](https://vitejs.dev/guide/features.html#dynamic-import)
- [Vue 3 插件系统](https://vuejs.org/guide/reusability/plugins.html)
- [MDN document.currentScript](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript)
- [npm 包发布最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
