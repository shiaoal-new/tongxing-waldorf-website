# 图片优化脚本使用指南

## 功能特性

✨ **自动化图片优化脚本**，帮助你：

- 🔄 将图片转换为 WebP 格式
- 🎨 自动检测并保留 alpha 通道（透明度）
- 📦 使用有损压缩减小文件大小
- ⏭️ 智能跳过已处理的图片
- 🔍 **检测未使用的图片**（新功能 ✨）
- 🔗 自动更新 js/tsx/yml 文件中的引用
- 📊 生成详细的处理报告

## 安装依赖

首先需要安装必要的依赖包：

```bash
npm install sharp glob --save-dev
```

## 使用方法

### 1. 基本使用

使用默认配置运行（质量 80，自动检测 alpha）：

```bash
node scripts/image-optimizer/optimize-images.js
```

### 2. 使用预设

我们提供了 4 个预设配置：

#### 高质量模式（推荐用于重要展示图片）
```bash
node scripts/image-optimizer/optimize-images.js --preset=high-quality
```
- Alpha: 自动检测
- 质量: 90

#### 平衡模式（默认推荐）
```bash
node scripts/image-optimizer/optimize-images.js --preset=balanced
```
- Alpha: 自动检测
- 质量: 80

#### 激进压缩（最大化减小文件）
```bash
node scripts/image-optimizer/optimize-images.js --preset=aggressive
```
- Alpha: 不保留
- 质量: 60

#### 保留透明度模式
```bash
node scripts/image-optimizer/optimize-images.js --preset=preserve-alpha
```
- Alpha: 总是保留
- 质量: 85

### 3. 自定义参数

你可以通过命令行参数自定义配置：

```bash
# 设置压缩质量（0-100）
node scripts/image-optimizer/optimize-images.js --quality=85

# 设置 alpha 通道处理方式
node scripts/image-optimizer/optimize-images.js --alpha=auto    # 自动检测
node scripts/image-optimizer/optimize-images.js --alpha=always  # 总是保留
node scripts/image-optimizer/optimize-images.js --alpha=never   # 从不保留

# 组合使用
node scripts/image-optimizer/optimize-images.js --quality=90 --alpha=always
```

但**不会实际修改任何文件**。

### 5. 检测未使用的图片 (新 ✨)

你可以扫描源代碼，找出现在文件夹中但没有被引用的图片：

```bash
npm run optimize-images:check-unused
```

或者手动使用参数：

```bash
node scripts/image-optimizer/optimize-images.js --dry-run --check-unused
```

這會：
1. 扫描所有 `src` 下的 JS, TSX, YML 文件。
2. 提取所有可能的图片引用字符串。
3. 对比 `public/img` 下的文件。
4. 在报告结尾列出「🚫 可能未使用的图片」。

### 6. 清理並移至回收站 (macOS ✨)

如果你想直接將這些未使用的圖片丟進垃圾桶，可以使用：

```bash
npm run optimize-images:cleanup-unused
```

或者使用參數：

```bash
node scripts/image-optimizer/optimize-images.js --check-unused --trash-unused
```

**功能特點：**
- **原生適配**：在 macOS 上，它會優先調用 Finder 的刪除功能（這意味著你可以通過 Finder 的「放回原處」功能來恢復圖片）。
- **二次保障**：如果 Finder 方法不可用，它會嘗試移動到 `~/.Trash` 目錄。
- **排除處理**：被丟進垃圾桶的圖片將不會進入後續的優化流程（節省處理時間）。

## 工作原理

### 处理流程

1. **扫描图片**：在 `frontend/public/img` 及其子文件夹中查找所有支持的图片格式
2. **检查记录**：跳过已经处理过且未修改的图片
3. **检测 alpha**：自动检测图片是否有透明通道
4. **转换压缩**：转换为 WebP 格式并应用有损压缩
5. **更新引用**：在所有 js/tsx/yml 文件中更新图片路径
6. **删除原文件**：删除原始图片文件
7. **记录日志**：保存处理记录到 `.image-optimization-log.json`

### 支持的图片格式

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.tiff`
- `.bmp`

### 跳过机制

脚本会为每个处理过的图片生成 MD5 哈希值并保存在 `.image-optimization-log.json` 中。

当你再次运行脚本时：
- ✅ 如果图片未修改（哈希值相同）→ 跳过
- 🔄 如果图片已修改或是新图片 → 重新处理

这意味着你可以安全地多次运行脚本，只有新增或修改的图片会被处理。

## 处理报告

脚本会生成详细的处理报告，包括：

### 总体统计
- 总文件数
- 已处理数量
- 跳过数量
- 失败数量
- 原始总大小
- 优化后总大小
- 总节省百分比
- 节省的空间（MB）

### 每个文件的详细信息
- 文件路径
- 原始大小 vs 优化后大小
- 节省百分比
- 是否有 alpha 通道
- 是否保留了 alpha
- 使用的压缩质量
- 更新了多少个引用文件

### 示例输出

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

详细信息:

1. curriculum-hero.png
   节省: 68.45%
   Alpha: 无 | 保留: 否
   质量: 80
   更新引用: 2 个文件

2. season-summer-bg.png
   节省: 72.31%
   Alpha: 有 | 保留: 是
   质量: 80
   更新引用: 1 个文件
```

