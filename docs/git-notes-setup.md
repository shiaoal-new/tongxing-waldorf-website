# Git Notes 部署記錄設定指南

## 功能說明

當你推送 `dev` 或 `main` 分支到 GitHub 時,GitHub Actions 會自動執行 Firebase 部署,並將部署結果(成功/失敗)記錄為 Git Notes 附加到對應的 commit 上。

## 本地設定步驟

### 1. 配置自動拉取 Git Notes

在你的本地倉庫中執行以下命令,讓 Git 在每次 pull/fetch 時自動拉取部署記錄:

```bash
# 配置自動拉取 deployments notes
git config --add remote.origin.fetch '+refs/notes/deployments:refs/notes/deployments'

# 如果你想要全域設定(對所有倉庫生效),可以使用:
# git config --global --add remote.origin.fetch '+refs/notes/*:refs/notes/*'
```

### 2. 手動拉取現有的 Notes

如果倉庫中已經有部署記錄,執行以下命令拉取:

```bash
git fetch origin refs/notes/deployments:refs/notes/deployments
```

### 3. 查看帶有部署記錄的 Commit

有多種方式可以查看部署記錄:

#### 方法 1: 查看最近的 commits 及其部署記錄
```bash
git log --show-notes=deployments -10
```

#### 方法 2: 只查看特定 commit 的部署記錄
```bash
git notes --ref=deployments show <commit-hash>
```

#### 方法 3: 查看所有帶有部署記錄的 commits
```bash
git log --show-notes=deployments --grep="部署"
```

#### 方法 4: 美化輸出格式
```bash
git log --show-notes=deployments --pretty=format:"%h - %s (%cr) <%an>" -10
```

### 4. 設定 Git Alias (可選,方便使用)

你可以創建一些方便的 alias:

```bash
# 查看最近 10 個 commits 的部署記錄
git config --global alias.deploy-log "log --show-notes=deployments -10 --oneline"

# 查看特定 commit 的部署記錄
git config --global alias.deploy-show "notes --ref=deployments show"

# 查看所有部署記錄
git config --global alias.deploy-all "log --show-notes=deployments --all --grep='部署'"
```

使用方式:
```bash
git deploy-log              # 查看最近的部署記錄
git deploy-show HEAD        # 查看當前 commit 的部署記錄
git deploy-show abc123      # 查看特定 commit 的部署記錄
```

## 部署記錄格式

### 成功部署
```
🚀 部署成功
環境: dev
時間: 2026-01-18 10:30:00 UTC
Workflow: Firebase Hosting Deploy
Run ID: 123456789
Actor: alsiao
```

### 失敗部署
```
❌ 部署失敗
環境: dev
時間: 2026-01-18 10:30:00 UTC
Workflow: Firebase Hosting Deploy
Run ID: 123456789
Actor: alsiao
查看詳情: https://github.com/your-org/your-repo/actions/runs/123456789
```

## 常見問題

### Q: 為什麼我看不到部署記錄?
A: 確保你已經:
1. 執行了步驟 1 的配置命令
2. 執行了 `git fetch` 或 `git pull`
3. 使用 `--show-notes=deployments` 參數查看 log

### Q: 如何刪除某個 commit 的部署記錄?
A: 使用以下命令:
```bash
git notes --ref=deployments remove <commit-hash>
git push origin refs/notes/deployments
```

### Q: 部署記錄會影響 commit 本身嗎?
A: 不會。Git Notes 是獨立於 commit 的附加資訊,不會改變 commit 的 hash 值或內容。

### Q: 如何查看所有可用的 notes?
A: 使用以下命令:
```bash
git notes list
```

## 進階使用

### 在 Git GUI 工具中查看

大多數 Git GUI 工具(如 GitKraken, SourceTree, GitHub Desktop)可能不會自動顯示 notes。你可以:

1. **VSCode Git Graph 擴展**: 支援顯示 Git Notes
2. **命令行**: 使用上述命令查看
3. **自定義腳本**: 創建腳本來格式化輸出

### 自動化腳本範例

創建一個腳本來快速查看最近的部署狀態:

```bash
#!/bin/bash
# 保存為 scripts/check-deployments.sh

echo "最近 5 次部署記錄:"
echo "===================="
git log --show-notes=deployments -5 --pretty=format:"%C(yellow)%h%Creset - %s %C(green)(%cr)%Creset" --notes=deployments
```

使用:
```bash
chmod +x scripts/check-deployments.sh
./scripts/check-deployments.sh
```

## 參考資源

- [Git Notes 官方文檔](https://git-scm.com/docs/git-notes)
- [GitHub Actions Context](https://docs.github.com/en/actions/learn-github-actions/contexts)
