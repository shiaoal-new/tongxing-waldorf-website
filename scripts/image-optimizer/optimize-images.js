#!/usr/bin/env node

/**
 * 图片优化脚本
 * 
 * 功能：
 * - 将 public/img 下的图片转换为 WebP 格式
 * - 自动检测并保留 alpha 通道
 * - 使用有损压缩
 * - 跳过已处理的图片
 * - 更新 js/tsx/yml 文件中的引用
 * - 生成详细的处理报告
 * 
 * 使用方法：
 * node scripts/optimize-images.js [--alpha=auto|always|never] [--quality=0-100] [--dry-run]
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// 配置
const CONFIG = {
    // 源图片目录
    sourceDir: path.join(__dirname, '../../frontend/public/img'),
    // 需要更新引用的文件类型
    updateFilePatterns: [
        path.join(__dirname, '../../frontend/src/**/*.js'),
        path.join(__dirname, '../../frontend/src/**/*.jsx'),
        path.join(__dirname, '../../frontend/src/**/*.ts'),
        path.join(__dirname, '../../frontend/src/**/*.tsx'),
        path.join(__dirname, '../../frontend/src/**/*.yml'),
        path.join(__dirname, '../../frontend/src/**/*.yaml'),
    ],
    // 支持的源图片格式
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'],
    // 已处理图片的记录文件
    processedLogFile: path.join(__dirname, '../../.image-optimization-log.json'),
    // 默认配置
    defaultAlphaMode: 'auto', // auto | always | never
    defaultQuality: 80, // 0-100
    dryRun: false,
    checkUnused: false,
    trashUnused: false,
};

// 檢測未使用的圖片
async function getUnusedImages(imageFiles, config) {
    console.log('🔍 正在掃描源代碼以檢測未使用的圖片...');

    // 獲取所有需要掃描的文件
    const filesToScan = [];
    for (const pattern of config.updateFilePatterns) {
        const matches = await glob(pattern);
        filesToScan.push(...matches);
    }

    // 讀取所有文件內容
    let combinedContent = '';
    for (const file of filesToScan) {
        try {
            const content = await fs.readFile(file, 'utf-8');
            combinedContent += content + '\n';
        } catch (error) {
            // 跳過讀取失敗的文件
        }
    }

    const unusedFiles = [];
    const usedFiles = new Set();

    for (const imagePath of imageFiles) {
        const relativePath = path.relative(config.sourceDir, imagePath);
        const ext = path.extname(imagePath);
        const nameWithoutExt = path.basename(imagePath, ext);

        // 匹配模式：可以是完整路徑、相對路徑、或者去掉後綴的名子
        const searchPatterns = [
            relativePath,
            relativePath.replace(/\\/g, '/'), // 確保斜槓方向
            nameWithoutExt,
            relativePath.replace(ext, ''),
        ];

        let isUsed = false;
        for (const pattern of searchPatterns) {
            if (combinedContent.includes(pattern)) {
                isUsed = true;
                break;
            }
        }

        if (!isUsed) {
            unusedFiles.push(relativePath);
        } else {
            usedFiles.add(relativePath);
        }
    }

    return { unusedFiles, usedFiles };
}

// 加载配置文件
async function loadConfig() {
    const configPath = path.join(__dirname, 'image-optimization-config.json');
    try {
        const content = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

// 解析命令行参数
async function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...CONFIG };
    const userConfig = await loadConfig();

    // 检查是否使用预设
    const presetArg = args.find(arg => arg.startsWith('--preset='));
    if (presetArg && userConfig) {
        const presetName = presetArg.split('=')[1];
        const preset = userConfig.presets?.[presetName];
        if (preset) {
            console.log(`📦 使用预设: ${presetName}`);
            console.log(`   ${preset.description}\n`);
            config.defaultAlphaMode = preset.alphaMode;
            config.defaultQuality = preset.quality;
        } else {
            console.warn(`⚠️  预设 "${presetName}" 不存在，使用默认配置\n`);
        }
    } else if (userConfig && !presetArg) {
        // 使用配置文件的默认值
        config.defaultAlphaMode = userConfig.alphaMode || config.defaultAlphaMode;
        config.defaultQuality = userConfig.quality || config.defaultQuality;
    }

    // 命令行参数覆盖配置文件
    args.forEach(arg => {
        if (arg.startsWith('--alpha=')) {
            const mode = arg.split('=')[1];
            if (['auto', 'always', 'never'].includes(mode)) {
                config.defaultAlphaMode = mode;
            }
        } else if (arg.startsWith('--quality=')) {
            const quality = parseInt(arg.split('=')[1]);
            if (quality >= 0 && quality <= 100) {
                config.defaultQuality = quality;
            }
        } else if (arg === '--dry-run') {
            config.dryRun = true;
        } else if (arg === '--check-unused') {
            config.checkUnused = true;
        } else if (arg === '--trash-unused') {
            config.trashUnused = true;
        }
    });

    return config;
}

