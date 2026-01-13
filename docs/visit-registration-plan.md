# 參訪預約功能實作規劃書 (Visit Registration Implementation Plan)

本文件詳述如何將目前的靜態參訪預約原型轉換為基於 Firebase 的真實功能。

## 1. 現狀分析
目前的「參訪預約」功能僅為前端原型，存在以下限制：
- **數據靜態化**：場次時間與剩餘名額 (Quota) 硬編碼在 `initialVisitDates.json` 中。
- **狀態非持久化**：預約成功後僅更新本地 React State，重新整理後數據會重置。
- **缺乏服務端驗證**：未在後端驗證名額是否充足，容易產生超額預約 (Overbooking)。
- **技術債**：雖有 Apps Script 的殘留代碼，但未與專案現有的 Firebase 本地開發/部署流程整合。

## 2. 目標架構
我們將使用 Firebase 生態系來實現一個穩定、具備交易安全性的預約系統：
- **前端 (Next.js)**：從 Firestore 動態獲取場次，並發送預約請求。
- **後端 (Firebase Functions)**：處理預約邏輯、名額核減及觸發通知。
- **資料庫 (Cloud Firestore)**：存儲場次資訊與報名紀錄。
- **通知服務**：整合 SMTP 或 Firebase 擴充功能發送預約成功確認信。

## 3. 資料庫設計 (Cloud Firestore)

### 集合：`visit_sessions` (參訪場次)
用於管理可預約的時間段。具備以下欄位：
- `id`: string (Document ID)
- `date`: string (例如 "2024-03-15 (五)")
- `time`: string (例如 "09:30 - 11:30")
- `total_seats`: number (總名額)
- `remaining_seats`: number (剩餘名額，需具備原子性更新)
- `order`: number (排序用)
- `status`: "open" | "closed" | "full"

### 集合：`visit_registrations` (報名紀錄)
用於存儲報名者的詳細資訊。具備以下欄位：
- `session_id`: string (關聯到 visit_sessions.id)
- `user_id`: string (關聯到 users.id，用於會員查詢)
- `name`: string
- `cellphone`: string
- `visitors`: number (預約人數)
- `timestamp`: serverTimestamp
- `status`: "confirmed" | "cancelled"

## 4. API 介面定義 (Firebase Functions)

### 1. `getVisitSessions` (HTTPS GET)
- **路徑**: `/getVisitSessions`
- **功能**: 回傳所有狀態為 `open` 且日期尚未過期的場次。
- **輸出**: `Array<{id, date, time, remaining_seats, total_seats}>`

### 2. `registerVisit` (HTTPS POST - 需要登入)
- **功能**: 
    1. **身分驗證**: 從 Session 中取得 `user_id`。
    2. **寫入**: 將 `user_id` 存入 `visit_registrations`。
    3. (其餘邏輯同前所述...)

### 3. `getMyRegistrations` (HTTPS GET - 需要登入)
- **路徑**: `/getMyRegistrations`
- **功能**: 查詢 `visit_registrations` 中 `user_id` 符合當前用戶且 `status == "confirmed"` 的記錄。
- **輸出**: `Array<{id, session_id, date, time, visitors, status}>`

### 4. `cancelVisit` (HTTPS POST - 需要登入)
- **路徑**: `/cancelVisit`
- **參數**: `{ registrationId }`
- **功能**:
    1. **驗證**: 確保該預約紀錄屬於當前用戶。
    2. **交易 (Transaction)**:
        - 將預約狀態更新為 `cancelled`。
        - 根據原本預約人數，將 `visit_sessions` 的 `remaining_seats` 加回去。

## 5. 核心邏輯流程

