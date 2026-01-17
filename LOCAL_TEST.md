# LINE Bot 本地雙 Channel 開發指南

本專案採用 **雙 Channel 策略** 來隔離正式環境與開發環境。

## 架構說明
*   **Production Channel (正式環境)**: 連接至已部署的 Firebase Functions。
*   **Development Channel (開發環境)**: 連接至本地電腦 (透過 ngrok)。

這樣做的優點是您不需要頻繁更改 LINE Console 的 Webhook URL，且測試過程不會影響真實用戶。

---

## 步驟一：建立開發用 Channel (一次性設定)

1.  前往 [LINE Developers Console](https://developers.line.biz/console/)。
2.  建立一個新的 Provider (或使用現有的)。
3.  建立一個新的 **Messaging API** Channel。
    *   建議名稱加上 `(Dev)` 或 `(Test)` 以示區別，例如：`TongXing Bot (Dev)`。
4.  取得該 Channel 的 **Channel Secret** 與 **Channel Access Token**。

## 步驟二：設定本地環境變數

1.  在專案的 `functions/` 資料夾下，確認有一個 `.env.local` 檔案。
2.  將步驟一取得的資訊填入該檔案：

    ```env
    # functions/.env.local
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=你的開發用Token
    LINE_MESSAGING_CHANNEL_SECRET=你的開發用Secret
    ```

    > **注意**：`.env.local` 已經被加入 `.gitignore`，請勿將真實憑證提交到 Git。

## 步驟三：啟動開發環境 (推薦方式)

現在您可以透過一個指令啟動所有服務（包括隧道、後端、前端）：

1.  在專案根目錄執行：
    ```bash
    npm run dev:local
    ```
2.  此腳本會自動完成：
    *   啟動 Firebase Emulators
    *   啟動 **Localtunnel** (固定子網域 `tongxingwaldorf.loca.lt`)
    *   更新環境變數 (`WEB_BASE_URL` 等)
    *   啟動前端 Next.js
    *   **自動更新 LINE Webhook**

看到 `🔊 System is ready!` 聲音提示即表示一切就緒！

---

## 步驟四：手動啟動 (選用)

如果您想分開啟動：

1.  **啟動 Firebase Emulators**
    在 `functions` 目錄下執行 `npm run serve`
2.  **啟動隧道 (Tunnel)**
    使用 Localtunnel：`npx localtunnel --port 3000 --subdomain tongxingwaldorf`
3.  **自動更新 Webhook**
    在 `functions` 目錄下執行 `npm run update-webhook`

---

## 步驟五：開始開發

現在您可以：
*   對 **開發用 Bot** 傳送訊息 -> 觸發本地程式碼。
*   對 **正式版 Bot** 傳送訊息 -> 觸發線上程式碼。

Enjoy coding!
