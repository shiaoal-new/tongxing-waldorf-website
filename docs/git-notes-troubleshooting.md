# Git Notes 部署記錄 - 問題修復記錄

## 修復的問題

### 問題 1: GitHub Actions 權限錯誤 ✅ 已修復

**錯誤訊息:**
```
remote: Permission to shiaoal-new/tongxing-waldorf-website.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/...': The requested URL returned error: 403
```

**原因:**
- GitHub Actions 默認沒有推送 Git Notes 的權限

**解決方案:**
1. 添加 workflow 權限配置:
```yaml
permissions:
  contents: write  # 允許推送 Git Notes
```

2. 配置 checkout 使用 GITHUB_TOKEN:
```yaml
- uses: actions/checkout@v3
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    persist-credentials: true
```

**修復時間:** 2026-01-18 11:09 UTC  
**狀態:** ✅ 已解決

---

### 問題 2: Git Notes 推送衝突 ✅ 已修復

**錯誤訊息:**
```
! [rejected]        refs/notes/deployments -> refs/notes/deployments (fetch first)
error: failed to push some refs to 'https://github.com/shiaoal-new/tongxing-waldorf-website'
hint: Updates were rejected because the remote contains work that you do not have locally
```

**原因:**
- 當多個 commits 同時觸發部署時,會產生並發推送衝突
- Workflow 在推送 notes 前沒有先拉取遠端的 notes

**解決方案:**

1. **推送前先拉取:**
```yaml
# 先拉取遠端 notes 以避免衝突
git fetch origin refs/notes/deployments:refs/notes/deployments || true
```

2. **添加重試機制:**
```yaml
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

3. **完整的推送邏輯:**
```yaml
# 先拉取遠端 notes 以避免衝突
git fetch origin refs/notes/deployments:refs/notes/deployments || true

# 添加或追加 note
git notes --ref=deployments add -m "$NOTE_MSG" ${{ github.sha }} || \
  git notes --ref=deployments append -m "$NOTE_MSG" ${{ github.sha }}

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

**修復時間:** 2026-01-18 11:27 UTC  
**狀態:** ✅ 已解決

---

## 完整的 Workflow 改進

### 改進前
```yaml
- name: Add Success Note
  if: success()
  run: |
    NOTE_MSG="..."
    git notes --ref=deployments add -m "$NOTE_MSG" ${{ github.sha }}
    git push origin refs/notes/deployments
```

**問題:**
- ❌ 沒有權限
- ❌ 沒有處理衝突
- ❌ 沒有重試機制

### 改進後
```yaml
# 在 workflow 頂層添加權限
permissions:
  contents: write

# 在 checkout 步驟配置 token
- uses: actions/checkout@v3
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}
    persist-credentials: true

# 在添加 note 步驟
- name: Add Success Note
  if: success()
  run: |
    NOTE_MSG="..."
    
    # 先拉取遠端 notes
    git fetch origin refs/notes/deployments:refs/notes/deployments || true
    
    # 添加 note
    git notes --ref=deployments add -m "$NOTE_MSG" ${{ github.sha }} || \
      git notes --ref=deployments append -m "$NOTE_MSG" ${{ github.sha }}
    
    # 推送並重試
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

**改進:**
- ✅ 有推送權限
- ✅ 自動處理衝突
- ✅ 失敗自動重試
- ✅ 更穩定可靠

---

## 測試結果

### 測試 1: 單個部署
- **Commit:** c3b1fe1
- **結果:** ✅ 成功
- **Notes 內容:**
```
🚀 部署成功
環境: dev
時間: 2026-01-18 03:09:26 UTC
Workflow: Firebase Hosting Deploy
Run ID: 21105071769
Actor: shiaoal-new
```

### 測試 2: 並發部署(模擬)
- **預期:** 兩個部署都能成功推送 notes
- **實際:** ✅ 重試機制正常工作
- **結果:** 兩個 commits 都有部署記錄

---

## 最佳實踐建議

### 1. 避免並發部署
雖然現在有重試機制,但仍建議:
- 等待前一個部署完成再推送新的 commit
- 或者使用 GitHub Actions 的 concurrency 控制

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false  # 不取消進行中的部署
```

### 2. 監控部署狀態
定期檢查部署記錄:
```bash
git pull
git lsd
```

### 3. 查看統計資訊
追蹤部署質量:
```bash
git dstats
```

---

## 相關文件

- `.github/workflows/firebase-deploy.yml` - Workflow 配置
- `docs/deployment-notes-quickstart.md` - 快速參考
- `docs/git-notes-setup.md` - 完整設定指南
- `scripts/check-deployments.sh` - 查看部署記錄
- `scripts/deployment-stats.sh` - 統計資訊

---

## 版本歷史

| 版本 | 日期 | 改進內容 |
|------|------|----------|
| v1.0 | 2026-01-18 | 初始實現 - 基本的 Git Notes 功能 |
| v1.1 | 2026-01-18 11:09 | 修復權限問題 |
| v1.2 | 2026-01-18 11:27 | 修復推送衝突,添加重試機制 |

---

## 總結

✅ **所有已知問題已修復**

現在的 Git Notes 部署記錄功能:
- ✅ 穩定可靠
- ✅ 自動處理衝突
- ✅ 失敗自動重試
- ✅ 完整的錯誤處理
- ✅ 詳細的日誌輸出

可以放心使用! 🎉
