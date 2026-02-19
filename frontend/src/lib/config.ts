/**
 * 通用配置檔案
 * 用於存放全域使用的常數與配置
 */

export const CONFIG = {
    // LINE Login 配置
    LINE: {
        CLIENT_ID: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '2008899796',
    },

    // 資料目錄路徑
    DATA: {
        SEARCH_DIRS: ['pages', 'courses', 'faq', 'faculty'] as const,
        WORDING_FALLBACK_DIR: 'wordings',
    },

    // UI 配置
    UI: {
        DEFAULT_STYLE: 'default',
    },

    // LocalStorage 鍵名
    STORAGE_KEYS: {
        WORDING_STYLE: 'tongxing_wording_styles',
        QUESTIONNAIRE_PREFIX: 'tongxing_questionnaire_progress_',
        DEBUG_GRID: 'tongxing_debug_grid',
        SIMULATOR_PREFIX: 'tongxing_simulator_',
    }
};
