#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   最近的部署記錄${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 先拉取最新的 notes
echo -e "${YELLOW}正在拉取最新的部署記錄...${NC}"
git fetch origin refs/notes/deployments:refs/notes/deployments 2>/dev/null

echo ""

# 顯示最近 10 個 commits 的部署記錄
git log --show-notes=deployments -10 --pretty=format:"%C(yellow)%h%Creset - %C(cyan)%s%Creset %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset" --notes=deployments | while IFS= read -r line; do
    if [[ $line == *"🚀 部署成功"* ]]; then
        echo -e "${GREEN}${line}${NC}"
    elif [[ $line == *"❌ 部署失敗"* ]]; then
        echo -e "${RED}${line}${NC}"
    else
        echo "$line"
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "使用方式:"
echo -e "  ${YELLOW}git deploy-log${NC}       - 查看最近的部署記錄"
echo -e "  ${YELLOW}git deploy-show HEAD${NC} - 查看當前 commit 的部署記錄"
echo -e "  ${YELLOW}git deploy-show <hash>${NC} - 查看特定 commit 的部署記錄"
echo ""
