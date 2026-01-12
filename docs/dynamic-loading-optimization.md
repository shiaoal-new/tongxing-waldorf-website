# 動態載入優化

## 概述
將 `sectionRenderer.js` 中較少使用的 block 組件改為動態載入,以優化初始 bundle 大小和首頁載入速度。

## 修改日期
2026-01-12

## 改動的組件

以下組件已從靜態 import 改為使用 Next.js `dynamic()` 動態載入:

### 第一批 - 設計系統與特殊功能組件

### 1. **SpacingDemoBlock** (8.8KB)
- 用途: 設計系統 - 間距展示
- 使用頁面: `/layout-spacing`
- 載入訊息: "載入中..."

### 2. **TypographyDemoBlock** (4.1KB)
- 用途: 設計系統 - 字體展示
- 使用頁面: `/typography`
- 載入訊息: "載入中..."

### 3. **MicroInteractionsBlock** (5.1KB)
- 用途: 設計系統 - 微互動展示
- 使用頁面: `/micro-interactions`
- 載入訊息: "載入中..."

### 4. **TabbedContentBlock** (1.7KB)
- 用途: 分頁內容區塊
- 使用頁面: `/courses/eurythmy`
- 載入訊息: "載入中..."

### 5. **QuestionnaireBlock** (19KB JS + 13KB CSS)
- 用途: 華德福評估問卷
- 使用頁面: `/waldorf-assessment`
- 載入訊息: "載入問卷中..."
- 外部依賴: `questionnaire.js`, `questionnaire.css`

### 6. **TimelineBlock** (5KB JS + 3.5KB CSS)
- 用途: 時間軸展示
- 使用頁面: `/chronology`
- 載入訊息: "載入時間軸中..."
- 外部依賴: `react-vertical-timeline-component`

### 第二批 - 特定頁面專用組件

### 7. **ScheduleBlock** (3.8KB)
- 用途: 每日作息時間表
- 使用頁面: `/daily-routine`
- 載入訊息: "載入中..."

### 8. **CurriculumBlock** (14KB)
- 用途: 課程發展矩陣表
- 使用頁面: `/curriculum-development`
- 載入訊息: "載入中..."

### 9. **ColorPaletteBlock** (8.3KB)
- 用途: 設計系統 - 色彩展示
- 使用頁面: `/colors`
- 載入訊息: "載入中..."

### 10. **VisitProcess** (1.9KB)
- 用途: 參訪流程說明
- 使用頁面: `/visit`
- 載入訊息: "載入參訪流程中..."

### 11. **VisitSchedule** (7.9KB)
- 用途: 參訪場次時程表
- 使用頁面: `/visit`
- 載入訊息: "載入參訪時程中..."


## 預期效益

### Bundle 大小優化
- **第一批組件總計**: ~30-40KB JavaScript + ~16.5KB CSS
- **第二批組件總計**: ~36KB JavaScript
- **總計減少**: ~66-76KB JavaScript + ~16.5KB CSS
- **最大單一組件**: QuestionnaireBlock (32KB), CurriculumBlock (14KB)

### 載入速度提升
- **首頁**: 不再載入任何設計系統組件和特定頁面組件
- **主要頁面**: 只載入實際使用的組件
- **按需載入**: 僅在訪問特定頁面時才下載對應組件

### Code Splitting
Next.js 會自動為每個動態組件創建獨立的 chunk:
- `spacingDemoBlock.[hash].js`
- `typographyDemoBlock.[hash].js`
- `microInteractionsBlock.[hash].js`
- `tabbedContentBlock.[hash].js`
- `questionnaireBlock.[hash].js`
- `timelineBlock.[hash].js`
- `scheduleBlock.[hash].js`
- `curriculumBlock.[hash].js`
- `colorPaletteBlock.[hash].js`
- `visitProcess.[hash].js`
- `visitSchedule.[hash].js`


## 技術實作

### 動態載入配置
```javascript
const ComponentName = dynamic(() => import("./componentName"), {
    loading: () => <BlockLoadingFallback message="載入中..." />,
    ssr: true  // 保持 SSR 支援
});
```

### Loading Fallback
新增 `BlockLoadingFallback` 組件提供載入狀態視覺回饋:
- 旋轉動畫 spinner
- 自訂載入訊息
- 符合品牌設計風格

## 注意事項

### SSR 相容性
- 所有動態組件都設定 `ssr: true`
- 確保伺服器端渲染正常運作
- 避免 hydration mismatch

### 載入體驗
- 首次訪問會有輕微延遲(通常 < 100ms)
- Loading fallback 提供視覺回饋
- 後續訪問會使用瀏覽器快取

### 未改動的組件
以下組件保持靜態載入,因為它們:
- 使用頻率高
- 檔案較小
- 是核心功能

保持靜態載入的組件:
- `Section`
- `BenefitItem`
- `ListRenderer`
- `VideoItem`
- `MediaRenderer`
- `ScheduleBlock`
- `CurriculumBlock`
- `ColorPaletteBlock`
- `ActionButtons`
- `VisitProcess`
- `VisitSchedule`

## 驗證方式

### 1. 開發環境測試
```bash
npm run dev
```
訪問以下頁面確認組件正常載入:

**第一批組件:**
- `/layout-spacing` - SpacingDemoBlock
- `/typography` - TypographyDemoBlock
- `/micro-interactions` - MicroInteractionsBlock
- `/waldorf-assessment` - QuestionnaireBlock
- `/chronology` - TimelineBlock
- `/courses/eurythmy` - TabbedContentBlock

**第二批組件:**
- `/daily-routine` - ScheduleBlock
- `/curriculum-development` - CurriculumBlock
- `/colors` - ColorPaletteBlock
- `/visit` - VisitProcess, VisitSchedule


### 2. 生產環境測試
```bash
npm run build
npm run export
```
檢查 `.next/static/chunks/` 目錄確認獨立 chunk 已生成

### 3. Bundle 分析
```bash
npm run analyze  # 如果有設定 bundle analyzer
```

## 未來優化建議

1. **進一步分析**: 使用 webpack-bundle-analyzer 分析其他可優化的組件
2. **預載入策略**: 對於可能訪問的頁面使用 `<link rel="prefetch">`
3. **圖片優化**: 檢查 TimelineBlock 和 QuestionnaireBlock 使用的圖片資源
4. **CSS 分離**: 考慮將大型 CSS 檔案也進行動態載入

## 相關檔案

- `/components/sectionRenderer.js` - 主要修改檔案
- `/pages/_app.js` - 全域 CSS 載入

**第一批動態載入組件:**
- `/components/questionnaireBlock.js`
- `/components/timelineBlock.js`
- `/components/spacingDemoBlock.js`
- `/components/typographyDemoBlock.js`
- `/components/microInteractionsBlock.js`
- `/components/tabbedContentBlock.js`

**第二批動態載入組件:**
- `/components/scheduleBlock.js`
- `/components/curriculumBlock.js`
- `/components/colorPaletteBlock.js`
- `/components/visitProcess.js`
- `/components/visitSchedule.js`

