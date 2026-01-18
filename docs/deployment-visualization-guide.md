# 部署狀態可視化 - 完整指南

## 🎯 目標

在查看 Git 歷史時,能夠快速識別哪些 commits 已經部署,以及部署的結果(成功/失敗)。

## 📊 可用的查看方式

### 1. 命令行 - 帶 Emoji 的 Git Log (推薦)

**使用方式:**
```bash
# 使用腳本
./scripts/git-log-with-deploy.sh

# 使用 Git alias
git lsd
```

**輸出範例:**
```
🚀 c3b1fe1 2026-01-18 - 解決 GitHub Actions 權限問題 (5 minutes ago) <shiaoal>
🚀 bc6351f 2026-01-18 - add notes to git commit (17 minutes ago) <shiaoal>
   4647384 2026-01-17 - feat: Redesign timeline block (13 hours ago) <shiaoal>
   2d5f496 2026-01-17 - feat: Implement logging (13 hours ago) <shiaoal>
```

**優點:**
- ✅ 快速直觀
- ✅ 在終端中使用
- ✅ 彩色輸出
- ✅ 自動拉取最新 notes

### 2. HTML 可視化報告 (最美觀)

**生成報告:**
```bash
./scripts/generate-deploy-report.sh
```

**自動在瀏覽器中打開:**
```bash
open deployment-report.html
```

**功能特點:**
- 📊 統計資訊(總數、成功、失敗、成功率)
- 🎨 美觀的時間線展示
- 🔍 過濾功能(全部/成功/失敗/未部署)
- 📱 響應式設計
- 🎯 詳細的部署資訊

**優點:**
- ✅ 視覺效果最佳
- ✅ 互動式過濾
- ✅ 完整的統計資訊
- ✅ 適合展示和報告

### 3. 部署記錄查看腳本

**使用方式:**
```bash
./scripts/check-deployments.sh
```

**優點:**
- ✅ 彩色輸出
- ✅ 自動拉取最新 notes
- ✅ 顯示使用提示

### 4. 部署統計腳本

**使用方式:**
```bash
./scripts/deployment-stats.sh

# 或使用 alias
git dstats
```

**功能:**
- 📊 總部署次數
- ✅ 成功次數
- ❌ 失敗次數
- 📈 成功率
- 🌍 分環境顯示(dev/main)

### 5. Git 原生命令

**查看部署記錄:**
```bash
# 查看最近 10 個 commits
git log --show-notes=deployments -10

# 單行顯示
git deploy-log

# 查看特定 commit
git deploy-show <hash>
git deploy-show HEAD

# 只看成功的部署
git dsuccess

# 只看失敗的部署
git dfail

# 查看最後一次部署
git dlast
```

## 🔧 可用的 Git Aliases

已配置的 aliases:

| Alias | 命令 | 說明 |
|-------|------|------|
| `git deploy-log` | `log --show-notes=deployments -10 --oneline` | 查看最近 10 個部署 |
| `git deploy-show` | `notes --ref=deployments show` | 查看特定 commit 的部署記錄 |
| `git deploy-all` | `log --show-notes=deployments --all --grep='部署'` | 查看所有部署記錄 |
| `git dlog` | `log --show-notes=deployments --oneline -10` | 簡短版部署記錄 |
| `git dstats` | `!./scripts/deployment-stats.sh` | 部署統計 |
| `git dlast` | `log --show-notes=deployments -1` | 最後一次部署 |
| `git dsuccess` | `log --show-notes=deployments --all --grep='🚀 部署成功'` | 只看成功 |
| `git dfail` | `log --show-notes=deployments --all --grep='❌ 部署失敗'` | 只看失敗 |
| `git lsd` | `!./scripts/git-log-with-deploy.sh` | Log with Status and Deploy |

## 📁 相關文件

### 腳本文件
- `scripts/check-deployments.sh` - 查看部署記錄
- `scripts/deployment-stats.sh` - 部署統計
- `scripts/git-log-with-deploy.sh` - 帶 emoji 的 git log
- `scripts/generate-deploy-report.sh` - 生成 HTML 報告

### 文檔文件
- `docs/git-notes-setup.md` - 完整設定指南
- `docs/deployment-notes-quickstart.md` - 快速參考
- `docs/git-notes-advanced-usage.md` - 進階用法
- `docs/git-graph-deployment-status.md` - IDE Git Graph 說明
- `docs/deployment-visualization-guide.md` - 本文件

