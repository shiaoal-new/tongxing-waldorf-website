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
            <div className="card-compact">
                <div className="label-accent">{compactData.subtitle}</div>
                <h3 className="font-bold text-brand-text dark:text-brand-bg">
                    <MarkdownContent content={compactData.title} isInline />
                </h3>
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
        <div className="card-standard group">
            {/* 圖標或媒體 */}
            {standardData.icon ? (
                <div className="card-standard-icon group-hover:scale-110">
                    {standardData.icon}
                </div>
            ) : standardData.media ? (
                <MediaRenderer
                    media={standardData.media}
                    className="card-standard-icon overflow-hidden group-hover:scale-110"
                    imgClassName="object-cover w-full h-full"
                />
            ) : null}

            {/* 標題 */}
            <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2 text-xl group-hover:text-brand-accent transition-colors duration-300">
                <MarkdownContent content={standardData.title} isInline />
            </h3>

            {/* 副標題 */}
            {standardData.subtitle && (
                <p className="label-accent">
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
