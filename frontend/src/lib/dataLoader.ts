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

/**
 * 讀取單一資料檔案
 */
function readDataFile(fullPath: string): { data: any; content: string } {
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

    return { data, content };
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
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = readDataFile(fullPath);

            // 預設轉換
            let item: any = {
                slug: data.slug || slug,
                ...data,
                content: content,
            };

            // 如果有自訂轉換函數，則使用
            if (transform) {
                item = transform(item, fullPath, fileContents);
            }

            return item as T;
        });

    // 排序
    if (sortBy) {
        return allData.sort((a, b) => {
            const orderA = a[sortBy] || 999;
            const orderB = b[sortBy] || 999;
            return orderA - orderB;
        });
    }

    return allData;
}

/**
 * 根據 slug/id 取得單一資料項目
 */
export function getDataBySlug<T extends DataItem>(dataType: DataType, slug: string): T | undefined {
    const allData = loadAllData<T>(dataType);
    return allData.find(item => item.slug === slug || item.id === slug);
}
