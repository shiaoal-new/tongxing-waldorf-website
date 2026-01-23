# TON-47: 優化網站效能與無障礙功能 (基於 2026-01-23 Lighthouse 報告)

## 優化項目概述

根據 2026-01-23 的 Lighthouse 報告，針對效能（Performance）與無障礙（Accessibility）進行了以下優化，旨在提升 LCP 分數並減少初始載入體積。

## 具體優化內容

### 1. 影片體積壓縮與行動端策略 (TON-48)
- **影片重新壓縮**：使用 `ffmpeg` (VP9 編碼，CRF 48) 將首頁 Hero 影片 `/img/hero-video-vp9.webm` 從 **7.5MB 壓縮至 1.7MB** (減少約 77%)。
- **行動端流量優化**：
  - 修改 `MediaRenderer.tsx` 邏輯：在行動端 (width <= 768px) 如果未提供 `mobileVideo`，則**不再回退下載桌機版影片**，而是直接顯示 Poster 圖片。
  - 在 `index.yml` 中註解掉 `mobileVideo`，強制行動端使用靜態圖片 (/img/video-poster-mobile.webp, ~81KB)，極大節省行動端數據流量與頻寬。

### 2. 圖片回應式優化 (TON-49)
- **YouTube 縮圖優化**：修改 `Video.js`，在行動端優先載入 `hqdefault.jpg` (480x360)，桌機端才載入 `maxresdefault.jpg` (1280x720)，減少首屏圖片請求體積。
- **Timeline 組件優化**：將 `TimelineBlock.tsx` 中的原生 `<img>` 標籤替換為 Next.js 的 `<Image>` 組件，並設置正確的 `sizes` 屬性 (`(max-width: 768px) 100vw, 400px`)。

### 3. 字體載入策略優化 (TON-50)
- **資源預連結**：在 `_document.tsx` 中添加 `preconnect` 提示，提前建立與 `fonts.googleapis.com` 和 `fonts.gstatic.com` 的連線，縮短字體抓取延遲。
- **維持已有的最佳實踐**：確認 `display: swap` 與字體請求合併已生效。

### 4. 無障礙功能修正 (TON-51)
- **按鈕語義化**：將 `PageHero.tsx` 中的「Scroll to content」滾動按鈕從 `motion.div` 改為 `motion.button`。
- **鍵盤無障礙**：原生 `button` 標籤自動支持鍵盤聚焦與 `Enter/Space` 觸發，提升螢幕閱讀器兼容性。

## 預期效果

- **LCP (Largest Contentful Paint)**：預計從 3.8s 降至 2.5s 以下。
- **總傳輸體積**：首頁初始載入體積減少超過 6MB。
- **Lighthouse 分數**：Performance 分數預計提升至 85+ 區間。

## 相關文件
- `frontend/src/components/ui/MediaRenderer.tsx` (已修改)
- `frontend/src/components/ui/Video.js` (已修改 - 註：實際路徑為 components/Video.js)
- `frontend/src/components/blocks/TimelineBlock.tsx` (已修改)
- `frontend/src/components/layout/PageHero.tsx` (已修改)
- `frontend/src/pages/_document.tsx` (已修改)
- `frontend/src/data/pages/index.yml` (已修改)