// 將文件移至回收站 (macOS 專用)
async function moveToTrash(filePath) {
    const { exec } = require('child_process');
    const absolutePath = path.resolve(filePath);
    return new Promise((resolve, reject) => {
        // 使用 osascript 調用 Finder 的刪除功能，這會將文件移至回收站
        exec(`osascript -e 'tell application "Finder" to delete POSIX file "${absolutePath}"'`, (error) => {
            if (error) {
                // 如果 Finder 方法失敗（例如文件權限問題），嘗試直接移動到 .Trash 目錄
                const trashPath = path.join(process.env.HOME, '.Trash', path.basename(filePath));
                fs.rename(absolutePath, trashPath)
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve();
            }
        });
    });
}

// 加载已处理图片记录
async function loadProcessedLog(logFile) {
    try {
        const content = await fs.readFile(logFile, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return {};
    }
}

// 保存已处理图片记录
async function saveProcessedLog(logFile, log) {
    await fs.writeFile(logFile, JSON.stringify(log, null, 2), 'utf-8');
}

// 获取文件的哈希值（用于判断文件是否变化）
async function getFileHash(filePath) {
    const crypto = require('crypto');
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

// 检测图片是否有 alpha 通道
async function hasAlphaChannel(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        return metadata.hasAlpha || false;
    } catch (error) {
        console.error(`检测 alpha 通道失败: ${filePath}`, error.message);
        return false;
    }
}

// 转换图片为 WebP
async function convertToWebP(inputPath, outputPath, options) {
    const { quality, preserveAlpha } = options;

    let sharpInstance = sharp(inputPath);

    const webpOptions = {
        quality,
        lossless: false, // 使用有损压缩
    };

    if (preserveAlpha) {
        webpOptions.alphaQuality = quality;
    }

    await sharpInstance.webp(webpOptions).toFile(outputPath);
}

// 获取所有需要处理的图片
async function getImageFiles(sourceDir, supportedFormats) {
    const files = [];

    async function scanDir(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await scanDir(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (supportedFormats.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    await scanDir(sourceDir);
    return files;
}

// 更新文件中的图片引用
async function updateReferences(oldPath, newPath, updateFilePatterns) {
    const oldRelativePath = oldPath.replace(/^.*\/public\//, '/');
    const newRelativePath = newPath.replace(/^.*\/public\//, '/');

    // 获取所有需要更新的文件
    const filesToUpdate = [];
    for (const pattern of updateFilePatterns) {
        const matches = await glob(pattern);
        filesToUpdate.push(...matches);
    }

    const updatedFiles = [];

    for (const file of filesToUpdate) {
        try {
            let content = await fs.readFile(file, 'utf-8');
            const originalContent = content;

            // 匹配各种可能的引用方式
            const patterns = [
                // 直接路径引用
                new RegExp(oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                // 去掉开头的 / 的引用
                new RegExp(oldRelativePath.substring(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                // img/ 开头的引用
                new RegExp(oldRelativePath.replace('/img/', 'img/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            ];

            for (const pattern of patterns) {
                const replacement = newRelativePath.replace('/img/', pattern.source.includes('img/') && !pattern.source.startsWith('\\/') ? 'img/' : '/img/');
                content = content.replace(pattern, replacement);
            }

            if (content !== originalContent) {
                await fs.writeFile(file, content, 'utf-8');
                updatedFiles.push(file);
            }
        } catch (error) {
            console.error(`更新文件引用失败: ${file}`, error.message);
        }
    }

    return updatedFiles;
}

// 主处理函数
async function processImages(config) {
    console.log('🚀 开始图片优化...\n');
    console.log(`配置:`);
    console.log(`  - Alpha 通道模式: ${config.defaultAlphaMode}`);
    console.log(`  - 壓縮質量: ${config.defaultQuality}`);
    console.log(`  - 未使用檢測: ${config.checkUnused ? '是' : '否'}`);
    console.log(`  - 干運行模式: ${config.dryRun ? '是' : '否'}\n`);

    // 加載已處理記錄
    const processedLog = await loadProcessedLog(config.processedLogFile);

    // 獲取所有圖片文件
    let imageFiles = await getImageFiles(config.sourceDir, config.supportedFormats);
    console.log(`找到 ${imageFiles.length} 個圖片文件\n`);

    // 檢測未使用的圖片
    let unusedData = { unusedFiles: [], usedFiles: new Set() };
    if (config.checkUnused) {
        unusedData = await getUnusedImages(imageFiles, config);

        // 如果需要移至回收站
        if (config.trashUnused && unusedData.unusedFiles.length > 0) {
            if (!config.dryRun) {
                console.log(`🗑️  正在將 ${unusedData.unusedFiles.length} 個未使用圖片移至回收站...`);
                for (const relativePath of unusedData.unusedFiles) {
                    const fullPath = path.join(config.sourceDir, relativePath);
                    try {
                        await moveToTrash(fullPath);
                        console.log(`   [已丟進垃圾桶] ${relativePath}`);
                    } catch (error) {
                        console.error(`   [失敗] 無法移動 ${relativePath}:`, error.message);
                    }
                }
                // 移至回收站後，更新待處理的圖片列表（排除已刪除的）
                const trashedSet = new Set(unusedData.unusedFiles);
                imageFiles = imageFiles.filter(img => !trashedSet.has(path.relative(config.sourceDir, img)));
            } else {
                console.log(`🔍 [干運行] 將會把 ${unusedData.unusedFiles.length} 個未使用圖片移至回收站`);
            }
        }
    }

    // 處理統計
    const stats = {
        totalOriginalCount: imageFiles.length + (config.trashUnused && !config.dryRun ? unusedData.unusedFiles.length : 0),
        total: imageFiles.length,
        processed: 0,
        skipped: 0,
        failed: 0,
        trashedCount: config.trashUnused && !config.dryRun ? unusedData.unusedFiles.length : 0,
        totalOriginalSize: 0,
        totalOptimizedSize: 0,
        unusedCount: unusedData.unusedFiles.length,
        unusedFiles: unusedData.unusedFiles,
        details: [],
    };

    for (const imagePath of imageFiles) {
        const relativePath = path.relative(config.sourceDir, imagePath);
        const ext = path.extname(imagePath);
        const nameWithoutExt = path.basename(imagePath, ext);
        const dir = path.dirname(imagePath);
        const outputPath = path.join(dir, `${nameWithoutExt}.webp`);

        try {
            // 检查是否已处理
            const currentHash = await getFileHash(imagePath);
            const logKey = relativePath;

            if (processedLog[logKey] && processedLog[logKey].hash === currentHash) {
                console.log(`⏭️  跳过 (已处理): ${relativePath}`);
                stats.skipped++;
                continue;
            }

            // 检测 alpha 通道
            let preserveAlpha = false;
            const hasAlpha = await hasAlphaChannel(imagePath);

            if (config.defaultAlphaMode === 'always') {
                preserveAlpha = true;
            } else if (config.defaultAlphaMode === 'auto') {
                preserveAlpha = hasAlpha;
            }

            // 获取原始文件大小
            const originalStats = await fs.stat(imagePath);
            const originalSize = originalStats.size;

            if (!config.dryRun) {
                // 转换图片
                await convertToWebP(imagePath, outputPath, {
                    quality: config.defaultQuality,
                    preserveAlpha,
                });

                // 获取优化后文件大小
                const optimizedStats = await fs.stat(outputPath);
                const optimizedSize = optimizedStats.size;

                // 更新文件引用
                const updatedFiles = await updateReferences(imagePath, outputPath, config.updateFilePatterns);

                // 删除原始文件
                await fs.unlink(imagePath);

                // 记录处理结果
                processedLog[logKey] = {
                    hash: currentHash,
                    processedAt: new Date().toISOString(),
                    originalSize,
                    optimizedSize,
                    hasAlpha,
                    preservedAlpha: preserveAlpha,
                    quality: config.defaultQuality,
                };

                const savedPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

                stats.totalOriginalSize += originalSize;
                stats.totalOptimizedSize += optimizedSize;
                stats.processed++;

                stats.details.push({
                    file: relativePath,
                    originalSize,
                    optimizedSize,
                    savedPercent,
                    hasAlpha,
                    preservedAlpha: preserveAlpha,
                    quality: config.defaultQuality,
                    updatedFiles: updatedFiles.length,
                });

                console.log(`✅ 已处理: ${relativePath}`);
                console.log(`   原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
                console.log(`   优化后: ${(optimizedSize / 1024).toFixed(2)} KB`);
                console.log(`   节省: ${savedPercent}%`);
                console.log(`   Alpha 通道: ${hasAlpha ? '有' : '无'} | 保留: ${preserveAlpha ? '是' : '否'}`);
                console.log(`   压缩质量: ${config.defaultQuality}`);
                console.log(`   更新引用: ${updatedFiles.length} 个文件\n`);
            } else {
                console.log(`🔍 [干运行] 将处理: ${relativePath}`);
                console.log(`   原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
                console.log(`   Alpha 通道: ${hasAlpha ? '有' : '无'} | 将保留: ${preserveAlpha ? '是' : '否'}`);
                console.log(`   压缩质量: ${config.defaultQuality}\n`);

                stats.processed++;
            }

        } catch (error) {
            console.error(`❌ 处理失败: ${relativePath}`, error.message);
            stats.failed++;
        }
    }

    // 保存处理记录
    if (!config.dryRun) {
        await saveProcessedLog(config.processedLogFile, processedLog);
    }

    // 打印总结报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 处理报告');
    console.log('='.repeat(60));
    console.log(`总文件数: ${stats.total}`);
    console.log(`已处理: ${stats.processed}`);
    console.log(`跳过: ${stats.skipped}`);
    console.log(`失敗: ${stats.failed}`);

    if (config.trashUnused) {
        console.log(`已丟進垃圾桶: ${stats.trashedCount}`);
    }

    if (config.checkUnused) {
        console.log(`未使用圖片: ${stats.unusedCount}`);
        if (stats.unusedCount > 0) {
            console.log('\n🚫 可能未使用的圖片 (未在源代碼中找到引用):');
            stats.unusedFiles.forEach(file => console.log(`   - ${file}`));
        }
    }

    if (!config.dryRun && stats.processed > 0) {
        const totalSavedPercent = ((stats.totalOriginalSize - stats.totalOptimizedSize) / stats.totalOriginalSize * 100).toFixed(2);
        console.log(`\n原始总大小: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`优化后总大小: ${(stats.totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`总节省: ${totalSavedPercent}%`);
        console.log(`节省空间: ${((stats.totalOriginalSize - stats.totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB`);

        console.log('\n详细信息:');
        stats.details.forEach((detail, index) => {
            console.log(`\n${index + 1}. ${detail.file}`);
            console.log(`   节省: ${detail.savedPercent}%`);
            console.log(`   Alpha: ${detail.hasAlpha ? '有' : '无'} | 保留: ${detail.preservedAlpha ? '是' : '否'}`);
            console.log(`   质量: ${detail.quality}`);
            console.log(`   更新引用: ${detail.updatedFiles} 个文件`);
        });
    }

    console.log('\n' + '='.repeat(60));

    if (config.dryRun) {
        console.log('\n💡 这是干运行模式，没有实际修改文件');
        console.log('   移除 --dry-run 参数以执行实际优化');
    }
}

// 运行脚本
(async () => {
    try {
        const config = await parseArgs();
        await processImages(config);
    } catch (error) {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    }
})();
