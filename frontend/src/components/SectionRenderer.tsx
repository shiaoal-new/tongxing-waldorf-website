import React from "react";
import Section from "./layout/Section";
import Container from "./ui/Container";
import BlockDispatcher from "./blocks/BlockDispatcher";
import { shouldBlockIgnorePadding, isBlockSectionWide } from "./blocks/blockPolicies";
import { Section as SectionType, Block, TextBlock } from "../types/content";

interface SectionRendererProps {
    section: SectionType & { limit?: boolean; _layout?: any; media_list?: any; parallax_ratio?: number; ignore_padding?: boolean };
    index: number;
}

/**
 * SectionRenderer
 * 負責將一個完整的 Section 數據解析並渲染成 UI 章節
 */
export function SectionRenderer({ section, index }: SectionRendererProps) {
    const {
        headerProps,
        contentBlocks,
        align,
        sectionProps
    } = resolveSectionData(section);

    return (
        <Section
            key={index}
            align={align}
            limit={section.limit !== undefined ? section.limit : true} // Header 預設限制寬度
            {...sectionProps}
            {...headerProps}
        >
            <div className="mt-6">
                {contentBlocks.map((block: Block, bIndex: number) => {
                    const isWide = isBlockSectionWide(block);
                    const ignorePadding = shouldBlockIgnorePadding(block);

                    const blockElement = (
                        <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                            <BlockDispatcher
                                block={block}
                                align={align as any}
                                anchor={section.section_id}
                            />
                        </div>
                    );

                    // 如果是寬版區塊，直接渲染；否則包裹在 Container 中
                    if (isWide === true) {
                        return blockElement;
                    }

                    return (
                        <Container
                            key={bIndex}
                            limit={isWide === false ? true : isWide as any}
                            ignorePadding={ignorePadding as any}
                        >
                            {blockElement}
                        </Container>
                    );
                })}
            </div>
        </Section>
    );
}

/**
 * 資料轉換邏輯 (Data Transformer)
 * 將原始 JSON/YAML 數據轉換為組件可以理解的 Props
 */
function resolveSectionData(section: any) {
    const blocks = section.blocks || [];
    const firstBlock = blocks[0];

    // 1. 處理 Header 提取邏輯
    let headerProps: any = {};
    let contentBlocks = blocks;
    const isCTABanner = section._layout?.title === "紫色大型看板 (CTA)";

    if (!isCTABanner && firstBlock?.type === 'text_block' && (firstBlock.title || firstBlock.subtitle)) {
        const textBlock = firstBlock as TextBlock;
        headerProps = {
            title: textBlock.title,
            subtitle: textBlock.subtitle,
            content: textBlock.content,
            buttons: textBlock.buttons
        };
        contentBlocks = blocks.slice(1);
    }

    // 2. 確定對齊方式 (Alignment)
    const align = determineAlignment(contentBlocks);

    return {
        headerProps,
        contentBlocks,
        align,
        sectionProps: {
            layout: section._layout || {},
            anchor: section.section_id,
            media_list: section.media_list,
            parallax_ratio: section.parallax_ratio,
            divider: section.divider,
            shader_gradient: section.shader_gradient || isCTABanner,
            silk_background: section.silk_background,
            overlay_opacity: section.overlay_opacity,
            overlay_color: section.overlay_color,
            full_height: section.full_height,
            ignore_padding: section.ignore_padding,
            content_inside_wrapper: isCTABanner
        }
    };
}

/**
 * 判斷對齊方式 Helper
 */
function determineAlignment(contentBlocks: Block[]): "left" | "center" {
    if (contentBlocks.length === 0) return "center";

    const firstContent = contentBlocks[0];
    const leftAlignedTypes = ['text_block', 'member_block'];
    const isSpecialList = firstContent.type === 'list_block' &&
        ['card_deck_swiper', 'scrollable_grid'].includes((firstContent as any).layout_method) &&
        ((firstContent as any).item_type === 'Benefit' || (firstContent as any).item_type === 'benefit_item');

    if (leftAlignedTypes.includes(firstContent.type) || isSpecialList) {
        return "left";
    }

    return "center";
}



