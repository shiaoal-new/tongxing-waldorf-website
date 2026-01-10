# 華德福教育適合度評估問卷功能

## 概述
本功能為同心華德福網站新增了一個互動式問卷頁面，幫助不熟悉華德福教育的家長評估是否適合讓孩子接受華德福教育。

## 功能特點

### 1. 問卷內容管理
- **YML 資料格式**：問卷題目和內容以 YML 格式儲存，方便管理人員修改
- **檔案位置**：`src/data/questionnaire/waldorf-assessment.yml`
- **內容結構**：
  - 4 個主要類別（學習步調、數位媒體、家庭生活、家長參與）
  - 每個類別包含 5 個問題，共 20 題
  - 1-5 分評分量表
  - 4 個結果等級（極高共鳴、高度認同、中度認同、低度認同）

### 2. 使用者體驗
- **分類導航**：使用標籤式導航，讓使用者可以輕鬆在不同類別間切換
- **進度追蹤**：頂部進度條顯示整體完成度
- **視覺回饋**：
  - 選中的評分按鈕會以品牌橘色高亮顯示
  - 完成的類別會顯示綠色勾選標記
  - 平滑的動畫過渡效果
- **結果展示**：完成所有題目後，顯示總分和對應的評估結果

### 3. 設計整合
- **品牌色彩**：完全整合同心華德福的品牌色彩系統
- **響應式設計**：支援桌面和行動裝置
- **無障礙設計**：清晰的標籤和視覺層次

## 技術實作

### 檔案結構
```
src/data/questionnaire/
  └── waldorf-assessment.yml          # 問卷資料

lib/
  └── questionnaire.js                 # 問卷資料讀取函式

components/
  ├── questionnaire.js                 # 問卷主要組件
  └── questionnaireBlock.js            # Section renderer 橋接組件

pages/
  └── waldorf-assessment.js            # 問卷頁面

css/
  └── questionnaire.css                # 問卷樣式
```

### 資料流程
1. `pages/waldorf-assessment.js` 在 `getStaticProps` 中載入問卷資料
2. 資料透過 `PageDataProvider` 傳遞給組件樹
3. `QuestionnaireBlock` 從 context 獲取資料
4. `QuestionnaireComponent` 處理問卷邏輯和 UI

### 狀態管理
- 使用 React Hooks (`useState`) 管理：
  - 使用者的答案
  - 當前顯示的類別
  - 結果顯示狀態
- 即時計算進度和總分

## 如何修改問卷內容

### 修改題目
編輯 `src/data/questionnaire/waldorf-assessment.yml`：

```yaml
categories:
  - id: learning_pace
    title: 關於學習步調與身心發展
    questions:
      - id: q1
        text: 您的問題文字...
```

### 修改評分標準
在同一檔案中調整 `results` 區塊：

```yaml
results:
  - minScore: 80
    maxScore: 100
    level: 極高共鳴
    title: 您的標題
    description: 您的描述
    color: success
```

### 修改評分量表
調整 `scale` 區塊：

```yaml
scale:
  min: 1
  max: 5
  minLabel: 完全不認同
  maxLabel: 非常認同
```

## 頁面訪問
- URL: `/waldorf-assessment`
- 可從導航選單或其他頁面連結訪問

## 未來擴展建議
1. 添加問卷結果的 PDF 下載功能
2. 整合電子郵件發送結果
3. 添加更多問卷類型（如學生適應度評估）
4. 收集匿名統計資料以改進問卷
5. 添加問卷結果的社交分享功能

## 維護注意事項
- 問卷資料檔案使用 UTF-8 編碼
- 修改 YML 檔案後需要重新建置網站
- CSS 樣式已整合品牌色彩變數，修改品牌色彩會自動更新問卷樣式