## 🎨 在 IDE 中使用

### Antigravity IDE

#### 方法 1: 使用終端面板
1. 打開終端面板 (`Cmd+J` 或 `Ctrl+J`)
2. 運行: `git lsd` 或 `./scripts/check-deployments.sh`

#### 方法 2: 查看 HTML 報告
1. 運行: `./scripts/generate-deploy-report.sh`
2. 在瀏覽器中查看生成的報告

#### 方法 3: 創建快捷鍵
在 IDE 設置中為常用命令創建快捷鍵:
- `git lsd` → `Cmd+Shift+D`
- `./scripts/generate-deploy-report.sh` → `Cmd+Shift+R`

#### 方法 4: 側邊欄快速訪問
將腳本添加到側邊欄收藏:
1. 右鍵點擊腳本文件
2. 選擇 "Add to Favorites"
3. 雙擊即可運行

### 其他 IDE

大多數 IDE 的 Git Graph 不支持顯示 Git Notes,建議:
1. 使用終端面板運行命令
2. 使用 HTML 報告查看
3. 考慮使用支持 Git Notes 的 Git 客戶端(GitKraken, Sublime Merge)

## 🔄 工作流程建議

### 日常開發
```bash
# 1. 開發並提交
git add .
git commit -m "feat: 新功能"

# 2. 推送到 GitHub
git push origin dev

# 3. 等待部署完成(GitHub Actions)
# ...

# 4. 查看部署結果
git pull  # 拉取最新 notes
git lsd   # 查看帶 emoji 的 log
```

### 檢查部署狀態
```bash
# 快速查看
git lsd

# 詳細統計
git dstats

# 生成報告
./scripts/generate-deploy-report.sh
```

### 排查問題
```bash
# 查看失敗的部署
git dfail

# 查看特定 commit 的部署詳情
git deploy-show <hash>

# 查看完整的部署記錄
git log --show-notes=deployments --all
```

## 📊 統計和分析

### 查看成功率
```bash
git dstats
```

### 查看特定時間範圍
```bash
# 最近一週
git log --show-notes=deployments --since="1 week ago"

# 特定日期範圍
git log --show-notes=deployments --since="2026-01-01" --until="2026-01-31"
```

### 查看特定環境
```bash
# Dev 環境
git log --show-notes=deployments --all | grep -A 5 "環境: dev"

# Main 環境
git log --show-notes=deployments --all | grep -A 5 "環境: main"
```

## 🎯 最佳實踐

1. **定期拉取 Notes**
   ```bash
   git pull  # 自動拉取 notes
   ```

2. **使用 HTML 報告進行展示**
   - 適合團隊會議
   - 適合給非技術人員展示
   - 適合保存歷史記錄

3. **使用命令行進行日常查看**
   - 快速方便
   - 整合到工作流程

4. **定期檢查部署統計**
   ```bash
   git dstats
   ```

## 🚀 進階技巧

### 創建自定義過濾
```bash
# 只看今天的部署
git log --show-notes=deployments --since="today"

# 只看我的部署
git log --show-notes=deployments --author="$(git config user.name)"

# 結合 grep 進行複雜搜尋
git log --show-notes=deployments --all | grep -B 2 "Run ID: 21105071769"
```

### 導出部署歷史
```bash
# 導出為文本
git log --show-notes=deployments --all > deployment-history.txt

# 使用 HTML 報告
./scripts/generate-deploy-report.sh
# 然後在瀏覽器中打印為 PDF
```

### 整合到 CI/CD
在 GitHub Actions 中可以自動生成報告:
```yaml
- name: Generate Deployment Report
  run: ./scripts/generate-deploy-report.sh
  
- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: deployment-report
    path: deployment-report.html
```

## 🔗 相關資源

- [Git Notes 官方文檔](https://git-scm.com/docs/git-notes)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [項目 README](../README.md)

## 💡 提示

- 🔄 記得定期 `git pull` 以獲取最新的部署記錄
- 🎨 HTML 報告提供最佳的視覺體驗
- ⚡ 命令行工具最快速方便
- 📊 使用統計腳本追蹤部署質量
