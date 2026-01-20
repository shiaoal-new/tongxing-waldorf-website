import React from "react";
import MediaRenderer from "../ui/MediaRenderer";
import MarkdownContent from "../ui/MarkdownContent";
import { CardItem as CardItemType } from "../../types/content";

interface CardItemProps {
    data: CardItemType;
}

/**
 * CardItem Component
 * 提取的 UI 組件：卡片
 */
export default function CardItem({ data }: CardItemProps) {
    return (
        <div className="group bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl shadow-sm border border-brand-taupe/10 dark:border-neutral-700 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 hover:border-brand-accent/30 h-full duration-300 relative overflow-hidden">
            {/* 圖標或媒體 */}
            {data.icon ? (
                <div className="w-20 h-20 mb-6 text-6xl flex items-center justify-center bg-brand-accent/10 dark:bg-brand-accent/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {data.icon}
                </div>
            ) : data.media ? (
                <MediaRenderer
                    media={data.media}
                    className="w-20 h-20 mb-6 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300"
                    imgClassName="object-cover w-full h-full"
                />
            ) : null}

            {/* 標題 */}
            <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2 text-xl group-hover:text-brand-accent transition-colors duration-300">
                {data.title}
            </h3>

            {/* 副標題 */}
            {data.subtitle && (
                <p className="text-brand-accent dark:text-brand-accent text-sm font-medium mb-4 uppercase tracking-wider">
                    {data.subtitle}
                </p>
            )}

            {/* 內容 */}
            <div className="text-brand-taupe dark:text-brand-taupe text-sm leading-relaxed">
                <MarkdownContent content={data.content} />
            </div>

            {/* 裝飾性底部漸變 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl" />
        </div>
    );
}
