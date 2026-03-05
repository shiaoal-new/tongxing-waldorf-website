import ListRenderer, { LIST_LAYOUT_CONFIG } from "../ListLayoutRenderer";

import { usePageData } from "../../context/PageDataContext";
import { useWordingContext } from "../../context/WordingContext";
import BlockDispatcher from "./BlockDispatcher";
import { ListBlock as ListBlockType, FaqItem, ListItem, LayoutConfig } from "../../types/content";
import { useState, useEffect, useRef, useCallback } from "react";
import { BlockPolicy } from './interfaces';
import { useVisibilityTrigger } from '../../hooks/useVisibilityTrigger';

/**
 * 準備列表數據，將 FAQ 或普通項目統一轉化為規整的 Block 結構
 */
function prepareListItems(block: ListBlockType, faqList: FaqItem[], direction: string): ListItem[] {
    if (block.faq_ids) {
        return block.faq_ids
            .map(id => {
                const faq = faqList.find(f => f.id === id);
                return faq ? { ...faq, type: 'faq_item' } as FaqItem & { type: 'faq_item' } : null;
            })
            .filter((item): item is FaqItem & { type: 'faq_item' } => Boolean(item));
    }

    const rawItems = Array.isArray(block.items) ? block.items : [];
    return rawItems.map(item => ({
        ...item,
        type: (item as any).item_type || block.item_type || "text"
    })) as ListItem[];
}

interface ListBlockProps {
    block: ListBlockType;
    align?: 'left' | 'center' | 'right';
    lazy?: boolean; // Enable lazy loading for list items
    lazyRootMargin?: string; // Root margin for lazy loading (default: "300px")
}

/**
 * Helper to extract layout configuration for Design A
 */
export function getLayoutSettings(block: ListBlockType) {
    let method = "card_deck_swiper";
    let mobileMethod: string | undefined = undefined;
    let config: LayoutConfig = {};
    let mobileConfig: LayoutConfig | undefined = undefined;

    // Design A: Parse 'layout' property
    if (block.layout) {
        if (typeof block.layout === 'string') {
            method = block.layout;
        } else {
            // It's a ResponsiveLayout object
            const layoutObj = block.layout;

            // 1. Base/Desktop settings
            // If explicit desktop object exists, use it. Otherwise use root method/config
            if (layoutObj.desktop) {
                method = layoutObj.desktop.method;
                config = layoutObj.desktop.config || {};
            } else if (layoutObj.method) {
                // Shared / Default method
                method = layoutObj.method;
                config = layoutObj.config || {};
            }

            // 2. Mobile settings
            if (layoutObj.mobile) {
                mobileMethod = layoutObj.mobile.method;
                mobileConfig = layoutObj.mobile.config;
            } else {
                // Fallback behavior: if no explicit mobile setting, mobile behaves like desktop
                // OR we could check if we want to inherit behavior.
                // Currently keeping it simple: if no mobile override, ListRenderer might just use desktop layout
            }
        }
    }

    // Fallback: if mobileConfig is not set but we have a mobileMethod (from legacy or new), 
    // we might want to default mobileConfig to config if they share the same method, OR separate.
    // For now, let's keep them distinct to avoid pollution unless explicitly requested.
    // BUT per user request "use same layout method and layout config for both",
    // if we parsed `layout: { method: 'carousel', config: {...} }`, we have method='carousel', config={...},
    // and mobileMethod=undefined. ListRenderer handles mobileMethod=undefined by using layout (desktop).

    return { method, mobileMethod, config, mobileConfig };
}

/** FAQ 手風琴骨架屏 — 形狀與實際 FAQ 吻合，減少 CLS */
function FaqSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
                </div>
            ))}
        </div>
    );
}


/**
 * ListBlock Component
 * 渲染列表塊，支持 FAQ 數據的懶加載
 */
