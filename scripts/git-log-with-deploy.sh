#!/bin/bash

# Git Pretty Log with Deployment Status
# 這個腳本會在 git log 中自動顯示部署狀態的 emoji

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 先拉取最新的 notes
git fetch origin refs/notes/deployments:refs/notes/deployments 2>/dev/null

# 獲取所有 commits 和它們的 notes
git log --all --pretty=format:"%H|%h|%ad|%s|%an|%cr" --date=short -50 | while IFS='|' read -r full_hash short_hash date subject author relative_time; do
    # 檢查這個 commit 是否有部署記錄
    note=$(git notes --ref=deployments show "$full_hash" 2>/dev/null)
    
    # 根據 note 內容決定 emoji
    emoji=""
    status_color="$NC"
    
    if echo "$note" | grep -q "🚀 部署成功"; then
        emoji="🚀"
        status_color="$GREEN"
    elif echo "$note" | grep -q "❌ 部署失敗"; then
        emoji="❌"
        status_color="$RED"
    else
        emoji="  "  # 兩個空格,保持對齊
        status_color="$NC"
    fi
    
    # 輸出格式化的 log
    echo -e "${status_color}${emoji}${NC} ${YELLOW}${short_hash}${NC} ${CYAN}${date}${NC} - ${subject} ${BLUE}(${relative_time})${NC} ${GREEN}<${author}>${NC}"
done
