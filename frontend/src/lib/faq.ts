import { FaqItem } from '../types/content';
import { loadAllData } from './dataLoader';

/**
 * 取得所有 FAQ
 */
export function getAllFaq(): FaqItem[] {
    // 載入時會包含所有欄位，TypeScript 會在編譯時檢查
    return loadAllData<FaqItem>('faq', {
        excludeWording: true,
    }) as FaqItem[];
}
