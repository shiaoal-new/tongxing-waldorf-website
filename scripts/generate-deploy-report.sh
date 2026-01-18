#!/bin/bash

# 生成部署歷史 HTML 報告

OUTPUT_FILE="deployment-report.html"

# 拉取最新的 notes
git fetch origin refs/notes/deployments:refs/notes/deployments 2>/dev/null

# 開始生成 HTML
cat > "$OUTPUT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>部署歷史報告</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 2rem;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card .number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .label {
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .stat-card.success .number { color: #28a745; }
        .stat-card.failure .number { color: #dc3545; }
        .stat-card.total .number { color: #667eea; }
        .stat-card.rate .number { color: #ffc107; }
        
        .timeline {
            padding: 2rem;
        }
        
        .timeline-item {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
            position: relative;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: 29px;
            top: 60px;
            bottom: -20px;
            width: 2px;
            background: #e9ecef;
        }
        
        .timeline-item:last-child::before {
            display: none;
        }
        
        .timeline-icon {
            flex-shrink: 0;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            background: white;
            border: 3px solid;
            z-index: 1;
        }
        
        .timeline-icon.success {
            border-color: #28a745;
            background: #d4edda;
        }
        
        .timeline-icon.failure {
            border-color: #dc3545;
            background: #f8d7da;
        }
        
        .timeline-icon.no-deploy {
            border-color: #6c757d;
            background: #e9ecef;
        }
        
        .timeline-content {
            flex: 1;
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid;
        }
        
        .timeline-content.success { border-color: #28a745; }
        .timeline-content.failure { border-color: #dc3545; }
        .timeline-content.no-deploy { border-color: #6c757d; }
        
        .commit-hash {
            font-family: 'Monaco', 'Courier New', monospace;
            background: #fff;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #667eea;
            font-weight: bold;
        }
        
        .commit-message {
            font-size: 1.1rem;
            margin: 0.5rem 0;
            color: #212529;
        }
        
        .commit-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.9rem;
            color: #6c757d;
            margin-top: 0.5rem;
        }
        
        .commit-meta span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .deploy-info {
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .deploy-info div {
            margin: 0.25rem 0;
        }
        
        .deploy-info strong {
            color: #495057;
        }
        
        .filter-buttons {
            display: flex;
            gap: 1rem;
            padding: 1rem 2rem;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 0.5rem 1rem;
            border: 2px solid #dee2e6;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.9rem;
        }
        
        .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 部署歷史報告</h1>
            <p>Tongxing Waldorf Website - Deployment History</p>
        </div>
        
        <div class="stats" id="stats">
            <!-- 統計資料將由 JavaScript 生成 -->
        </div>
        
        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterCommits('all')">全部</button>
            <button class="filter-btn" onclick="filterCommits('success')">✅ 成功</button>
            <button class="filter-btn" onclick="filterCommits('failure')">❌ 失敗</button>
            <button class="filter-btn" onclick="filterCommits('no-deploy')">⚪ 未部署</button>
        </div>
        
        <div class="timeline" id="timeline">
            <!-- Timeline 將由 JavaScript 生成 -->
        </div>
    </div>
    
    <script>
        const commits = [
EOF

# 獲取 commits 並生成 JavaScript 數據
git log --all --pretty=format:"%H|%h|%ad|%s|%an|%cr|%ae" --date=iso -50 | while IFS='|' read -r full_hash short_hash date subject author relative_time email; do
    # 獲取 note
    note=$(git notes --ref=deployments show "$full_hash" 2>/dev/null | sed 's/"/\\"/g' | tr '\n' '|')
    
    # 轉義特殊字符
    subject=$(echo "$subject" | sed 's/"/\\"/g')
    author=$(echo "$author" | sed 's/"/\\"/g')
    
    # 判斷部署狀態
    if echo "$note" | grep -q "🚀 部署成功"; then
        status="success"
        status_text="部署成功"
    elif echo "$note" | grep -q "❌ 部署失敗"; then
        status="failure"
        status_text="部署失敗"
    else
        status="no-deploy"
        status_text="未部署"
        note=""
    fi
    
    # 輸出 JavaScript 對象
    cat >> "$OUTPUT_FILE" << COMMIT_EOF
            {
                fullHash: "$full_hash",
                shortHash: "$short_hash",
                date: "$date",
                subject: "$subject",
                author: "$author",
                relativeTime: "$relative_time",
                email: "$email",
                status: "$status",
                statusText: "$status_text",
                note: "$note"
            },
COMMIT_EOF
done

# 完成 JavaScript 和 HTML
cat >> "$OUTPUT_FILE" << 'EOF'
        ];
        
        // 生成統計資料
        function generateStats() {
            const total = commits.length;
            const success = commits.filter(c => c.status === 'success').length;
            const failure = commits.filter(c => c.status === 'failure').length;
            const rate = total > 0 ? ((success / (success + failure)) * 100).toFixed(1) : 0;
            
            document.getElementById('stats').innerHTML = `
                <div class="stat-card total">
                    <div class="number">${total}</div>
                    <div class="label">總 Commits</div>
                </div>
                <div class="stat-card success">
                    <div class="number">${success}</div>
                    <div class="label">部署成功</div>
                </div>
                <div class="stat-card failure">
                    <div class="number">${failure}</div>
                    <div class="label">部署失敗</div>
                </div>
                <div class="stat-card rate">
                    <div class="number">${rate}%</div>
                    <div class="label">成功率</div>
                </div>
            `;
        }
        
        // 生成 timeline
        function generateTimeline(filter = 'all') {
            const filteredCommits = filter === 'all' 
                ? commits 
                : commits.filter(c => c.status === filter);
            
            const timeline = document.getElementById('timeline');
            timeline.innerHTML = filteredCommits.map(commit => {
                const icon = commit.status === 'success' ? '🚀' 
                           : commit.status === 'failure' ? '❌' 
                           : '⚪';
                
                const noteHtml = commit.note ? `
                    <div class="deploy-info">
                        ${commit.note.split('|').filter(line => line.trim()).map(line => 
                            `<div>${line.trim()}</div>`
                        ).join('')}
                    </div>
                ` : '';
                
                return `
                    <div class="timeline-item" data-status="${commit.status}">
                        <div class="timeline-icon ${commit.status}">
                            ${icon}
                        </div>
                        <div class="timeline-content ${commit.status}">
                            <div>
                                <span class="commit-hash">${commit.shortHash}</span>
                            </div>
                            <div class="commit-message">${commit.subject}</div>
                            <div class="commit-meta">
                                <span>👤 ${commit.author}</span>
                                <span>📅 ${commit.date}</span>
                                <span>⏰ ${commit.relativeTime}</span>
                            </div>
                            ${noteHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // 過濾功能
        function filterCommits(filter) {
            // 更新按鈕狀態
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // 重新生成 timeline
            generateTimeline(filter);
        }
        
        // 初始化
        generateStats();
        generateTimeline();
    </script>
</body>
</html>
EOF

echo "✅ 部署報告已生成: $OUTPUT_FILE"
echo "🌐 在瀏覽器中打開查看: open $OUTPUT_FILE"