## 调整配置

### 编辑配置文件

你可以编辑 `scripts/image-optimizer/image-optimization-config.json` 来：

1. **修改默认值**：
```json
{
  "alphaMode": "auto",
  "quality": 80
}
```

2. **创建自定义预设**：
```json
{
  "presets": {
    "my-custom": {
      "alphaMode": "auto",
      "quality": 75,
      "description": "我的自定义配置"
    }
  }
}
```

然后使用：
```bash
node scripts/image-optimizer/optimize-images.js --preset=my-custom
```

## 根据报告调整参数

### 场景 1：文件太大，需要更激进的压缩

如果报告显示节省的空间不够多：

```bash
# 降低质量
node scripts/image-optimizer/optimize-images.js --quality=60

# 或使用激进预设
node scripts/image-optimizer/optimize-images.js --preset=aggressive
```

### 场景 2：图片质量不够好

如果优化后的图片质量不满意：

```bash
# 提高质量
node scripts/image-optimizer/optimize-images.js --quality=90

# 或使用高质量预设
node scripts/image-optimizer/optimize-images.js --preset=high-quality
```

### 场景 3：透明图片边缘有问题

如果报告显示某些图片有 alpha 但没有保留，导致透明效果丢失：

```bash
# 强制保留所有 alpha 通道
node scripts/image-optimizer/optimize-images.js --alpha=always

# 或使用保留透明度预设
node scripts/image-optimizer/optimize-images.js --preset=preserve-alpha
```

### 场景 4：不需要透明度，想最大化压缩

如果你的图片都不需要透明效果：

```bash
# 不保留 alpha 通道
node scripts/image-optimizer/optimize-images.js --alpha=never --quality=70
```

## 重新处理所有图片

如果你想用新的设置重新处理所有图片：

1. 删除处理记录：
```bash
rm .image-optimization-log.json
```

2. 运行脚本：
```bash
node scripts/image-optimizer/optimize-images.js --preset=high-quality
```

## 最佳实践

### 推荐工作流程

1. **首次运行**：使用干运行模式预览
```bash
node scripts/image-optimizer/optimize-images.js --dry-run
```

2. **选择合适的预设**：根据你的需求选择
```bash
node scripts/image-optimizer/optimize-images.js --preset=balanced
```

3. **检查报告**：查看节省的空间和质量设置

4. **调整参数**（如需要）：
   - 如果质量不够 → 提高 quality
   - 如果文件还是太大 → 降低 quality
   - 如果透明效果有问题 → 使用 `--alpha=always`

5. **添加新图片时**：直接运行脚本，只会处理新图片
```bash
node scripts/image-optimizer/optimize-images.js
```

### 质量参数建议

- **90-100**：用于 hero 图片、重要的展示图片
- **80-90**：日常使用，质量和大小平衡（推荐）
- **60-80**：背景图、装饰性图片
- **40-60**：缩略图、小图标

### Alpha 通道建议

- **auto**（推荐）：让脚本自动检测，有透明就保留
- **always**：如果你的设计大量使用透明效果
- **never**：如果你确定不需要透明，可以获得更好的压缩

## 故障排除

### 问题：脚本报错 "Cannot find module 'sharp'"

**解决**：安装依赖
```bash
npm install sharp glob --save-dev
```

### 问题：某些文件处理失败

**原因**：可能是图片文件损坏或格式不支持

**解决**：查看错误信息，手动检查该图片文件

### 问题：引用更新不完整

**原因**：可能使用了非标准的引用方式

**解决**：手动搜索并更新剩余的引用
```bash
# 搜索旧的图片引用
grep -r "old-image-name.png" frontend/src/
```

### 问题：想恢复原始图片

**解决**：从 git 历史恢复
```bash
git checkout HEAD -- frontend/public/img/
```

## 注意事项

⚠️ **重要提醒**：

1. **备份**：首次运行前建议提交 git 或备份图片文件夹
2. **测试**：先用 `--dry-run` 预览，确认无误后再实际运行
3. **质量检查**：处理后检查几张重要图片的显示效果
4. **版本控制**：`.image-optimization-log.json` 建议加入 `.gitignore`

## 示例场景

### 场景：新增了一批产品图片

```bash
# 1. 将图片放入 public/img/ 目录
# 2. 运行脚本（只会处理新图片）
node scripts/image-optimizer/optimize-images.js --preset=high-quality

# 3. 查看报告，确认效果
# 4. 提交代码
git add .
git commit -m "优化新增产品图片"
```

### 场景：网站加载太慢，需要优化所有图片

```bash
# 1. 删除处理记录，重新处理所有图片
rm .image-optimization-log.json

# 2. 使用激进压缩
node scripts/image-optimizer/optimize-images.js --preset=aggressive

# 3. 检查关键图片质量
# 4. 如果质量不够，用更高质量重新处理
node scripts/image-optimizer/optimize-images.js --quality=75
```

## 技术细节

- **压缩算法**：WebP 有损压缩
- **Alpha 通道**：使用 WebP 的 alpha 质量参数
- **哈希算法**：MD5
- **引用更新**：正则表达式匹配多种路径格式
- **并发处理**：顺序处理，避免资源竞争

## 许可

MIT License
