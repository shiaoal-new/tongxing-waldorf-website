#!/usr/bin/env node

/**
 * 重新优化现有的 WebP 图片
 * 用于进一步压缩已经是 WebP 格式的图片
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function reoptimizeWebP(inputPath, quality = 75) {
    try {
        const stats = await fs.stat(inputPath);
        const originalSize = stats.size;

        // 创建临时文件
        const tempPath = inputPath + '.tmp';

        // 重新压缩
        await sharp(inputPath)
            .webp({
                quality: quality,
                lossless: false,
                effort: 6, // 0-6, 更高的值意味着更好的压缩但更慢
            })
            .toFile(tempPath);

        const newStats = await fs.stat(tempPath);
        const newSize = newStats.size;

        // 只有在新文件更小时才替换
        if (newSize < originalSize) {
            await fs.rename(tempPath, inputPath);
            const savedPercent = ((originalSize - newSize) / originalSize * 100).toFixed(2);
            console.log(`✅ ${path.basename(inputPath)}`);
            console.log(`   原始: ${(originalSize / 1024).toFixed(2)} KB`);
            console.log(`   优化后: ${(newSize / 1024).toFixed(2)} KB`);
            console.log(`   节省: ${savedPercent}%\n`);
            return { originalSize, newSize, saved: originalSize - newSize };
        } else {
            // 新文件更大，删除临时文件
            await fs.unlink(tempPath);
            console.log(`⏭️  ${path.basename(inputPath)} - 已经是最优大小\n`);
            return { originalSize, newSize: originalSize, saved: 0 };
        }
    } catch (error) {
        console.error(`❌ 处理失败: ${inputPath}`, error.message);
        return { originalSize: 0, newSize: 0, saved: 0 };
    }
}

async function main() {
    const quality = parseInt(process.argv[2]) || 75;
    console.log(`🚀 重新优化 WebP 图片 (质量: ${quality})\n`);

    const publicDir = path.join(__dirname, '../../frontend/public/img');

    // 要优化的文件
    const files = [
        path.join(publicDir, 'video-poster.webp'),
        path.join(publicDir, 'video-poster-mobile.webp'),
    ];

    let totalOriginal = 0;
    let totalNew = 0;

    for (const file of files) {
        const result = await reoptimizeWebP(file, quality);
        totalOriginal += result.originalSize;
        totalNew += result.newSize;
    }

    console.log('='.repeat(60));
    console.log('📊 总结');
    console.log('='.repeat(60));
    console.log(`原始总大小: ${(totalOriginal / 1024).toFixed(2)} KB`);
    console.log(`优化后总大小: ${(totalNew / 1024).toFixed(2)} KB`);
    console.log(`总节省: ${((totalOriginal - totalNew) / 1024).toFixed(2)} KB (${((totalOriginal - totalNew) / totalOriginal * 100).toFixed(2)}%)`);
}

main().catch(console.error);
