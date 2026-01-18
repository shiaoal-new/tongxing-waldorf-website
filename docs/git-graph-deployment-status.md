# 在 IDE Git Graph 中顯示部署狀態

## 問題說明

大多數 IDE 的 Git Graph(包括 Antigravity IDE)不原生支持顯示 Git Notes,因此無法直接在圖形界面中看到部署狀態。

## 解決方案

### 方案 1: 使用自定義 Git Log 腳本 (推薦)

我們創建了一個腳本,可以在命令行中以美化的方式顯示帶有部署狀態 emoji 的 commit 歷史:

```bash
# 使用腳本
./scripts/git-log-with-deploy.sh

# 或使用 Git alias
git lsd
```

**輸出範例:**
```
🚀 c3b1fe1 2026-01-18 - 解決 GitHub Actions 權限問題 (5 minutes ago) <shiaoal>
🚀 bc6351f 2026-01-18 - add notes to git commit after github workflow (17 minutes ago) <shiaoal>
   4647384 2026-01-17 - feat: Redesign timeline block (13 hours ago) <shiaoal>
   2d5f496 2026-01-17 - feat: Implement structured logging (13 hours ago) <shiaoal>
```

### 方案 2: 配置 Git Log Format

在 `.gitconfig` 中添加自定義格式:

```bash
git config --local pretty.deploy "format:%C(auto)%h%d %s %C(green)(%cr)%C(reset) %C(bold blue)<%an>%C(reset)"
```

使用:
```bash
git log --pretty=deploy --show-notes=deployments
```

### 方案 3: 使用支持 Git Notes 的 Git 客戶端

以下 Git 客戶端支持顯示 Git Notes:

1. **GitKraken** - 可以配置顯示 notes
2. **Sublime Merge** - 支持 notes 顯示
3. **Fork** - 部分支持
4. **命令行 + tig** - 完整支持

### 方案 4: 為 IDE 創建自定義視圖

創建一個 HTML 報告來可視化部署歷史:

```bash
./scripts/generate-deploy-report.sh
```

這會生成一個 HTML 文件,可以在瀏覽器中查看。

## 在 Antigravity IDE 中的最佳實踐

### 1. 使用終端面板

在 IDE 的終端面板中運行:
```bash
git lsd
```

### 2. 創建快捷鍵

在 IDE 設置中為 `git lsd` 命令創建快捷鍵,例如 `Cmd+Shift+D`

### 3. 使用側邊欄腳本

將腳本添加到 IDE 的側邊欄快速訪問:
- 右鍵點擊 `scripts/git-log-with-deploy.sh`
- 選擇 "Add to Favorites" 或類似選項

### 4. 配置 Git Graph 擴展(如果支持)

檢查 IDE 是否有 Git Graph 擴展設置,嘗試添加:
```
--show-notes=deployments
```

## 技術限制說明

### 為什麼不能直接在 Git Graph 中顯示?

1. **Git Notes 的設計** - Notes 是獨立於 commit 的,不是 commit 對象的一部分
2. **GUI 工具限制** - 大多數 GUI 工具不支持 notes 的可視化
3. **Commit 不可變性** - 我們不能修改已存在的 commit message

### 為什麼不在 commit 時就加 emoji?

1. **時序問題** - Commit 發生在部署之前,我們不知道部署結果
2. **自動化限制** - GitHub Actions 無法修改已經推送的 commit

## 替代方案:使用 GitHub Status Checks

如果你主要在 GitHub 上查看,可以考慮:

1. **GitHub Status Checks** - 在 PR 和 commit 頁面顯示部署狀態
2. **GitHub Deployments API** - 創建部署記錄
3. **Commit Status API** - 添加狀態標記

這些會在 GitHub 網頁界面中顯示,但不會出現在本地 Git Graph 中。

## 推薦工作流程

1. **日常開發**: 使用 IDE 的 Git Graph 查看 commit 結構
2. **檢查部署**: 使用 `git lsd` 或 `./scripts/check-deployments.sh`
3. **詳細資訊**: 使用 `git deploy-show <hash>` 查看特定部署

## 未來可能的改進

1. **IDE 插件開發** - 為 Antigravity IDE 開發自定義插件
2. **Git Graph 增強** - 提交功能請求給 IDE 開發團隊
3. **Web Dashboard** - 創建一個 web 界面來可視化部署歷史
