# 图片优化脚本 - 快速开始

## 🚀 快速使用

### 1️⃣ 预览模式与未使用检测（推荐首次使用）

先看看会发生什么，并检查哪些图片没在用：

```bash
npm run optimize-images:preview -- --check-unused
```

### 2️⃣ 标准优化

使用默认配置（质量 80，自动检测透明度）：

```bash
npm run optimize-images
```

### 3️⃣ 高质量模式

用于重要的展示图片：

```bash
npm run optimize-images:high-quality
```

### 4️⃣ 激进压缩

最大化减小文件大小：

```bash
npm run optimize-images:aggressive
```

### 5️⃣ 清理未使用图片（移至垃圾桶）

如果你确定某些图片已经没在用了，可以使用此命令将它们移至系統垃圾桶：

```bash
npm run optimize-images:cleanup-unused
```

## 📊 你会看到什么

脚本会显示：

```
✅ 已处理: curriculum-hero.png
   原始大小: 843.14 KB
   优化后: 266.18 KB
   节省: 68.45%
   Alpha 通道: 无 | 保留: 否
   压缩质量: 80
   更新引用: 2 个文件
```

最后会有总结报告：

```
📊 处理报告
============================================================
总文件数: 25
已处理: 20
跳过: 3
失败: 0

原始总大小: 15.42 MB
优化后总大小: 6.18 MB
总节省: 59.93%
节省空间: 9.24 MB
```

## 🎯 常见场景

### 场景 1：刚添加了新图片

```bash
# 直接运行，只会处理新图片
npm run optimize-images
```

### 场景 2：想重新优化所有图片

```bash
# 删除记录文件
rm .image-optimization-log.json

# 重新运行
npm run optimize-images
```

### 场景 3：优化后质量不够好

```bash
# 使用自定义质量
node scripts/image-optimizer/optimize-images.js --quality=90
```

### 场景 4：透明图片边缘有问题

```bash
# 强制保留所有透明通道
node scripts/image-optimizer/optimize-images.js --alpha=always
```

## ⚙️ 自定义参数

```bash
# 自定义质量（0-100）
node scripts/image-optimizer/optimize-images.js --quality=85

# 控制透明度处理
node scripts/image-optimizer/optimize-images.js --alpha=auto    # 自动检测（推荐）
node scripts/image-optimizer/optimize-images.js --alpha=always  # 总是保留
node scripts/image-optimizer/optimize-images.js --alpha=never   # 从不保留

# 组合使用
node scripts/image-optimizer/optimize-images.js --quality=90 --alpha=always
```

## 📝 根据报告调整

查看报告后，你可以：

1. **如果节省空间不够多** → 降低质量或使用激进模式
2. **如果图片质量不够好** → 提高质量或使用高质量模式
3. **如果透明效果有问题** → 使用 `--alpha=always`
4. **如果不需要透明** → 使用 `--alpha=never` 获得更好压缩

## ⚠️ 注意事项

1. **首次使用前建议备份或提交 git**
2. **先用预览模式查看效果**
3. **处理后检查几张重要图片**
4. **脚本会自动更新代码中的引用**

## 📚 更多信息

查看完整文档：`IMAGE_OPTIMIZATION_GUIDE.md`

## 🆘 常见问题

**Q: 会处理哪些图片？**  
A: `frontend/public/img/` 及其子文件夹中的所有 jpg、png、gif、tiff、bmp 图片

**Q: 会修改原始文件吗？**  
A: 是的，会转换为 WebP 并删除原始文件。建议先备份或使用预览模式。

**Q: 如何跳过已处理的图片？**  
A: 脚本会自动记录，再次运行时只处理新增或修改的图片。

**Q: 如何恢复？**  
A: 使用 git 恢复：`git checkout HEAD -- frontend/public/img/`