### 防超賣機制 (Concurrency Control)
為了確保在高併發情況下不會發生超售，`registerVisit` 必須使用 Firestore **Transactions**。
```typescript
await db.runTransaction(async (t) => {
  const sessionRef = db.collection('visit_sessions').doc(sessionId);
  const session = await t.get(sessionRef);
  
  if (session.data().remaining_seats < visitors) {
    throw new Error('名額不足');
  }
  
  t.update(sessionRef, {
    remaining_seats: session.data().remaining_seats - visitors
  });
  
  const registrationRef = db.collection('visit_registrations').doc();
  t.set(registrationRef, { ...formData, timestamp: admin.firestore.FieldValue.serverTimestamp() });
});
```

### 郵件通知 (Email Trigger)
建議使用 Firebase `Trigger Email from Firestore` 擴充功能。當 `visit_registrations` 有新文檔寫入時，自動發送確認信給 `data.email`。

## 6. 開發步驟與時程建議

### 第一階段：基礎實作 (Backend First)
1. **Firestore 初始化**: 寫入初始場次數據。
2. **範例 Cloud Functions**: 實作 `getVisitSessions` 與 `registerVisit` 基本框架。

### 第二階段：前端對接 (Frontend Integration)
1. **數據獲取**: 在 `VisitSchedule` 組件中使用 `SWR` 或 `useEffect` 取代靜態 JSON。
2. **表單提交**: 修改 `VisitRegistrationForm` 的提交邏輯，對接後端 API。
3. **優化 UI**: 增加提交時的禁用狀態 (Disabled) 與加載動畫。

### 第三階段：通知與完善
1. **郵件模板**: 設定預約成功通知信的內容格式。
2. **管理後台**: 實作一個簡單的 Dashboard 供管理員查看報名清單與手動調整名額。

---

## 7. 會員系統與多帳號連結 (Member & Auth System)

我們將採用 **Auth.js (NextAuth.js)** 作為核心鑑定框架，並配置 **Firebase Adapter** 將使用者資料存儲在 Firestore 的 `users` 與 `accounts` 集合中。

### 支援的登入方式
1.  **Google Account**: 透過 `GoogleProvider` 實作。
2.  **LINE Login**: 
    - 透過 `LineProvider` 實作。
    - **加好友整合**: 在 LINE 登入 URL 中加入 `bot_prompt=normal` (或 `aggressive`)，引導使用者在登入的同時關注官方帳號。
3.  **Apple ID**: 預留 `AppleProvider` 接口，待開發者帳號就緒後開啟。

### 多帳號連結 (Account Linking) 邏輯
Auth.js 的 `FirestoreAdapter` 支援同一個 User ID 對應多個 Account。
- **自動連結 (Email 反查)**：若 Google 與 LINE 提供相同的電子郵件，且該信箱已驗證，Auth.js 可自動將兩者關聯至同一個 `user_id`。
- **手動連結**：使用者登入 A 帳號後，在設置頁面點擊「連結 LINE」，觸發 LINE 登入流程。由於當前 Session 已存在 `user_id`，系統會將 LINE 的資訊寫入該 `user_id` 下的 `accounts` 集合。

## 8. 新增功能 UI/UX 流程

### 查看與取消預約
1.  **使用者專區**: 新增「我的預約」頁面。
2.  **查詢邏輯**: 調用 `getMyRegistrations` API 動態顯示預約列表。
3.  **取消機制**:
    - 提供「取消預約」按鈕。
    - 點選後彈出確認對話框。
    - 呼叫 `cancelVisit` API，並在成功後重新整理列表。

### 會員登入引導
1.  **報名前置**: 當點擊「立即報名」時，若偵測到未登入，則觸發 **LINE 登入** 流程。
2.  **好友連動**: 透過 LINE Login 的 `bot_prompt: "normal"` 參數，要求使用者在授權登入時同步將官方帳號加為好友。
3.  **資料簡化**: 登入後，報名表單僅需填寫姓名與手機，不再需要填寫 Email，亦不寄送確認信件。

---
**備註**: 優先實作 LINE 登入 (含加好友提示) 與報名流程。
