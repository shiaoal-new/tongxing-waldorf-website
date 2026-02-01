import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * 伺服器端獲取文案字典 (用於 getStaticProps)
 * 此檔案僅在 Node.js 環境中使用
 */
export function getWordingDictionary(pageId: string, style: string = 'default', extraCategories: string[] = []) {
    const categories = [pageId, ...extraCategories];
    let mergedDictionary = {};

    categories.forEach(cat => {
        const filePath = path.join(process.cwd(), `src/data/wordings/${cat}/${style}.yml`);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = yaml.load(content) || {};
                mergedDictionary = deepMerge(mergedDictionary, data);
            } catch (e) {
                console.error(`Error loading wording for ${cat}:`, e);
            }
        }
    });

    return mergedDictionary;
}

function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

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
