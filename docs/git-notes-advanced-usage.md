# Git Notes 進階使用指南

## `--show-notes=deployments` 參數詳解

### 基本概念

`--show-notes=deployments` 是告訴 Git 在顯示 log 時,同時顯示存儲在 `refs/notes/deployments` 這個 ref 下的 notes。

### 語法結構

```bash
git log --show-notes=<ref> [其他參數]
```

- `<ref>` 是 notes 的引用名稱,我們使用的是 `deployments`
- 可以與其他 `git log` 參數組合使用

---

## 常用命令速查表

### 查看部署記錄

| 命令 | 說明 |
|------|------|
| `git log --show-notes=deployments -10` | 查看最近 10 個 commits 的部署記錄 |
| `git log --show-notes=deployments --oneline -10` | 單行格式顯示 |
| `git show --show-notes=deployments HEAD` | 查看當前 commit 的部署記錄 |
| `git notes --ref=deployments show <hash>` | 只查看特定 commit 的 note |

### 搜尋和過濾

| 命令 | 說明 |
|------|------|
| `git log --show-notes=deployments --since="1 week ago"` | 查看最近一週的部署 |
| `git log --show-notes=deployments --author="shiaoal-new"` | 查看特定作者的部署 |
| `git log --show-notes=deployments dev -10` | 查看 dev 分支的部署 |
| `git log --show-notes=deployments --all` | 查看所有分支的部署 |

### 統計和分析

| 命令 | 說明 |
|------|------|
| `git log --show-notes=deployments --all \| grep -c "🚀 部署成功"` | 統計成功次數 |
| `git log --show-notes=deployments --all \| grep -c "❌ 部署失敗"` | 統計失敗次數 |
| `./scripts/deployment-stats.sh` | 查看詳細統計資訊 |

---

## 實用範例

### 範例 1: 查看今天的所有部署

```bash
git log --show-notes=deployments --since="today" --all
```

### 範例 2: 查看特定日期範圍的部署

```bash
git log --show-notes=deployments --since="2026-01-01" --until="2026-01-31"
```

### 範例 3: 只顯示部署失敗的記錄

```bash
git log --show-notes=deployments --all --pretty=format:"%h - %s (%cr)" --notes=deployments | grep -B 1 "❌ 部署失敗"
```

### 範例 4: 美化輸出格式

```bash
git log --show-notes=deployments \
  --pretty=format:"%C(yellow)%h%Creset %C(cyan)%ad%Creset - %s %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset" \
  --date=short \
  -10
```

### 範例 5: 查看特定文件相關的部署

```bash
git log --show-notes=deployments -- frontend/src/components/
```

### 範例 6: 圖形化顯示部署歷史

```bash
git log --show-notes=deployments --graph --oneline --all -20
```

---

## 進階技巧

### 1. 創建自定義 Alias

在 `.gitconfig` 中添加:

```bash
# 查看部署記錄
git config alias.dlog "log --show-notes=deployments --oneline -10"

# 查看部署統計
git config alias.dstats "!./scripts/deployment-stats.sh"

# 查看最近的部署
git config alias.dlast "log --show-notes=deployments -1"

# 查看部署成功的記錄
git config alias.dsuccess "log --show-notes=deployments --all --grep='🚀 部署成功'"

# 查看部署失敗的記錄
git config alias.dfail "log --show-notes=deployments --all --grep='❌ 部署失敗'"
```

使用方式:
```bash
git dlog        # 查看最近 10 個部署
git dstats      # 查看統計資訊
git dlast       # 查看最後一次部署
git dsuccess    # 只看成功的部署
git dfail       # 只看失敗的部署
```

### 2. 組合使用 grep 進行複雜搜尋

```bash
# 查看包含特定 Run ID 的部署
git log --show-notes=deployments --all | grep -A 5 "Run ID: 21105071769"

# 查看特定環境的部署
git log --show-notes=deployments --all | grep -A 5 "環境: dev"

# 查看特定時間範圍的部署
git log --show-notes=deployments --all | grep -A 5 "時間: 2026-01-18"
```

### 3. 導出部署記錄

```bash
# 導出為文本文件
git log --show-notes=deployments --all > deployment-history.txt

# 導出為 CSV 格式(需要額外處理)
git log --show-notes=deployments --all --pretty=format:"%h,%ad,%s" --date=short > deployments.csv
```

### 4. 與其他工具整合

```bash
# 使用 fzf 進行互動式搜尋(如果安裝了 fzf)
git log --show-notes=deployments --oneline --all | fzf

# 使用 less 分頁查看
git log --show-notes=deployments --all | less

# 使用 bat 美化輸出(如果安裝了 bat)
git log --show-notes=deployments --all | bat
```

---

## 管理 Git Notes

### 查看所有 Notes

```bash
# 列出所有 notes
git notes --ref=deployments list

# 查看 notes 的詳細資訊
git notes --ref=deployments show <commit-hash>
```

### 手動添加 Note

```bash
# 為特定 commit 添加 note
git notes --ref=deployments add -m "手動添加的部署記錄" <commit-hash>

# 編輯現有的 note
git notes --ref=deployments edit <commit-hash>

# 追加內容到現有 note
git notes --ref=deployments append -m "額外資訊" <commit-hash>
```

### 刪除 Note

```bash
# 刪除特定 commit 的 note
git notes --ref=deployments remove <commit-hash>

# 推送刪除到遠端
git push origin refs/notes/deployments
```

### 同步 Notes

```bash
# 拉取最新的 notes
git fetch origin refs/notes/deployments:refs/notes/deployments

# 推送 notes 到遠端
git push origin refs/notes/deployments

# 強制推送(小心使用)
git push -f origin refs/notes/deployments
```

---

## 腳本工具

### 可用的腳本

1. **`./scripts/check-deployments.sh`**
   - 查看最近的部署記錄
   - 自動拉取最新 notes
   - 彩色輸出

2. **`./scripts/deployment-stats.sh`**
   - 顯示部署統計資訊
   - 成功/失敗次數
   - 成功率計算
   - 分環境顯示

### 創建自己的腳本

```bash
#!/bin/bash
# 範例: 查看本週的部署記錄

echo "本週部署記錄:"
git log --show-notes=deployments \
  --since="1 week ago" \
  --pretty=format:"%C(yellow)%h%Creset - %s %C(green)(%cr)%Creset" \
  --notes=deployments
```

---

## 常見問題

### Q: 為什麼我看不到部署記錄?

**A:** 確保:
1. 已經執行 `git fetch origin refs/notes/deployments:refs/notes/deployments`
2. 使用了 `--show-notes=deployments` 參數
3. 該 commit 確實有部署記錄

### Q: 如何只查看 note 內容,不顯示 commit 資訊?

**A:** 使用:
```bash
git notes --ref=deployments show <commit-hash>
```

### Q: 可以有多個 notes ref 嗎?

**A:** 可以!例如:
```bash
git notes --ref=testing add -m "測試記錄" HEAD
git notes --ref=review add -m "審查記錄" HEAD
```

查看時:
```bash
git log --show-notes=testing --show-notes=review
```

### Q: Notes 會影響 commit 嗎?

**A:** 不會。Notes 是完全獨立的,不會改變 commit 的 hash 或內容。

---

## 參考資源

- [Git Notes 官方文檔](https://git-scm.com/docs/git-notes)
- [Git Log 官方文檔](https://git-scm.com/docs/git-log)
- [項目快速參考](./deployment-notes-quickstart.md)
