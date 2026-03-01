import ListRenderer, { LIST_LAYOUT_CONFIG } from "../ListLayoutRenderer";


import { usePageData } from "../../context/PageDataContext";
import { useWordingContext } from "../../context/WordingContext";
import BlockDispatcher from "./BlockDispatcher";
import { ListBlock as ListBlockType, FaqItem, ListItem, LayoutConfig } from "../../types/content";
import { useState, useEffect, useRef, useCallback } from "react";
import { BlockPolicy } from './interfaces';

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

/**
 * LazyDataContainer Component
 * 包裝列表項目並使用 Intersection Observer 進行懶加載
 * 當 FAQ 區塊進入視口時才獲取數據
 */
function LazyDataContainer({
    children,
    rootMargin = "300px",
    onVisible,
    isLoading,
    dataLoaded,
}: {
    children: React.ReactNode;
    rootMargin?: string;
    onVisible: () => void;
    isLoading: boolean;
    dataLoaded: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        // 如果已經觸發過或數據已加載，不再設置觀察器
        if (hasTriggeredRef.current || dataLoaded) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    onVisible();
                    observer.disconnect();
                }
            },
            {
                rootMargin,
                threshold: 0
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [rootMargin, onVisible, dataLoaded]);

    // 如果數據還沒加載完成，顯示加載骨架屏
    if (!dataLoaded || isLoading) {
        return (
            <div ref={containerRef} className="lazy-list-container">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        <div className="h-3 w-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <div ref={containerRef}>{children}</div>;
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

    // 檢查是否需要懶加載 FAQ 數據
    const needsLazyFaq = lazy && block.faq_ids && block.faq_ids.length > 0;

    // 懶加載狀態
    const [lazyFaqList, setLazyFaqList] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(!needsLazyFaq);
    const abortControllerRef = useRef<AbortController | null>(null);

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
            // 將 style 傳遞給 API 以獲取正確解析的文字
            const response = await fetch(`/api/data/faq?style=${currentStyle}`, {
                signal: abortControllerRef.current.signal,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch FAQ: ${response.status} ${response.statusText}`);
            }

            const data: FaqItem[] = await response.json();
            setLazyFaqList(data);
            setDataLoaded(true);

            if (process.env.NODE_ENV === 'development') {
                const endTime = performance.now();
                const size = JSON.stringify(data).length;
                console.log(
                    `[ListBlock] Lazy loaded FAQ data in ${(endTime - startTime).toFixed(2)}ms ` +
                    `(${size.toLocaleString()} bytes, ${data.length} items)`
                );
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('[ListBlock] Failed to lazy load FAQ data:', error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [dataLoaded, isLoading, currentStyle]);

    // 組件卸載時取消請求
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const { method, mobileMethod, config, mobileConfig } = getLayoutSettings(block);

    const direction = block.direction || (method === "vertical" ? "vertical" : "horizontal");

    // 決定使用哪個數據源
    const faqListToUse = needsLazyFaq && dataLoaded ? lazyFaqList : (contextFaqList as FaqItem[] || []);

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
        <div className="brand-container">
            {block.title && (
                <div className="mb-8">
                    <h3 className="title-bordered">
                        {block.title}
                    </h3>
                </div>
            )}
            {needsLazyFaq ? (
                <LazyDataContainer
                    rootMargin={lazyRootMargin}
                    onVisible={fetchFaqData}
                    isLoading={isLoading}
                    dataLoaded={dataLoaded}
                >
                    {renderListContent()}
                </LazyDataContainer>
            ) : (
                renderListContent()
            )}
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
