import ListRenderer from "../ListRenderer";
import { usePageData } from "../../context/PageDataContext";
import BlockDispatcher from "./BlockDispatcher";

/**
 * 準備列表數據，將 FAQ 或普通項目統一轉化為規整的 Block 結構
 */
function prepareListItems(block, faqList, direction) {
    if (block.faq_ids) {
        return block.faq_ids
            .map(id => {
                const faq = faqList.find(f => f.id === id);
                return faq ? { ...faq, type: 'faq_item' } : null;
            })
            .filter(Boolean);
    }

    return (block.items || []).map(item => ({
        ...item,
        type: item.item_type || block.item_type || "text"
    }));
}

/**
 * ListBlock Component
 * 渲染列表塊
 */
export default function ListBlock({ block }) {
    const { faqList } = usePageData();
    const direction = block.direction || (block.layout_method === "vertical" ? "vertical" : "horizontal");

    const listItems = prepareListItems(block, faqList, direction);

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
                renderItem={(item, index) => (
                    <BlockDispatcher block={item} context="list" />
                )}
            />
        </div>
    );
}
