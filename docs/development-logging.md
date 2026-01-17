# 開發環境日誌系統

## 概述

`npm run dev:local` 腳本現在支持智能日誌過濾,可以減少終端輸出的雜訊,同時將所有詳細日誌保存到文件中。

## 日誌級別

使用 `LOG_LEVEL` 環境變數來控制終端顯示的日誌量:

### 1. **Normal** (預設)
顯示錯誤、警告和重要訊息(如服務啟動、編譯完成等)

```bash
npm run dev:local
# 或
LOG_LEVEL=normal npm run dev:local
```

**適用場景**: 日常開發,既能看到重要訊息,又不會被大量日誌淹沒

### 2. **Quiet** (安靜模式)
只顯示錯誤訊息

```bash
LOG_LEVEL=quiet npm run dev:local
```

**適用場景**: 當你只關心是否有錯誤發生時

### 3. **Verbose** (詳細模式)
顯示所有日誌訊息(與之前的行為相同)

```bash
LOG_LEVEL=verbose npm run dev:local
```

**適用場景**: 需要調試特定問題,想看到所有輸出時

## 日誌文件

所有詳細日誌都會保存到 `logs/` 目錄:

```
logs/
├── system.log      # 系統級別訊息
├── frontend.log    # Next.js 前端日誌
├── firebase.log    # Firebase Emulator 日誌
├── tunnel.log      # Cloudflare Tunnel 日誌
└── webhook.log     # LINE Webhook 更新日誌
```

### 查看日誌文件

```bash
# 查看最新的前端日誌
tail -f logs/frontend.log

# 查看最近 100 行 Firebase 日誌
tail -n 100 logs/firebase.log

# 搜尋特定錯誤
grep -i "error" logs/*.log

# 查看所有服務的錯誤
grep -i "error" logs/*.log | less
```

## 日誌格式

每個日誌條目包含:
- **時間戳**: ISO 8601 格式
- **來源**: STDOUT 或 STDERR
- **訊息內容**

範例:
```
[2026-01-17T21:30:00.000Z] [STDOUT] ✓ Compiled successfully
[2026-01-17T21:30:01.123Z] [STDERR] Warning: Deprecated API usage
```

## 重要訊息過濾規則

系統會自動識別以下類型的訊息並在終端顯示(normal 模式):

### 錯誤 (總是顯示)
- 包含 "error", "failed", "exception" 的訊息
- 紅色顯示

### 警告 (normal 和 verbose 顯示)
- 包含 "warning", "warn" 的訊息
- 黃色顯示

### 重要資訊 (normal 和 verbose 顯示)
- 包含 "ready", "compiled", "started", "listening", "connected", "success" 的訊息
- 各服務顏色顯示

## 清理日誌

日誌文件會持續累積。如果需要清理:

```bash
# 刪除所有日誌
rm -rf logs/

# 刪除特定服務的日誌
rm logs/frontend.log

# 只保留最近 1000 行
tail -n 1000 logs/frontend.log > logs/frontend.log.tmp && mv logs/frontend.log.tmp logs/frontend.log
```

## 建議使用方式

1. **日常開發**: 使用預設的 `normal` 模式
2. **專注編碼**: 使用 `quiet` 模式,只在出錯時才會打擾你
3. **調試問題**: 使用 `verbose` 模式或查看對應的日誌文件
4. **CI/CD**: 使用 `verbose` 模式確保所有訊息都被記錄

## 範例工作流程

```bash
# 啟動開發環境(安靜模式)
LOG_LEVEL=quiet npm run dev:local

# 在另一個終端監控前端日誌
tail -f logs/frontend.log | grep -i "error\|warn"

# 如果發現問題,查看完整日誌
less logs/frontend.log
```

## 故障排除

### 問題: 看不到任何輸出
**解決**: 檢查 LOG_LEVEL 是否設置為 `quiet`,且沒有錯誤發生

### 問題: 日誌文件太大
**解決**: 定期清理或使用日誌輪轉工具

### 問題: 想要更細緻的過濾
**解決**: 修改 `scripts/run_local.js` 中的 `isImportantMessage` 函數
