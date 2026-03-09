import React, { createContext, useContext, ReactNode } from 'react';

type SectionTheme = 'light' | 'dark';

interface SectionThemeContextType {
    theme: SectionTheme;
    isDark: boolean;
    isLight: boolean;
}

const SectionThemeContext = createContext<SectionThemeContextType | undefined>(undefined);

export function SectionThemeProvider({ theme, children }: { theme: SectionTheme; children: ReactNode }) {
    const value = {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    };

    return (
        <SectionThemeContext.Provider value={value}>
            {children}
        </SectionThemeContext.Provider>
    );
}

export function useSectionTheme() {
    const context = useContext(SectionThemeContext);
    // If not in a section, fallback to null or a default based on system/global theme
    // But for now, returning undefined is fine or we can return a default.
    return context;
}
