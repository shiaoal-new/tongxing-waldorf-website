# 專案架構與管理說明文件 (Decap CMS + Next.js + Firebase)

本文件說明同心華徳福網站的開發流、內容管理、部署機制以及分支管理策略。

---

## 1. 系統架构概覽

*   **前端框架**: [Next.js](https://nextjs.org/) (使用 Static HTML Export)
*   **內容管理 (CMS)**: [Decap CMS](https://decapcms.org/) (原 Netlify CMS)
*   **CMS 橋接**: [DecapBridge](https://decapbridge.com/) (用於處理 GitHub 驗證與 API 接合)
*   **託管平台**: [Firebase Hosting](https://firebase.google.com/docs/hosting)
*   **自動化 CI/CD**: GitHub Actions

---

## 2. 分支管理 (Branch Strategy)

| 分支 (Branch) | 環境 (Environment) | 網址 (URL) | Firebase 專案 ID | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| `dev` | 开发/測試 | [tongxing-waldorf-dev.web.app](https://tongxing-waldorf-site-dev.web.app) | `tongxing-waldorf-website-dev` | 用於日常開發、CMS 內容初稿。 |
| `main` | 正式發佈 | [tongxing-waldorf-prod.web.app](https://tongxing-waldorf-site.web.app) | `tongxing-waldorf-website` | 穩定版本。 |

### 如何切換 CMS 管理的分支？
在 `public/admin/config.yml` 中修改 `backend.branch`：
*   若要在 `dev` 分支新增內容，請確保該欄位為 `branch: dev`。
*   **注意**: CMS 的修改會直接產生 Git commit 推送到 GitHub。

---

## 3. 內容管理工作流 (Decap CMS)

### 數據存儲
網站內容（如：教職員、常見問答、教育特色）存儲在：
*   路径: `src/data/{collection}/*.md`
*   格式: Markdown + Frontmatter (YAML)

### 管理步驟
1.  訪問 `您的網址/admin/` (例如：`https://.../admin/`)。
2.  透過 DecapBridge 進行 GitHub 登入。
3.  在後台新增或修改內容。
4.  按下 **Publish** 後：
    *   Decap CMS 會透過 DecapBridge 在 GitHub 對應分支產生一個 Commit。
    *   GitHub 接收到 Push 動作後，觸發 GitHub Actions 自動部署。

---

## 4. 靜態網頁與 Build 機制

本專案使用 **SSG (Static Site Generation)**：

1.  **數據讀取**: 在 `lib/*.js` (如 `lib/benefits.js`) 中讀取本地 Markdown 文件。
2.  **頁面生成**: 在 Next.js 頁面中使用 `getStaticProps` 獲取數據。
3.  **Build 命令**: 執行 `npm run build`。
    *   Next.js 會編譯所有頁面。
    *   自動執行 `next export` 將頁面輸出為靜態 HTML 到 `out/` 資料夾。

---

## 5. 自動化部署 (GitHub Actions)

當代碼被 Push 到 `main` 或 `dev` 分支時，會觸發 `.github/workflows/firebase-deploy.yml`：

1.  **Checkout**: 取得最新代碼。
2.  **Build**: 執行 `npm run build` (同時編譯 Next.js 靜態頁面與 TypeScript Functions)。
3.  **Deploy**: 切換至對應專案並同時部署 Hosting 與 Functions：
    *   `main` 分支 $\rightarrow$ `firebase use tongxing-waldorf-website` 然後 `firebase deploy --only hosting:prod,functions`
    *   `dev` 分支 $\rightarrow$ `firebase use tongxing-waldorf-website-dev` 然後 `firebase deploy --only hosting:dev,functions`

---

## 6. 常見操作建議

### 如何更新 CMS 配置？
修改 `public/admin/config.yml`。例如，若想更換圖標庫或增加新的欄位，需在此文件配置。

### 如何切換開發環境？
*   **本地開發**: 執行 `npm run dev`。
*   **本地 CMS 測試**: 
    1. 在 `config.yml` 開啟 `local_backend: true`。
    2. 執行 `npx decap-server`。
    3. 執行 `npm run dev` 並訪問 `localhost:3000/admin/`。

### 為什麼 CMS 報 404 錯誤？
通常是因為 `config.yml` 設定的分支在 GitHub 上不存在該路徑，或者您在本地新增了資料夾但尚未 Push 到 GitHub 分支上。

---

## 7. LINE 平台配置 (LINE Platform Configuration)

本專案使用兩種類型的 LINE Channel：**LINE Login** (用於網站登入) 與 **Messaging API** (用於機器人自動註冊)。

### 7.1 LINE Login (網站登入)
| 環境 | Channel ID | 說明 |
| :--- | :--- | :--- |
| **開發/正式** | `2004780027` | 目前兩環境共用此 Login Channel。 |

*   **Callback URL**: `http://localhost:3000/api/auth/callback/line` (開發)

### 7.2 Messaging API (Webhook 自動註冊)
為了開發安全，必須區分正式版與測試版機器人。

| 環境 | LINE Channel 類型 | 功能 |
| :--- | :--- | :--- |
| **Dev** | 同心華德福 (測試版) | 用於開發測試，對接 `localhost` 或 `dev` 雲端。 |
| **Prod** | 同心華德福 (正式版) | 用於真實用戶，對接正式網址。 |

### 7.3 環境變數管理
*   **本地開發**: 變數存於 `functions/.env` (已被 Git 忽略)。
*   **生產環境**: 使用 Firebase Secrets Manager 儲存，不存於檔案。
    *   `LINE_MESSAGING_CHANNEL_SECRET`
    *   `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`
