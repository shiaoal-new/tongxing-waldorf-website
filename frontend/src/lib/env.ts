/**
 * 環境檢查工具
 */

export const isDevEnvironment = (): boolean => {
    // 1. 本地開發環境
    if (process.env.NODE_ENV === 'development') return true;

    // 2. 雲端測試環境 (透過環境變數判斷)
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
    if (appEnv === 'dev' || appEnv === 'local' || appEnv === 'preview') return true;

    return false;
};

export const isProductionEnvironment = (): boolean => {
    return !isDevEnvironment();
};
