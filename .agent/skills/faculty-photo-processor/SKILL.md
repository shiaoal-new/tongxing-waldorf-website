---
name: faculty-photo-processor
description: 專門用於處理同心華德福教師照片的技術規範與工具腳本。包含自動化生成「鉛筆素描 (Pencil Sketch)」特效、風格同步以及圖片優化的流程。
---

# Faculty Photo Processor Skill 🎨

本 Skill 旨在確保同心華德福教師團隊的照片在視覺上保持高度一致性。特別是由彩色相片轉換為具有「藝術感、高透亮、低飽和」風格的 **Pencil 版照片（魔法報紙特效）**。

## 🎯 核心目標
1.  **風格同步**：確保新任教師的照片在灰階對比、亮度與 Gamma 操作上，完美契合「詹雅智」老師的初始範式。
2.  **自動化處理**：通過 `sharp` 腳本快速生成對應的 `_pencil.webp` 檔案。
3.  **規格化**：強制使用 WebP 格式，並優化檔案大小。

## 🛠️ 工具與流程 (Mandatory Flow)

### 1. AI 藝術生成協議 (Nanobanana 2) —— **強制執行 (Primary)**
由於傳統濾鏡（如 Sharp/Photoshop）無法捕捉「魔法報紙」所需的藝術筆觸與靈動感，**必須**優先使用 `generate_image` 工具進行生成。

**指令範寫 (Prompt Template)**：
> "Transform the person in the image into a colored pencil sketch style, strongly referencing the artistic style of [Provide Reference Image Path]. Use light, soft colors and fine-line pencil textures. The style should be an artistic colored pencil drawing with subtle shading and a clean, high-key background. Maintain the exact likeness and features of the person. nanobanana 2 style."

**執行邏輯**：
- 使用 `generate_image` 帶入原圖與參考圖（例：詹雅智_pencil.webp）。
- 獲得成品後，再使用下方腳本進行最後的 WebP 轉換與規格格式化。

### 2. 輔助處理腳本 (Secondary/Post-processing)
腳本路徑：`.agent/skills/faculty-photo-processor/scripts/process_faculty_photo.js`

雖然腳本具備濾鏡模擬功能，但目前**僅建議**用於 AI 生成後的「最終曝光微整」或「WebP 格式轉換」。腳本默認提供：
-   **灰階或基礎亮調分析**：輔助 AI 更準確識別線條。
-   **格式優化**：確保產出的 `_pencil.webp` 格式正確。

## 📁 檔案命名規則
-   **彩色原始檔**：`{教師姓名}.webp`
-   **鉛筆特效檔**：`{教師姓名}_pencil.webp` (放置於 `frontend/public/img/teacher-photos/`)

## 📋 檢查清單 (Checklist)
- [ ] 鉛筆版照片是否具有足夠的亮部（避免髒灰感）？
- [ ] 是否已轉換為 WebP 格式？
- [ ] 是否已同步更新 `/frontend/src/data/faculty/{name}.yml` 中的 `media` 與 `hover_media` 路徑？
