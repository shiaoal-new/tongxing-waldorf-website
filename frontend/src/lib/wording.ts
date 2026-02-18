/**
 * Wording Resolver Utility
 * 用於在開發環境下將數據物件中的 ID 鍵轉換為對應風格的文字
 */

/**
 * 深度解析並替換物件中的文案 ID
 * @param data 原始數據物件 (例如 page data)
 * @param dictionary 文案字典 (來自 JSON 檔案)
 * @returns 替換後的數據物件
 */
export function resolveWording(data: any, dictionary: any, onMissing?: (key: string) => void): any {
    if (!data || !dictionary) return data;

    // 如果是字串，嘗試替換
    if (typeof data === 'string') {
        // 處理轉義: "\$text" -> "$text" (不解析為 ID)
        if (data.startsWith('\\$')) {
            return data.substring(1);
        }

        // 1. 顯式聲明: 只有 "$" 開頭的才視為文案 ID
        if (data.startsWith('$')) {
            const id = data.substring(1); // 移除 "$"
            const resolved = getValueByPath(dictionary, id);

            if (resolved !== null) {
                return resolved;
            }

            // 如果找不到內容，回報缺失
            if (onMissing) {
                onMissing(`[Missing] ${id}`);
            }
            return id; // fallback to ID without $
        }

        // 2. 啟發式檢查 (僅開發環境): 檢查是否漏掉了 "$" 符號
        // 規則：包含點、不含空格、且必須以字母開頭 (以避開日期 2012.10)
        if (onMissing && /^[a-z][a-z0-9_-]*(\.[a-z0-9_-]+)+$/i.test(data)) {
            const resolved = getValueByPath(dictionary, data);
            if (resolved !== null) {
                // 如果在字典裡找到了，提醒用戶這是一個漏掉 $ 的 ID
                onMissing(`[Missed $ prefix] ${data}`);
            } else {
                // 如果看起來像 ID 但字典裡沒有，也發出警告
                onMissing(`[Unknown ID] ${data}`);
            }
        }

        return data; // 普通字串，直接回傳
    }

    // 如果是陣列，遞迴處理每個元素
    if (Array.isArray(data)) {
        return data.map(item => resolveWording(item, dictionary, onMissing));
    }

    // 如果是物件，遞迴處理每個屬性
    if (typeof data === 'object') {
        const result: any = {};
        for (const key in data) {
            // 排除以 _ 開頭的私有屬性或已處理屬性
            if (key.startsWith('_')) {
                result[key] = data[key];
                continue;
            }
            const resolvedValue = resolveWording(data[key], dictionary, onMissing);

            // 啟發式繼承：如果子項沒有自己的路徑且父項有，則繼承（針對內聯定義的區塊）
            if (resolvedValue && typeof resolvedValue === 'object' && !Array.isArray(resolvedValue) && !resolvedValue._sourceFile && data._sourceFile) {
                resolvedValue._sourceFile = data._sourceFile;
            }

            result[key] = resolvedValue;
        }
        return result;
    }

    return data;
}

/**
 * 從字典中根據路徑獲取值 (例如 "hero.title")
 */
function getValueByPath(obj: any, path: string): any | null {
    if (!path) return null;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return null;
        }
        current = current[part];
    }

    return (current !== undefined && current !== null) ? current : null;
}
