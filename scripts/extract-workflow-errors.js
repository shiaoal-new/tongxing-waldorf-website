#!/usr/bin/env node

/**
 * 從 GitHub Actions 日誌中提取關鍵錯誤資訊
 * 用於創建 Linear issue
 */

const https = require('https');

async function fetchJSON(url, token) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'GitHub-Actions-Linear-Integration',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function getWorkflowLogs(repo, runId, token) {
    const jobsUrl = `https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs`;
    const jobs = await fetchJSON(jobsUrl, token);

    const errors = [];

    for (const job of jobs.jobs) {
        if (job.conclusion === 'failure') {
            const failedSteps = job.steps.filter(step => step.conclusion === 'failure');

            for (const step of failedSteps) {
                // 獲取步驟日誌
                const logUrl = `https://api.github.com/repos/${repo}/actions/jobs/${job.id}/logs`;

                try {
                    const logs = await new Promise((resolve, reject) => {
                        https.get(logUrl, {
                            headers: {
                                'Authorization': `token ${token}`,
                                'User-Agent': 'GitHub-Actions-Linear-Integration'
                            }
                        }, (res) => {
                            let data = '';
                            res.on('data', (chunk) => data += chunk);
                            res.on('end', () => resolve(data));
                        }).on('error', reject);
                    });

                    // 提取錯誤相關的行
                    const errorLines = extractErrorLines(logs, step.name);

                    errors.push({
                        job: job.name,
                        step: step.name,
                        startedAt: step.started_at,
                        completedAt: step.completed_at,
                        errorLines: errorLines
                    });
                } catch (e) {
                    console.error(`無法獲取日誌: ${e.message}`);
                }
            }
        }
    }

    return errors;
}

function extractErrorLines(logs, stepName) {
    const lines = logs.split('\n');
    const errorPatterns = [
        /error:/i,
        /failed/i,
        /exception/i,
        /fatal:/i,
        /\[error\]/i,
        /npm ERR!/i,
        /Error:/,
        /TypeError:/,
        /ReferenceError:/,
        /SyntaxError:/,
        /exit code [1-9]/i
    ];

    const errorLines = [];
    const contextLines = 3; // 錯誤前後的上下文行數

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (errorPatterns.some(pattern => pattern.test(line))) {
            // 添加上下文
            const start = Math.max(0, i - contextLines);
            const end = Math.min(lines.length, i + contextLines + 1);

            for (let j = start; j < end; j++) {
                if (!errorLines.includes(lines[j])) {
                    errorLines.push(lines[j]);
                }
            }
        }
    }

    // 限制錯誤行數,避免太長
    return errorLines.slice(0, 50);
}

function formatErrorsForLinear(errors) {
    if (errors.length === 0) {
        return "無法提取詳細錯誤日誌,請查看 workflow 運行詳情。";
    }

    let markdown = '';

    for (const error of errors) {
        markdown += `### ❌ ${error.job} - ${error.step}\n\n`;
        markdown += `**開始時間:** ${error.startedAt}\n`;
        markdown += `**結束時間:** ${error.completedAt}\n\n`;

        if (error.errorLines.length > 0) {
            markdown += '**錯誤日誌:**\n\n```\n';
            markdown += error.errorLines.join('\n');
            markdown += '\n```\n\n';
        }

        markdown += '---\n\n';
    }

    return markdown;
}

async function main() {
    const repo = process.env.GITHUB_REPOSITORY;
    const runId = process.env.WORKFLOW_RUN_ID;
    const token = process.env.GITHUB_TOKEN;

    if (!repo || !runId || !token) {
        console.error('缺少必要的環境變數');
        process.exit(1);
    }

    try {
        console.log('📥 正在獲取 workflow 錯誤日誌...');
        const errors = await getWorkflowLogs(repo, runId, token);

        console.log('📝 格式化錯誤資訊...');
        const formattedErrors = formatErrorsForLinear(errors);

        // 輸出到文件供後續步驟使用
        const fs = require('fs');
        fs.writeFileSync('/tmp/error-log.md', formattedErrors);

        console.log('✅ 錯誤日誌已提取');
        console.log(`找到 ${errors.length} 個失敗的步驟`);
    } catch (error) {
        console.error('❌ 提取錯誤日誌失敗:', error);
        // 創建一個基本的錯誤訊息
        const fs = require('fs');
        fs.writeFileSync('/tmp/error-log.md', '無法提取詳細錯誤日誌,請查看 workflow 運行詳情。');
    }
}

if (require.main === module) {
    main();
}

module.exports = { getWorkflowLogs, extractErrorLines, formatErrorsForLinear };
