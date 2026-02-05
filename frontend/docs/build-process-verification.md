# 字体优化构建流程验证

## 构建命令

```bash
npm run build
```

## 构建步骤详解

`npm run build` 会按顺序执行以下步骤:

### 1. 恢复完整字体 (restore-full-font)
```bash
cp public/fonts/ChenYuluoyan-2.0-Thin.full.woff2 public/fonts/ChenYuluoyan-2.0-Thin.woff2
```
- **目的**: 从备份恢复完整的 4.7MB 字体文件
- **原因**: 确保 Next.js 构建时有完整字体可用

### 2. 复制 Wordings (copy-wordings)
```bash
mkdir -p public/data/wordings && cp -r src/data/wordings/* public/data/wordings/
```
- **目的**: 复制 YAML 配置文件到 public 目录

### 3. 生成 OG 图片 (generate-og-images)
```bash
npx tsx scripts/generate-og-images.tsx
```
- **目的**: 生成社交媒体分享图片

### 4. 生成 Sitemap (generate-sitemap)
```bash
npx tsx scripts/generate-sitemap.ts
```
- **目的**: 生成搜索引擎 sitemap

### 5. Next.js 构建 (next build)
```bash
NEXT_OUTPUT=export next build
```
- **目的**: 构建静态网站到 `out/` 目录
- **结果**: 
  - 生成 `out/**/*.html` 文件
  - 复制 `public/fonts/` → `out/fonts/`
  - 此时 `out/fonts/ChenYuluoyan-2.0-Thin.woff2` 是 4.7MB

### 6. 字体子集化 (subset-font) ✨
```bash
node scripts/subset-font.js
```
- **目的**: 优化字体文件大小
- **工作流程**:
  1. 扫描 `out/**/*.html` 文件
  2. 提取所有使用字体的字符
  3. 生成优化的 woff2 文件 (16KB)
  4. **关键步骤**: 覆盖 `out/fonts/ChenYuluoyan-2.0-Thin.woff2`
  5. 同时更新 `public/fonts/ChenYuluoyan-2.0-Thin.woff2`

## 验证测试

### 测试 1: 恢复完整字体
```bash
npm run restore-full-font
ls -lh public/fonts/ChenYuluoyan-2.0-Thin.woff2
```
**预期结果**: 4.7M

### 测试 2: 字体子集化
```bash
node scripts/subset-font.js
```
**预期输出**:
```
Starting Smart Character Extraction...
Analyzing 19 production HTML files...
Scan complete. Found 113 unique characters.
🚀 Subsetting font to .../public/fonts...
✅ Font subsetting complete!
📦 Result: ChenYuluoyan-2.0-Thin.woff2 (16.42 KB)
✨ Updated out/fonts/ChenYuluoyan-2.0-Thin.woff2: 4797.87 KB → 16.42 KB
```

### 测试 3: 验证优化结果
```bash
ls -lh out/fonts/ChenYuluoyan-2.0-Thin.woff2
ls -lh public/fonts/ChenYuluoyan-2.0-Thin.woff2
```
**预期结果**: 两个文件都是 16K

## 部署流程

```bash
npm run deploy
```

这会执行:
1. `npm run build` (包含所有上述步骤)
2. `firebase deploy` (部署优化后的 `out/` 目录)

## 关键文件

### 字体文件位置
- `public/fonts/ChenYuluoyan-2.0-Thin.full.woff2` - 完整字体备份 (4.7MB)
- `public/fonts/ChenYuluoyan-2.0-Thin.woff2` - 工作字体 (构建时 4.7MB → 优化后 16KB)
- `out/fonts/ChenYuluoyan-2.0-Thin.woff2` - 部署字体 (优化后 16KB)

### 脚本文件
- `scripts/subset-font.js` - 字体子集化脚本 (已修复)

### 配置文件
- `package.json` - 构建脚本配置

## 常见问题

### Q: 为什么需要 restore-full-font?
A: 因为字体子集化会修改 `public/fonts/` 中的字体文件。每次构建前需要恢复完整字体,确保能提取所有需要的字符。

### Q: 字体优化在哪一步执行?
A: 在 Next.js 构建**之后**,这样可以扫描生成的 HTML 文件来确定实际使用的字符。

### Q: 如果 out/ 目录不存在会怎样?
A: 脚本会回退到扫描源代码文件 (`src/**/*.{tsx,yml}`),但这样不够准确,可能会包含未使用的字符。

### Q: 如何验证字体优化是否成功?
A: 检查 `out/fonts/ChenYuluoyan-2.0-Thin.woff2` 文件大小应该是 16KB 左右,而不是 4.7MB。

## 修复历史

- **2026-02-05**: 修复字体子集化脚本,使其正确更新 `out/fonts/` 目录
- **问题**: 脚本之前只尝试更新 `out/_next/static/media/`,但字体实际在 `out/fonts/`
- **解决**: 添加对 `out/fonts/` 目录的检查和更新逻辑
