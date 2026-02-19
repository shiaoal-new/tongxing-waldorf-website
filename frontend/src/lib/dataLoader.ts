import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { loadYamlWithIncludes } from './yaml-loader';

/**
 * 通用資料類型
 */
export type DataType = 'pages' | 'courses' | 'faq' | 'faculty';

/**
 * 通用資料項目介面
 */
export interface DataItem {
    slug?: string;
    id?: string;
    [key: string]: any;
}

/**
 * 取得資料目錄
 * @param dataType 資料類型 (pages, courses, faq, faculty)
 */
export function getDataDirectory(dataType: DataType): string {
    const baseCwd = process.cwd();
    const p1 = path.join(baseCwd, `src/data/${dataType}`);
    const p2 = path.join(baseCwd, `frontend/src/data/${dataType}`);

    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1; // Fallback
}

/**
 * 取得資料項目 ID
 * 根據檔名產生 slug 或 id
 */
function getItemId(fileName: string, extension: string): string {
    return fileName.replace(new RegExp(`\\${extension}$`), '');
}

// 簡單的快取機制，避免重複讀取相同檔案
const dataCache: Record<string, { data: any; content: string; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 分鐘快取

/**
 * 讀取單一資料檔案 (帶快取)
 */
function readDataFile(fullPath: string): { data: any; content: string } {
    const now = Date.now();
    const cached = dataCache[fullPath];

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        return cached;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const extension = path.extname(fullPath);

    let data: any = {};
    let content = '';

    if (extension === '.yml' || extension === '.yaml') {
        data = loadYamlWithIncludes(fullPath);
        if (data.content) {
            content = data.content;
        }
    } else {
        const matterResult = matter(fileContents);
        data = matterResult.data;
        content = matterResult.content;
    }

    const result = { data, content };
    dataCache[fullPath] = { ...result, timestamp: now };

    return result;
}

/**
 * 載入所有資料
 * @param dataType 資料類型
 * @param options 選項
 * @param options.excludeWording 是否排除 .wording. 檔案
 * @param options.sortBy 排序欄位
 * @param options.transform 轉換函數
 */
export function loadAllData<T extends DataItem>(
    dataType: DataType,
    options: {
        excludeWording?: boolean;
        sortBy?: string;
        transform?: (item: DataItem, fullPath: string, rawContent: string) => T;
    } = {}
): T[] {
    const { excludeWording = true, sortBy, transform } = options;
    const directory = getDataDirectory(dataType);

    if (!fs.existsSync(directory)) {
        return [];
    }

    const fileNames = fs.readdirSync(directory);
    const allData = fileNames
        .filter(fileName => {
            const isValidExtension = fileName.endsWith('.md') || fileName.endsWith('.yml') || fileName.endsWith('.yaml');
            if (!isValidExtension) return false;
            if (excludeWording && fileName.includes('.wording.')) return false;
            return true;
        })
        .map(fileName => {
            const extension = path.extname(fileName);
            const slug = getItemId(fileName, extension);
            const fullPath = path.join(directory, fileName);

            // 使用帶快取的讀取函數
            const { data, content } = readDataFile(fullPath);

            // 預設轉換
            let item: any = {
                slug: data.slug || slug,
                ...data,
                content: content,
            };

            // 如果有自訂轉換函數，則使用
            if (transform) {
                // 原本這裡會 fs.readFileSync 第二次，現在我們可以直接拿到 content (或者根據需要傳入 rawContent)
                // 為了保持相容性，如果 transform 需要完整的 rawContent (含 frontmatter)，可以使用快取優化過的方法
                const rawContent = (extension === '.md') ? `---\n${matter.stringify('', data)}---\n${content}` : JSON.stringify(data);
                item = transform(item, fullPath, rawContent);
            }

            return item as T;
        });

    // 排序
    if (sortBy) {
        return allData.sort((a, b) => {
            const orderA = a[sortBy] || 999;
            const orderB = b[sortBy] || 999;
            return (typeof orderA === 'number' && typeof orderB === 'number') ? orderA - orderB : 0;
        });
    }

    return allData;
}

/**
 * 根據 slug/id 取得單一資料項目
 */
export function getDataBySlug<T extends DataItem>(dataType: DataType, slug: string): T | undefined {
    // 這裡原本會呼叫 loadAllData，這很好，因為 loadAllData 現在已經有快取了
    const allData = loadAllData<T>(dataType);
    return allData.find(item => item.slug === slug || item.id === slug);
}
