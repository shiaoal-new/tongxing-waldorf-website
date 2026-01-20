import React from "react";
import MediaRenderer from "../ui/MediaRenderer";
import MarkdownContent from "../ui/MarkdownContent";
import { CardItem, CompactCardItem } from "../../types/content";

export type CardVariant = 'default' | 'compact';

interface CardProps {
    data: CardItem | CompactCardItem;
    variant?: CardVariant;
}

/**
 * Card Component
 * 遵循 DRY 原則合併後的卡片組件，支援 standard 及 compact 兩種樣式
 */
export default function Card({ data, variant = 'default' }: CardProps) {
    if (variant === 'compact') {
        const compactData = data as CompactCardItem;
        return (
            <div className="bg-brand-bg dark:bg-brand-structural p-4 rounded-xl shadow-sm border border-gray-50 dark:border-brand-structural flex flex-col items-start transition-all hover:bg-brand-accent/10 dark:hover:bg-primary-900/10 h-full">
                <div className="text-xs font-bold text-brand-accent dark:text-brand-accent mb-1 uppercase tracking-wider">{compactData.subtitle}</div>
                <h3 className="font-bold text-brand-text dark:text-brand-bg">{compactData.title}</h3>
                {compactData.content && (
                    <div className="text-brand-taupe dark:text-brand-taupe text-xs mt-1">
                        <MarkdownContent content={compactData.content} />
                    </div>
                )}
            </div>
        );
    }

    const standardData = data as CardItem;
    return (
        <div className="group bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl shadow-sm border border-brand-taupe/10 dark:border-neutral-700 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 hover:border-brand-accent/30 h-full duration-300 relative overflow-hidden">
            {/* 圖標或媒體 */}
            {standardData.icon ? (
                <div className="w-20 h-20 mb-6 text-6xl flex items-center justify-center bg-brand-accent/10 dark:bg-brand-accent/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {standardData.icon}
                </div>
            ) : standardData.media ? (
                <MediaRenderer
                    media={standardData.media}
                    className="w-20 h-20 mb-6 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300"
                    imgClassName="object-cover w-full h-full"
                />
            ) : null}

            {/* 標題 */}
            <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2 text-xl group-hover:text-brand-accent transition-colors duration-300">
                {standardData.title}
            </h3>

            {/* 副標題 */}
            {standardData.subtitle && (
                <p className="text-brand-accent dark:text-brand-accent text-sm font-medium mb-4 uppercase tracking-wider">
                    {standardData.subtitle}
                </p>
            )}

            {/* 內容 */}
            <div className="text-brand-taupe dark:text-brand-taupe text-sm leading-relaxed">
                <MarkdownContent content={standardData.content} />
            </div>

            {/* 裝飾性底部漸變 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl" />
        </div>
    );
}
