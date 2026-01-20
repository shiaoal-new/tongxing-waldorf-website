import { ReactNode } from "react";

interface PageContentProps {
    children: ReactNode;
    navbarPadding?: boolean;
    backgroundSrc?: string;
    className?: string;
}

/**
 * PageContent Component
 * 
 * 主內容容器組件,使用語義化的 <main> 標籤
 * 負責處理:
 * - 導航欄的 padding 偏移
 * - 背景透明度(當有視差背景時)
 * - 陰影效果
 * - 自定義樣式類
 */
export default function PageContent({
    children,
    navbarPadding = false,
    backgroundSrc,
    className = ""
}: PageContentProps) {
    return (
        <main
            className={`
                ${navbarPadding ? "pt-20" : ""} 
                ${backgroundSrc ? "bg-transparent" : "bg-brand-bg dark:bg-trueGray-900"} 
                relative z-10 
                shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] 
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {children}
        </main>
    );
}
