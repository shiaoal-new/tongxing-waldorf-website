#!/usr/bin/env node

/**
 * Lighthouse 性能评估脚本
 * 
 * 用法:
 *   npm run lighthouse              # 评估所有页面
 *   npm run lighthouse -- /         # 评估首页
 *   npm run lighthouse -- / /about  # 评估多个页面
 *   npm run lighthouse -- --all     # 明确评估所有页面
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'measurement_result');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

// 動態獲取要評估的頁面
function getAvailablePages() {
    const PAGES_DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'pages');
    const PAGES_SRC_DIR = path.join(__dirname, '..', 'src', 'pages');
    const pages = ['/'];

    const excludedSlugs = [
        'index',
        'colors',
        'layout-spacing',
        'typography',
        'micro-interactions',
        '_app',
        '_document',
        '[slug]'
    ];

    // 1. 從資料目錄獲取 (動態路由)
    if (fs.existsSync(PAGES_DATA_DIR)) {
        fs.readdirSync(PAGES_DATA_DIR).forEach(file => {
            if (file.endsWith('.yml') || file.endsWith('.yaml') || file.endsWith('.md')) {
                const slug = file.replace(/\.(yml|yaml|md)$/, '');
                if (!excludedSlugs.includes(slug) && !pages.includes(`/${slug}`)) {
                    pages.push(`/${slug}`);
                }
            }
        });
    }

    // 2. 從 src/pages 獲取 (固定路由)
    if (fs.existsSync(PAGES_SRC_DIR)) {
        fs.readdirSync(PAGES_SRC_DIR).forEach(file => {
            // 只處理檔案，不處理目錄 (暫不考慮嵌套目錄)
            const fullPath = path.join(PAGES_SRC_DIR, file);
            if (fs.statSync(fullPath).isFile() && (file.endsWith('.js') || file.endsWith('.tsx'))) {
                const name = file.replace(/\.(js|tsx)$/, '');
                if (!excludedSlugs.includes(name) && !pages.includes(`/${name}`)) {
                    pages.push(`/${name}`);
                }
            }
        });
    }

    return pages;
}

const ALL_PAGES = getAvailablePages();

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 解析命令行参数
const args = process.argv.slice(2);
let pagesToAudit = [];

if (args.length === 0 || args.includes('--all')) {
    pagesToAudit = ALL_PAGES;
    console.log('📊 评估所有页面...\n');
} else {
    pagesToAudit = args.filter(arg => !arg.startsWith('--'));
    console.log(`📊 评估指定页面: ${pagesToAudit.join(', ')}\n`);
}

// 运行 Lighthouse 评估
async function runLighthouse(page) {
    const url = `${BASE_URL}${page}`;
    const pageName = page === '/' ? 'index' : page.replace(/\//g, '_');
    const baseOutputPath = path.join(OUTPUT_DIR, `lighthouse_${pageName}_${TIMESTAMP}`);
    const outputPath = `${baseOutputPath}.report.json`;
    const htmlOutputPath = `${baseOutputPath}.report.html`;

    console.log(`🔍 正在评估: ${url}`);

    return new Promise((resolve, reject) => {
        const lighthouse = spawn('npx', [
            'lighthouse',
            url,
            '--output=json',
            '--output=html',
            `--output-path=${baseOutputPath}`,
            '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"',
            '--only-categories=performance,accessibility,best-practices,seo',
            '--preset=desktop',
        ], {
            stdio: 'inherit',
            shell: true,
        });

        lighthouse.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ 完成: ${page}`);
                console.log(`   JSON 报告: ${outputPath}`);
                console.log(`   HTML 报告: ${htmlOutputPath}\n`);
                resolve({ page, outputPath, htmlOutputPath });
            } else {
                console.error(`❌ 失败: ${page} (退出码: ${code})\n`);
                reject(new Error(`Lighthouse failed for ${page}`));
            }
        });

        lighthouse.on('error', (err) => {
            console.error(`❌ 错误: ${page}`, err);
            reject(err);
        });
    });
}

// 生成摘要报告
function generateSummary(results) {
    const summaryPath = path.join(OUTPUT_DIR, `lighthouse_summary_${TIMESTAMP}.md`);

    let summary = `# Lighthouse 评估报告\n\n`;
    summary += `**评估时间**: ${new Date().toLocaleString('zh-CN')}\n`;
    summary += `**基础 URL**: ${BASE_URL}\n\n`;
    summary += `## 评估结果\n\n`;

    results.forEach(({ page, outputPath }) => {
        try {
            const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
            const categories = data.categories;

            summary += `### ${page}\n\n`;
            summary += `| 类别 | 分数 |\n`;
            summary += `|------|------|\n`;

            if (categories.performance) {
                summary += `| 性能 (Performance) | ${Math.round(categories.performance.score * 100)} |\n`;
            }
            if (categories.accessibility) {
                summary += `| 可访问性 (Accessibility) | ${Math.round(categories.accessibility.score * 100)} |\n`;
            }
            if (categories['best-practices']) {
                summary += `| 最佳实践 (Best Practices) | ${Math.round(categories['best-practices'].score * 100)} |\n`;
            }
            if (categories.seo) {
                summary += `| SEO | ${Math.round(categories.seo.score * 100)} |\n`;
            }

            summary += `\n`;
        } catch (err) {
            console.error(`读取报告失败: ${outputPath}`, err);
        }
    });

    fs.writeFileSync(summaryPath, summary);
    console.log(`\n📄 摘要报告已生成: ${summaryPath}`);
}

// 生成精简版报告(移除 base64 图片数据)
function generateCompactReports(results) {
    console.log('\n🔧 生成精简版报告(适合 LLM 分析)...');

    results.forEach(({ page, outputPath }) => {
        try {
            const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

            // 移除 base64 图片数据
            if (data.audits) {
                // 移除 screenshot-thumbnails 中的 base64 数据
                if (data.audits['screenshot-thumbnails'] &&
                    data.audits['screenshot-thumbnails'].details &&
                    data.audits['screenshot-thumbnails'].details.items) {
                    data.audits['screenshot-thumbnails'].details.items =
                        data.audits['screenshot-thumbnails'].details.items.map(item => ({
                            timing: item.timing,
                            timestamp: item.timestamp,
                            data: '[base64 image removed]'
                        }));
                }

                // 移除 final-screenshot 中的 base64 数据
                if (data.audits['final-screenshot'] &&
                    data.audits['final-screenshot'].details &&
                    data.audits['final-screenshot'].details.data) {
                    data.audits['final-screenshot'].details.data = '[base64 image removed]';
                }

                // 移除 full-page-screenshot 中的 base64 数据
                if (data.audits['full-page-screenshot'] &&
                    data.audits['full-page-screenshot'].details &&
                    data.audits['full-page-screenshot'].details.screenshot) {
                    data.audits['full-page-screenshot'].details.screenshot.data = '[base64 image removed]';
                }
            }

            // 生成精简版文件名
            const compactPath = outputPath.replace('.report.json', '.compact.json');

            // 写入精简版报告
            fs.writeFileSync(compactPath, JSON.stringify(data, null, 2));

            // 计算文件大小
            const originalSize = fs.statSync(outputPath).size;
            const compactSize = fs.statSync(compactPath).size;
            const savedBytes = originalSize - compactSize;
            const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

            console.log(`   ${page}:`);
            console.log(`      原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
            console.log(`      精简大小: ${(compactSize / 1024).toFixed(2)} KB`);
            console.log(`      节省空间: ${(savedBytes / 1024).toFixed(2)} KB (${savedPercent}%)`);
            console.log(`      精简报告: ${compactPath}`);
        } catch (err) {
            console.error(`生成精简报告失败: ${outputPath}`, err);
        }
    });
}

// 主函数
async function main() {
    console.log('🚀 开始 Lighthouse 评估\n');
    console.log(`📍 基础 URL: ${BASE_URL}`);
    console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

    const results = [];

    for (const page of pagesToAudit) {
        try {
            const result = await runLighthouse(page);
            results.push(result);
        } catch (err) {
            console.error(`跳过页面 ${page}，继续下一个...\n`);
        }
    }

    if (results.length > 0) {
        generateSummary(results);
        generateCompactReports(results);

        // 推送數據到 Google Spreadsheet (如果有提供 URL)
        const gasUrl = process.env.GOOGLE_SHEETS_API_URL;
        if (gasUrl) {
            console.log('\n📊 正在將數據推送到 Google Spreadsheet...');
            const resultsToPush = results.map(async (res) => {
                try {
                    // 獲取精簡版檔名
                    const compactFileName = path.basename(res.outputPath).replace('.report.json', '.compact.json');

                    const payload = {
                        page: res.page,
                        scores: {
                            performance: Math.round(data.categories.performance.score * 100),
                            accessibility: Math.round(data.categories.accessibility.score * 100),
                            bestPractices: Math.round(data.categories['best-practices'].score * 100),
                            seo: Math.round(data.categories.seo.score * 100)
                        },
                        commit: process.env.GITHUB_SHA || 'local',
                        branch: process.env.GITHUB_REF_NAME || 'local',
                        runId: process.env.GITHUB_RUN_ID || 'local',
                        repo: process.env.GITHUB_REPOSITORY || '',
                        compactReport: compactFileName
                    };

                    const response = await fetch(gasUrl, {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        console.log(`   ✅ 已推送: ${res.page}`);
                    } else {
                        console.error(`   ❌ 推送失敗: ${res.page} (${response.statusText})`);
                    }
                } catch (err) {
                    console.error(`   ❌ 推送錯誤: ${res.page}`, err.message);
                }
            });
            await Promise.all(resultsToPush);
        }

        console.log('\n✨ 所有评估完成！');
    } else {
        console.log('\n⚠️  没有成功完成的评估');
    }
}

main().catch(err => {
    console.error('❌ 脚本执行失败:', err);
    process.exit(1);
});
