# 部署記錄快速參考

## 快速開始

### 查看部署記錄

```bash
# 方法 1: 使用腳本(推薦)
./scripts/check-deployments.sh

# 方法 2: 使用 Git alias
git deploy-log

# 方法 3: 查看特定 commit
git deploy-show <commit-hash>
git deploy-show HEAD
```

### 常用命令

```bash
# 拉取最新的部署記錄
git fetch origin refs/notes/deployments:refs/notes/deployments

# 或者直接 pull(已配置自動拉取)
git pull

# 查看最近 10 個 commits 的部署記錄
git log --show-notes=deployments -10

# 只查看部署成功的記錄
git log --show-notes=deployments --all | grep -A 5 "🚀 部署成功"

# 只查看部署失敗的記錄
git log --show-notes=deployments --all | grep -A 7 "❌ 部署失敗"
```

## 部署記錄內容

每次部署後,會自動在 commit 上添加以下資訊:

- ✅ 部署狀態(成功/失敗)
- 🌍 部署環境(dev/main)
- ⏰ 部署時間
- 👤 執行者
- 🔗 失敗時的詳細連結

## 工作流程

1. **開發並提交代碼**
   ```bash
   git add .
   git commit -m "feat: 新功能"
   ```

2. **推送到 GitHub**
   ```bash
   git push origin dev
   ```

3. **GitHub Actions 自動部署**
   - 自動執行 Firebase 部署
   - 部署完成後自動添加 Git Notes

4. **查看部署結果**
   ```bash
   git pull  # 拉取最新的 notes
   ./scripts/check-deployments.sh  # 查看部署記錄
   ```

## 詳細文檔

查看 [docs/git-notes-setup.md](./git-notes-setup.md) 獲取完整的設定指南和進階用法。

## 故障排除

### GitHub Actions 權限錯誤

如果看到類似以下錯誤:
```
remote: Permission to your-repo.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/...': The requested URL returned error: 403
```

**解決方案**: 已在 workflow 中配置以下權限:
```yaml
permissions:
  contents: write  # 允許推送 Git Notes
```

並在 checkout 步驟中添加:
```yaml
- uses: actions/checkout@v3
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    persist-credentials: true
```

這些配置已經包含在最新的 workflow 文件中,無需額外操作。

### Git Notes 推送衝突

如果看到類似以下錯誤:
```
! [rejected]        refs/notes/deployments -> refs/notes/deployments (fetch first)
error: failed to push some refs
hint: Updates were rejected because the remote contains work that you do not have locally
```

**原因**: 當多個部署同時進行時,可能會產生 notes 推送衝突。

**解決方案**: 已在 workflow 中添加:
1. 推送前先拉取遠端 notes
2. 推送失敗時自動重試(最多 3 次)
3. 每次重試前重新拉取最新 notes

```yaml
# 先拉取遠端 notes 以避免衝突
git fetch origin refs/notes/deployments:refs/notes/deployments || true

# 推送 notes,如果失敗則重試
for i in {1..3}; do
  if git push origin refs/notes/deployments; then
    echo "✅ Notes 推送成功"
    break
  else
    echo "⚠️  推送失敗,重試 $i/3..."
    git fetch origin refs/notes/deployments:refs/notes/deployments || true
    sleep 2
  fi
done
```

這些改進已經包含在最新的 workflow 文件中。
