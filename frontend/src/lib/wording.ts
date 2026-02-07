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
        const resolved = getValueByPath(dictionary, data);
        if (resolved !== null) return resolved;

        // 如果看起來像是 key (e.g. "hero.title", "section-1.desc") 且未找到
        // 簡單規則：包含至少一個點，且不包含空白
        if (onMissing && /^[a-z0-9_-]+(\.[a-z0-9_-]+)+$/i.test(data)) {
            onMissing(data);
        }
        return data; // fallback to ID
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
            result[key] = resolveWording(data[key], dictionary, onMissing);
        }
        return result;
    }

    return data;
}

/**
 * 從字典中根據路徑獲取值 (例如 "hero.title")
 */
function getValueByPath(obj: any, path: string): string | null {
    if (!path) return null;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return null;
        }
        current = current[part];
    }

    return current !== undefined ? current : null;
}
