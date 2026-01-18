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
