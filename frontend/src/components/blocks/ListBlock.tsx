import ListRenderer, { LIST_LAYOUT_CONFIG } from "../ListLayoutRenderer";


import { usePageData } from "../../context/PageDataContext";
import BlockDispatcher from "./BlockDispatcher";
import { ListBlock as ListBlockType, FaqItem, ListItem, LayoutConfig } from "../../types/content";

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
 * ListBlock Component
 * 渲染列表塊
 */
export default function ListBlock({ block, align }: ListBlockProps) {
    const { faqList } = usePageData();

    const { method, mobileMethod, config, mobileConfig } = getLayoutSettings(block);

    const direction = block.direction || (method === "vertical" ? "vertical" : "horizontal");

    const listItems = prepareListItems(block, faqList as FaqItem[], direction);

    return (
        <div className="brand-container">
            {block.title && (
                <div className="mb-8">
                    <h3 className="title-bordered">
                        {block.title}
                    </h3>
                </div>
            )}
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
        </div>
    );
}

import { BlockPolicy } from './interfaces';

export const listPolicy: any = {
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
