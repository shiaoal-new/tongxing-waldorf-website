---
name: faculty-photo-processor
description: 專門用於處理同心華德福教師照片的技術規範與工具腳本。包含自動化生成「鉛筆素描 (Pencil Sketch)」特效、風格同步以及圖片優化的流程。
---

# Faculty Photo Processor Skill 🎨

本 Skill 旨在確保同心華德福教師團隊的照片在視覺上保持高度一致性。特別是由彩色相片轉換為具有「藝術感、高透亮、低飽和」風格的 **Pencil 版照片（魔法報紙特效）**。

## 🎯 核心目標
1.  **風格同步**：透過精確的 AI 提示詞 (Prompt)，確保新照片在藝術感與色調上完美契合「詹雅智」老師的初始範式。
2.  **規格化**：透過腳本強制使用 WebP 格式，並進行檔案體積優化。

## 🛠️ 工具與流程 (Mandatory Flow)

### 1. AI 藝術生成協議 (Nanobanana 2) —— **強制執行 (Primary)**
由於傳統濾鏡（如 Sharp/Photoshop）無法捕捉「魔法報紙」所需的藝術筆觸與靈動感，**必須**優先使用 `generate_image` 工具進行生成。

**指令範寫 (Prompt Template)**：
> "Transform the person in the image into a colored pencil sketch style, strongly referencing the artistic style of [Provide Reference Image Path]. Use light, soft colors and fine-line pencil textures. The style should be an artistic colored pencil drawing with subtle shading and a clean, high-key background. Maintain the exact likeness and features of the person. nanobanana 2 style."

**執行邏輯**：
- 使用 `generate_image` 帶入原圖與參考圖（例：詹雅智_pencil.webp）。
- 獲得成品後，再使用下方腳本進行最後的 WebP 轉換與規格格式化。

### 2. 輔助格式化腳本 (Secondary/Post-processing)
腳本路徑：`.agent/skills/faculty-photo-processor/scripts/process_faculty_photo.js`

此腳本**僅用於** AI 生成後的 WebP 格式轉換與檔案大小優化。
-   **格式優化**：確保產出的 `_pencil.webp` 格式正確，並在維持高品質的情況下最小化檔案體積。

## 📁 檔案命名規則
-   **彩色原始檔**：`{教師姓名}.webp`
-   **鉛筆特效檔**：`{教師姓名}_pencil.webp` (放置於 `frontend/public/img/teacher-photos/`)

## 📋 檢查清單 (Checklist)
- [ ] 鉛筆版照片是否具有足夠的亮部（避免髒灰感）？
- [ ] 是否已轉換為 WebP 格式？
- [ ] 是否已同步更新 `/frontend/src/data/faculty/{name}.yml` 中的 `media` 與 `hover_media` 路徑？
