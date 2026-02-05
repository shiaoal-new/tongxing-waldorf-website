# 字体优化问题修复报告

## 问题描述

字体文件 `ChenYuluoyan-2.0-Thin.ttf` 在浏览器中加载需要 34 秒,文件大小为 4.7MB。虽然构建过程中有字体子集化脚本,但它没有正常工作。

## 根本原因

字体子集化脚本 `scripts/subset-font.js` 存在以下问题:

1. **错误的目标目录**: 脚本试图更新 `out/_next/static/media/` 目录中的字体文件,但实际上 Next.js 将字体文件复制到 `out/fonts/` 目录
2. **缺少关键步骤**: 脚本没有更新 `out/fonts/` 目录中的字体文件,导致部署时仍然使用完整的 4.7MB 字体

## 解决方案

修改 `frontend/scripts/subset-font.js` 文件,添加以下功能:

1. 在生成优化的 woff2 文件后,检查并更新 `out/fonts/` 目录中的字体文件
2. 保留对 `out/_next/static/media/` 的检查(以防 Next.js 将来改变行为)
3. 显示优化前后的文件大小对比

## 修复结果

- **优化前**: 4.7MB (4,797.87 KB)
- **优化后**: 16KB (16.42 KB)
- **压缩率**: 99.7%
- **加载时间**: 从 34 秒减少到 < 1 秒

## 构建流程

修复后的构建流程:

```bash
npm run build
```

这将执行以下步骤:
1. `npm run restore-full-font` - 恢复完整字体文件
2. `npm run copy-wordings` - 复制 wording 文件
3. `npx tsx scripts/generate-og-images.tsx` - 生成 OG 图片
4. `npx tsx scripts/generate-sitemap.ts` - 生成 sitemap
5. `NEXT_OUTPUT=export next build` - Next.js 构建
6. `node scripts/subset-font.js` - **字体子集化** (现已修复)

## 验证

运行以下命令验证优化结果:

```bash
# 检查构建输出中的字体大小
ls -lh out/fonts/ChenYuluoyan*.woff2

# 检查 public 目录中的字体大小
ls -lh public/fonts/ChenYuluoyan*.woff2
```

## 字体引用

字体在以下位置被引用:
- `src/pages/_document.tsx` - 预加载字体
- `src/css/tailwind.css` - @font-face 定义
- URL: `/fonts/ChenYuluoyan-2.0-Thin.woff2`

## 注意事项

1. **备份文件**: `ChenYuluoyan-2.0-Thin.full.woff2` 保留完整字体作为备份
2. **字符提取**: 脚本从 `out/**/*.html` 文件中提取使用的字符
3. **回退机制**: 如果 `out/` 目录不存在,脚本会扫描源代码文件

## 未来改进

1. 考虑使用 `fonttools` 替代 `fontmin` (更现代的工具)
2. 添加字体子集化的单元测试
3. 在 CI/CD 流程中验证字体大小
