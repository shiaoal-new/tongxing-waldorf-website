import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type WordingStyles = Record<string, string>; // pageId -> styleName

interface WordingContextType {
    styles: WordingStyles;
    setStyle: (pageId: string, style: string) => void;
    getStyle: (pageId: string) => string;
    missingKeys: string[];
    reportMissingKeys: (keys: string[]) => void;
    clearMissingKeys: () => void;
}

const WordingContext = createContext<WordingContextType | undefined>(undefined);

const STORAGE_KEY = 'tongxing_wording_styles';

export const WordingProvider = ({ children }: { children: ReactNode }) => {
    const [styles, setStyles] = useState<WordingStyles>({});
    const [missingKeys, setMissingKeys] = useState<string[]>([]);

    // 1. 初始載入：從 localStorage 讀取
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setStyles(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse wording styles', e);
            }
        }
    }, []);

    // 2. 切換風格
    const setStyle = (pageId: string, style: string) => {
        const newStyles = { ...styles, [pageId]: style };
        setStyles(newStyles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStyles));
        // Reset missing keys on style change
        setMissingKeys([]);
    };

    // 3. 讀取風格 (預設為 default)
    const getStyle = (pageId: string) => {
        // 只有在真正的 Production 環境 (非 dev, 非 local) 才強行回傳 default
        const isActuallyProd =
            process.env.NODE_ENV === 'production' &&
            process.env.NEXT_PUBLIC_APP_ENV !== 'dev' &&
            process.env.NEXT_PUBLIC_APP_ENV !== 'local';

        if (isActuallyProd) return 'default';
        return styles[pageId] || 'default';
    };

    const reportMissingKeys = (keys: string[]) => {
        setMissingKeys(prev => {
            const newKeys = [...prev];
            let changed = false;
            keys.forEach(k => {
                if (!newKeys.includes(k)) {
                    newKeys.push(k);
                    changed = true;
                }
            });
            return changed ? newKeys : prev;
        });
    };

    const clearMissingKeys = () => {
        setMissingKeys([]);
    };

    return (
        <WordingContext.Provider value={{ styles, setStyle, getStyle, missingKeys, reportMissingKeys, clearMissingKeys }}>
            {children}
        </WordingContext.Provider>
    );
};

export const useWordingContext = () => {
    const context = useContext(WordingContext);
    if (!context) {
        throw new Error('useWordingContext must be used within a WordingProvider');
    }
    return context;
};
