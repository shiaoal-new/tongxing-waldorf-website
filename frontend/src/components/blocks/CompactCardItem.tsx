import React from "react";
import MarkdownContent from "../ui/MarkdownContent";
import { CompactCardItem as CompactCardItemType } from "../../types/content";

interface CompactCardItemProps {
    data: CompactCardItemType;
}

/**
 * CompactCardItem Component
 * 提取的 UI 組件：緊湊卡片
 */
export default function CompactCardItem({ data }: CompactCardItemProps) {
    return (
        <div className="bg-brand-bg dark:bg-brand-structural p-4 rounded-xl shadow-sm border border-gray-50 dark:border-brand-structural flex flex-col items-start transition-all hover:bg-brand-accent/10 dark:hover:bg-primary-900/10 h-full">
            <div className="text-xs font-bold text-brand-accent dark:text-brand-accent mb-1 uppercase tracking-wider">{data.subtitle}</div>
            <h3 className="font-bold text-brand-text dark:text-brand-bg">{data.title}</h3>
            {data.content && (
                <div className="text-brand-taupe dark:text-brand-taupe text-xs mt-1">
                    <MarkdownContent content={data.content} />
                </div>
            )}
        </div>
    );
}
