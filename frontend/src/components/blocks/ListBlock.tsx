import ListRenderer from "../ListRenderer";
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
}

/**
 * ListBlock Component
 * 渲染列表塊
 */
export default function ListBlock({ block }: ListBlockProps) {
    const { faqList } = usePageData();
    const direction = block.direction || (block.layout_method === "vertical" ? "vertical" : "horizontal");

    const listItems = prepareListItems(block, faqList as FaqItem[], direction);

    return (
        <div className="max-w-brand mx-auto">
            {block.title && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-brand-text dark:text-brand-bg border-l-4 border-brand-accent pl-4">
                        {block.title}
                    </h3>
                </div>
            )}
            <ListRenderer
                direction={direction}
                items={listItems}
                layout={block.layout_method || "scrollable_grid"}
                columns={3}
                buttons={block.buttons}
                renderItem={(item: ListItem, index: number) => (
                    <BlockDispatcher block={item} context="list" />
                )}
            />
        </div>
    );
}
