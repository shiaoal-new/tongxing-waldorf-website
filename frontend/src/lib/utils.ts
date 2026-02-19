/**
 * 深度合併兩個物件
 */
export function deepMerge(target: any, source: any) {
    if (!source) return target;
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

/**
 * 從字典中根據路徑獲取值 (例如 "hero.title")
 */
export function getValueByPath(obj: any, path: string): any | null {
    if (!path || !obj) return null;

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

/**
 * 在 YAML 文本中尋找某個列表項目的行號
 * @param lines YAML 文本按行分割的陣列
 * @param startIdx 開始搜尋的索引 (0-indexed)
 * @param listKey 列表屬性名稱 (例如 "sections", "blocks", "items")
 */
export function findListLineNumbers(lines: string[], startIdx: number, listKey: string): number[] {
    const lineNumbers: number[] = [];
    let inList = false;
    let listIndent = -1;

    const keyRegex = new RegExp(`^${listKey}\\s*:`);

    for (let i = Math.max(0, startIdx); i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();
        if (trimmed.length === 0) continue;

        const indent = line.length - trimmed.length;

        if (!inList) {
            if (keyRegex.test(trimmed)) {
                inList = true;
                listIndent = indent;
                continue;
            }
        } else {
            // 如果縮進回退到 listKey 同級或更少，說明塊結束
            if (indent <= listIndent && !/^\s*$/.test(line)) {
                break;
            }

            // 列表子項：縮進通常比 listKey 多 2 (YAML 標準)，且以 "- " 開頭
            // 這裡放寬一點，只要縮進比 listKey 多且以 "- " 開頭即可，但精確匹配更好
            if (indent === listIndent + 2 && trimmed.startsWith('- ')) {
                lineNumbers.push(i + 1); // 1-indexed
            }
        }
    }

    return lineNumbers;
}
