import { createContext, useContext, ReactNode } from 'react';
import { PageContextValue } from '../types/content';

/**
 * PageDataContext - 提供頁面級別的共享數據
 * 用於避免在組件樹中層層傳遞 props
 */
const PageDataContext = createContext<PageContextValue>({
    getMemberDetails: () => null,
    setSelectedMember: () => { },
    faqList: [],
    getImagePath: (path: string) => path,
});

export const PageDataProvider = PageDataContext.Provider;

export const usePageData = (): PageContextValue => {
    const context = useContext(PageDataContext);
    if (!context) {
        throw new Error('usePageData must be used within a PageDataProvider');
    }
    return context;
};

export default PageDataContext;
