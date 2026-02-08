import fs from 'fs';
import path from 'path';
import yaml, { Schema, Type } from 'js-yaml';

// Define the !include custom type
const createIncludeType = (basePath: string) => {
    return new Type('!include', {
        kind: 'scalar',
        construct: (data: string) => {
            const fullPath = path.isAbsolute(data) ? data : path.join(basePath, data);
            if (!fs.existsSync(fullPath)) {
                console.warn(`Included file not found: ${fullPath}`);
                return null;
            }
            return loadYamlWithIncludes(fullPath);
        }
    });
};

function loadYamlWithIncludes(fullPath: string): any {
    if (!fs.existsSync(fullPath)) return {};
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const basePath = path.dirname(fullPath);
    // js-yaml v4 uses DEFAULT_SCHEMA.extend instead of Schema.create
    const schema = yaml.DEFAULT_SCHEMA.extend([createIncludeType(basePath)]);
    return yaml.load(fileContents, { schema }) || {};
}

/**
 * 伺服器端獲取文案字典 (用於 getStaticProps)
 * 此檔案僅在 Node.js 環境中使用
 */
export function getWordingDictionary(pageId: string, style: string = 'default', extraCategories: string[] = []) {
    const categories = [pageId, ...extraCategories];
    let mergedDictionary = {};

    const searchDirs = ['pages', 'courses', 'faq'];
    const baseCwd = process.cwd();
    const possibleRoots = [baseCwd, path.join(baseCwd, 'frontend')];

    categories.forEach(cat => {
        let filePath: string | null = null;

        // 1. Check new structure in multiple potential folders
        for (const root of possibleRoots) {
            if (filePath) break;
            for (const dir of searchDirs) {
                const newPath = path.join(root, `src/data/${dir}/${cat}.wording.${style}.yml`);
                if (fs.existsSync(newPath)) {
                    filePath = newPath;
                    break;
                }
            }
        }

        // 2. Fallback to old path: src/data/wordings/cat/style.yml
        if (!filePath) {
            for (const root of possibleRoots) {
                const oldPath = path.join(root, `src/data/wordings/${cat}/${style}.yml`);
                if (fs.existsSync(oldPath)) {
                    filePath = oldPath;
                    break;
                }
            }
        }

        if (filePath && fs.existsSync(filePath)) {
            try {
                const data = loadYamlWithIncludes(filePath);
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
        // 處理轉義
        if (data.startsWith('\\$')) {
            return data.substring(1);
        }

        // 顯式聲明
        if (data.startsWith('$')) {
            const id = data.substring(1);
            return getValueByPath(dictionary, id) || id;
        }

        return data;
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
