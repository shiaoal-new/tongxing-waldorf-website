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

    return (block.items || []).map(item => ({
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
                layout={block.layout_method || "scrollable_grid"}
                columns={3}
                buttons={block.buttons}
                renderItem={(item: ListItem, index: number, extra: any) => (
                    <BlockDispatcher block={{ ...item, ...(extra || {}) }} context="list" align={align} />
                )}
            />
        </div>
    );
}

import { BlockPolicy } from './interfaces';

export const listPolicy: BlockPolicy = {
    shouldIgnorePadding: (block: any) => {
        const layoutMethod = block.layout_method;
        const config = (LIST_LAYOUT_CONFIG as any)[layoutMethod];
        return config?.fullWidth === true;
    },
    isSectionWide: (block: any) => {
        const layoutMethod = block.layout_method;
        const config = (LIST_LAYOUT_CONFIG as any)[layoutMethod];
        return config?.fullWidth || ["grid_cards", "compact_grid", "scrollable_grid", "masonry_grid"].includes(layoutMethod);
    }
};
