#!/usr/bin/env node

/**
 * Lighthouse JSON 報告精简工具
 * 
 * 用法:
 *   node scripts/compact-lighthouse.js <path-to-json-report>
 *   npm run lighthouse:compact -- <path-to-json-report>
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
    console.error('❌ 请提供 Lighthouse JSON 报告的路径');
    process.exit(1);
}

const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

if (!fs.existsSync(absolutePath)) {
    console.error(`❌ 文件不存在: ${absolutePath}`);
    process.exit(1);
}

try {
    console.log(`🔍 正在处理: ${absolutePath}`);
    const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    // 移除 base64 图片数据
    let removedCount = 0;
    if (data.audits) {
        // 1. 移除 screenshot-thumbnails 中的 base64 数据
        if (data.audits['screenshot-thumbnails'] &&
            data.audits['screenshot-thumbnails'].details &&
            data.audits['screenshot-thumbnails'].details.items) {
            data.audits['screenshot-thumbnails'].details.items =
                data.audits['screenshot-thumbnails'].details.items.map(item => {
                    if (item.data) removedCount++;
                    return {
                        ...item,
                        data: '[base64 image removed]'
                    };
                });
        }

        // 2. 移除 final-screenshot 中的 base64 数据
        if (data.audits['final-screenshot'] &&
            data.audits['final-screenshot'].details &&
            data.audits['final-screenshot'].details.data) {
            data.audits['final-screenshot'].details.data = '[base64 image removed]';
            removedCount++;
        }

        // 3. 移除 full-page-screenshot 中的 base64 数据
        if (data.audits['full-page-screenshot'] &&
            data.audits['full-page-screenshot'].details &&
            data.audits['full-page-screenshot'].details.screenshot) {
            data.audits['full-page-screenshot'].details.screenshot.data = '[base64 image removed]';
            removedCount++;
        }
    }

    // 生成精简版文件名
    const compactPath = absolutePath.replace('.json', '.compact.json');
    if (compactPath === absolutePath) {
        // 如果原文件名不带 .json (不太可能)，则添加后缀
        console.warn('⚠️ 原文件名不带 .json，将保存为 .compact.json');
        compactPath = absolutePath + '.compact.json';
    }

    // 写入精简版报告
    fs.writeFileSync(compactPath, JSON.stringify(data, null, 2));

    // 计算文件大小
    const originalSize = fs.statSync(absolutePath).size;
    const compactSize = fs.statSync(compactPath).size;
    const savedBytes = originalSize - compactSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    console.log(`✅ 处理完成！`);
    console.log(`   原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   精简大小: ${(compactSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   节省空间: ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)`);
    console.log(`   精简报告: ${compactPath}`);

} catch (err) {
    console.error('❌ 精简报告失败:', err);
    process.exit(1);
}