export default function ListBlock({ block, align, lazy = true, lazyRootMargin = "300px" }: ListBlockProps) {
    const { faqList: contextFaqList } = usePageData();
    const { getStyle } = useWordingContext();

    // 獲取目前頁面 ID (從 path 獲取或預設 index)
    const pageId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || 'index' : 'index';
    const currentStyle = getStyle(pageId);

    // 確認 context 是否已包含所有必要的 FAQ ID
    const hasAllDataInContext = block.faq_ids?.every(id =>
        (contextFaqList as FaqItem[] || []).some(f => f.id === id)
    ) ?? false;

    // 需要懶加載的條件：
    // 1. lazy=true 且有 faq_ids
    // 2. 且 context 缺少數據 OR style 不是 default（需要重新 fetch 對應 style 的數據）
    const hasFaqIds = lazy && block.faq_ids && block.faq_ids.length > 0;
    const needsFetch = hasFaqIds && (!hasAllDataInContext || currentStyle !== 'default');

    // 懶加載狀態
    const [lazyFaqList, setLazyFaqList] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedStyle, setLoadedStyle] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState(false); // fetch 失敗時 fallback 到 context
    const abortControllerRef = useRef<AbortController | null>(null);

    // 數據是否已準備好顯示：
    // - 不需要 fetch → 直接用 context
    // - fetch 完成（loadedStyle 匹配）→ 用 lazy 資料
    // - fetch 失敗（fetchError）→ fallback 到 context，不卡骨架屏
    const needsLazyFaq = needsFetch;
    const dataLoaded = !needsFetch || loadedStyle === currentStyle || fetchError;

    // 當 style 改變時，重置狀態強制重新 fetch
    useEffect(() => {
        if (loadedStyle !== null && loadedStyle !== currentStyle) {
            setLoadedStyle(null);
            setLazyFaqList([]);
            setFetchError(false);
        }
    }, [currentStyle, loadedStyle]);

    // 獲取 FAQ 數據的函數
    const fetchFaqData = useCallback(async () => {
        if (dataLoaded || isLoading) return;

        // 取消之前的請求
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        const startTime = performance.now();

        try {
            // 在部署環境（靜態導出）下，API 路由不可用，我們改為請求預先生成的靜態 JSON
            // 嘗試路徑順序：1. 靜態 JSON (優選) 2. 動態 API (開發環境回退)
            const staticPath = `/data-api/faq/${currentStyle}.json`;
            const dynamicPath = `/api/data/faq?style=${currentStyle}`;

            let response = await fetch(staticPath, {
                signal: abortControllerRef.current.signal,
                headers: { 'Accept': 'application/json' }
            });

            // 如果靜態檔案不存在（例如在開發環境下還沒執行生成腳本），則嘗試動態 API
            if (!response.ok) {
                response = await fetch(dynamicPath, {
                    signal: abortControllerRef.current.signal,
                    headers: { 'Accept': 'application/json' }
                });
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch FAQ from both static and dynamic paths`);
            }

            const data: FaqItem[] = await response.json();
            setLazyFaqList(data);
            setLoadedStyle(currentStyle);

            if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
                const endTime = performance.now();
                const size = JSON.stringify(data).length;
                console.log(
                    `[ListBlock] Lazy loaded FAQ data from ${response.url.includes('.json') ? 'static' : 'dynamic'} path in ${(endTime - startTime).toFixed(2)}ms ` +
                    `(${size.toLocaleString()} bytes, ${data.length} items)`
                );
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('[ListBlock] Failed to lazy load FAQ data, falling back to context:', error);
                // fetch 失敗 → 標記 fetchError，讓元件 fallback 到 SSG context 資料，不卡骨架屏
                setFetchError(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [dataLoaded, isLoading, currentStyle]);

    // ref 永遠掛在同一個 container div，不隨骨架屏/內容切換而改變
    const containerRef = useRef<HTMLDivElement>(null);

    // 當元素進入視口 → 觸發 fetch（僅在需要 fetch 且尚未載入時啟動）
    useVisibilityTrigger(containerRef, fetchFaqData, {
        rootMargin: lazyRootMargin,
        enabled: needsLazyFaq && !dataLoaded,
    });

    // 元件卸載時取消進行中的 network request
    useEffect(() => {
        return () => { abortControllerRef.current?.abort(); };
    }, []);

    const { method, mobileMethod, config, mobileConfig } = getLayoutSettings(block);

    const direction = block.direction || (method === "vertical" ? "vertical" : "horizontal");

    // 決定使用哪個數據源
    // - 若有 lazyFaqList（已 fetch），優先使用（保證是正確 style 的數據）
    // - 若 style 是 default 且 context 有數據，直接用
    // - 其他情況用空陣列（等待加載）
    // 資料優先順序：lazy fetch 結果 > SSG context（不需 fetch 或 fetch 失敗時）> 空陣列
    const faqListToUse = lazyFaqList.length > 0
        ? lazyFaqList
        : (!needsFetch || fetchError ? (contextFaqList as FaqItem[] || []) : []);

    const listItems = prepareListItems(block, faqListToUse, direction);

    const renderListContent = () => (
        <ListRenderer
            direction={direction as "horizontal" | "vertical"}

            items={listItems}
            layout={method}
            mobile_scroll={block.mobile_scroll}
            mobile_layout={mobileMethod}
            variant={block.variant}
            layoutConfig={config}
            mobileLayoutConfig={mobileConfig}
            columns={3}
            buttons={block.buttons}
            renderItem={(item: ListItem, index: number, extra: any) => {
                const itemSrc = (item as any)._sourceFile
                    ? `${(item as any)._sourceFile}${(item as any)._sourceLine ? `:${(item as any)._sourceLine}` : ''}`
                    : undefined;
                return (
                    <div data-yml-src={itemSrc} style={{ display: 'contents' }}>
                        <BlockDispatcher block={{ ...item, ...(extra || {}) }} context="list" align={align} />
                    </div>
                );
            }}
        />
    );

    return (
        <div ref={containerRef} className="brand-container">
            {block.title && (
                <div className="mb-8">
                    <h3 className="title-bordered">
                        {block.title}
                    </h3>
                </div>
            )}
            {needsLazyFaq && !dataLoaded
                ? <FaqSkeleton />
                : renderListContent()
            }
        </div>
    );
}

export const listPolicy: BlockPolicy = {
    shouldIgnorePadding: (block: any) => {
        const { method, mobileMethod } = getLayoutSettings(block);

        const isFullWidth = (m?: string) => {
            if (!m) return false;
            return (LIST_LAYOUT_CONFIG as any)[m]?.fullWidth === true;
        };

        const desktopFull = isFullWidth(method);
        const mobileFull = isFullWidth(mobileMethod || method);

        if (desktopFull && mobileFull) return true;
        if (!desktopFull && !mobileFull) return false;

        // 響應式：手機全寬，桌機有 Padding
        if (mobileFull && !desktopFull) return "px-0 md:px-desktop-margin";
        // 響應式：桌機全寬，手機有 Padding
        return "px-mobile-margin md:px-0";
    },
    isSectionWide: (block: any) => {
        const { method, mobileMethod } = getLayoutSettings(block);

        const isWide = (m?: string) => {
            if (!m) return false;
            const config = (LIST_LAYOUT_CONFIG as any)[m];
            return config?.fullWidth || ["grid_cards", "compact_grid", "card_deck_swiper", "scrollable_grid", "masonry_grid", "carousel"].includes(m!);
        };

        const desktopWide = isWide(method);
        const mobileWide = isWide(mobileMethod || method);

        if (desktopWide && mobileWide) return true;
        if (!desktopWide && !mobileWide) return false;

        // 響應式：手機寬版，桌機限寬 (max-w-brand)
        if (mobileWide && !desktopWide) return "md:max-w-brand";
        // 響應式：桌機寬版，手機限寬
        return "max-w-brand md:max-w-none";
    }
};
