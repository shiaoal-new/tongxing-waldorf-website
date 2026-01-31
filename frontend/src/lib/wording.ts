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
export function resolveWording(data: any, dictionary: any): any {
    if (!data || !dictionary) return data;

    // 如果是字串，嘗試替換
    if (typeof data === 'string') {
        return getValueByPath(dictionary, data) || data;
    }

    // 如果是陣列，遞迴處理每個元素
    if (Array.isArray(data)) {
        return data.map(item => resolveWording(item, dictionary));
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
            result[key] = resolveWording(data[key], dictionary);
        }
        return result;
    }

    return data;
}

/**
 * 從字典中根據路徑獲取值 (例如 "hero.title")
 */
function getValueByPath(obj: any, path: string): string | null {
    if (!path || !path.includes('.')) return null;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined) return null;
        current = current[part];
    }

    return typeof current === 'string' ? current : null;
}
