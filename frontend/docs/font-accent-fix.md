# ChenYuluoyan 字体未应用问题修复

## 问题描述

在 Firebase Hosting 的网站上,首页 Hero 区块的 `accent_text` 没有套用 ChenYuluoyan 字体。

## 问题根源

### CSS 变量定义冲突

1. **`tailwind.css`** (`:root` 选择器):
   ```css
   --font-accent: "Zeyada", "Indie Flower", "Handwriting", cursive;
   ```

2. **`tongxing.css`** (`[data-theme="tongxing"]` 选择器):
   ```css
   --font-accent: var(--font-chen), cursive;
   ```

3. **问题**: 主题特定的 CSS 变量覆盖可能因为选择器优先级或加载顺序问题而失效

### 受影响的组件

- **`PageHero.tsx`** (第 235 行):
  ```tsx
  className="... font-accent ..."
  ```
  
- **Tailwind 配置** (`tailwind.config.js` 第 95 行):
  ```js
  accent: ['var(--font-accent)', 'cursive']
  ```

## 解决方案

### 方案 1: 修改默认字体定义 (已采用)

直接在 `tailwind.css` 的 `:root` 中使用 ChenYuluoyan 作为默认 accent 字体:

```css
/* tailwind.css */
:root {
  --font-chen: 'ChenYuluoyan', cursive;
  --font-accent: var(--font-chen), cursive;  /* 修改这里 */
}
```

**优点**:
- 简单直接
- 不依赖主题系统
- 确保所有环境下都能正确应用

**缺点**:
- 如果需要支持多主题,每个主题都需要自己的 accent 字体,则需要其他方案

### 方案 2: 提高主题选择器优先级 (备选)

在 `tongxing.css` 中使用更高优先级的选择器:

```css
:root[data-theme="tongxing"],
[data-theme="tongxing"] {
  --font-accent: var(--font-chen), cursive;
}
```

### 方案 3: 直接使用 font-chen 类 (备选)

在组件中直接使用 `font-chen` 而不是 `font-accent`:

```tsx
className="... font-chen ..."
```

但这需要在 `tailwind.config.js` 中添加 `font-chen` 的定义。

## 验证步骤

### 1. 本地开发环境

```bash
npm run dev
```

访问 `http://localhost:3000`,检查首页 Hero 的 accent_text 是否使用 ChenYuluoyan 字体。

### 2. 生产构建

```bash
npm run build
```

检查构建输出的 CSS 文件中 `--font-accent` 的定义。

### 3. 浏览器开发者工具

1. 打开浏览器开发者工具
2. 选择 Hero 区块的 accent_text 元素
3. 检查 Computed 样式中的 `font-family`
4. 应该显示: `ChenYuluoyan, cursive`

### 4. 字体加载验证

在浏览器开发者工具的 Network 标签中:
- 检查 `ChenYuluoyan-2.0-Thin.woff2` 是否成功加载
- 文件大小应该是 ~16KB (优化后)

## 相关文件

- `src/css/tailwind.css` - 字体变量定义
- `src/css/themes/tongxing.css` - 主题特定样式
- `src/components/layout/PageHero.tsx` - Hero 组件
- `tailwind.config.js` - Tailwind 配置
- `src/pages/_document.tsx` - 字体预加载

## 注意事项

1. **字体优化**: 确保 `subset-font.js` 脚本正常运行,生成优化的 woff2 文件
2. **字体预加载**: `_document.tsx` 中已配置字体预加载,确保快速渲染
3. **回退字体**: CSS 中包含 `cursive` 作为回退字体,确保在字体加载失败时仍有可读性

## 测试清单

- [ ] 本地开发环境中 accent_text 显示正确字体
- [ ] 生产构建后 accent_text 显示正确字体
- [ ] 字体文件大小为 ~16KB (优化后)
- [ ] 浏览器开发者工具显示正确的 font-family
- [ ] 字体加载时间 < 1 秒
- [ ] 移动端和桌面端都显示正确

## 修复日期

2026-02-05

## 相关问题

- [字体优化问题修复](./font-optimization-fix.md)
- [构建流程验证](./build-process-verification.md)
