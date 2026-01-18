#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   部署統計資訊${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 拉取最新的 notes
git fetch origin refs/notes/deployments:refs/notes/deployments 2>/dev/null

# 統計總部署次數
TOTAL_DEPLOYMENTS=$(git log --show-notes=deployments --all | grep -c "部署成功\|部署失敗")
SUCCESS_COUNT=$(git log --show-notes=deployments --all | grep -c "🚀 部署成功")
FAILURE_COUNT=$(git log --show-notes=deployments --all | grep -c "❌ 部署失敗")

echo -e "${CYAN}總部署次數:${NC} $TOTAL_DEPLOYMENTS"
echo -e "${GREEN}成功次數:${NC} $SUCCESS_COUNT"
echo -e "${RED}失敗次數:${NC} $FAILURE_COUNT"

if [ $TOTAL_DEPLOYMENTS -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=2; $SUCCESS_COUNT * 100 / $TOTAL_DEPLOYMENTS" | bc)
    echo -e "${YELLOW}成功率:${NC} ${SUCCESS_RATE}%"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   最近的部署記錄${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 顯示最近 5 次部署
git log --show-notes=deployments --all -20 --pretty=format:"%C(yellow)%h%Creset - %C(cyan)%s%Creset %C(green)(%cr)%Creset" --notes=deployments | grep -B 1 "部署成功\|部署失敗" | head -15

echo ""
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Dev 環境部署${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 顯示 dev 環境的最近部署
git log --show-notes=deployments --all --grep="環境: dev" -5 --pretty=format:"%C(yellow)%h%Creset - %C(cyan)%ad%Creset" --date=short --notes=deployments | head -10

echo ""
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Main 環境部署${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 顯示 main 環境的最近部署
git log --show-notes=deployments --all --grep="環境: main" -5 --pretty=format:"%C(yellow)%h%Creset - %C(cyan)%ad%Creset" --date=short --notes=deployments | head -10

echo ""
echo ""
