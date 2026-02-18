import ListRenderer, { LIST_LAYOUT_CONFIG } from "../ListLayoutRenderer";


import { usePageData } from "../../context/PageDataContext";
import BlockDispatcher from "./BlockDispatcher";
import { ListBlock as ListBlockType, FaqItem, ListItem } from "../../types/content";

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
 * ListBlock Component
 * 渲染列表塊
 */
export default function ListBlock({ block, align }: ListBlockProps) {
    const { faqList } = usePageData();
    const direction = block.direction || (block.layout_method === "vertical" ? "vertical" : "horizontal");

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
                layout={block.layout_method || "card_deck_swiper"}
                mobile_scroll={block.mobile_scroll}
                mobile_layout={block.mobile_layout_method}
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

export const listPolicy: BlockPolicy = {
    shouldIgnorePadding: (block: any) => {
        const isFullWidth = (method?: string) => {
            if (!method) return false;
            return (LIST_LAYOUT_CONFIG as any)[method]?.fullWidth === true;
        };

        const desktopFull = isFullWidth(block.layout_method);
        const mobileFull = isFullWidth(block.mobile_layout_method || block.layout_method);

        if (desktopFull && mobileFull) return true;
        if (!desktopFull && !mobileFull) return false;

        // 響應式：手機全寬，桌機有 Padding
        if (mobileFull && !desktopFull) return "px-0 md:px-desktop-margin";
        // 響應式：桌機全寬，手機有 Padding
        return "px-mobile-margin md:px-0";
    },
    isSectionWide: (block: any) => {
        const isWide = (method?: string) => {
            if (!method) return false;
            const config = (LIST_LAYOUT_CONFIG as any)[method];
            return config?.fullWidth || ["grid_cards", "compact_grid", "card_deck_swiper", "scrollable_grid", "masonry_grid"].includes(method);
        };

        const desktopWide = isWide(block.layout_method);
        const mobileWide = isWide(block.mobile_layout_method || block.layout_method);

        if (desktopWide && mobileWide) return true;
        if (!desktopWide && !mobileWide) return false;

        // 響應式：手機寬版，桌機限寬 (max-w-brand)
        if (mobileWide && !desktopWide) return "md:max-w-brand";
        // 響應式：桌機寬版，手機限寬
        return "max-w-brand md:max-w-none";
    }
};
