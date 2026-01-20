import React from "react";
import Section from "./layout/Section";
import BlockDispatcher from "./blocks/BlockDispatcher";
import { Section as SectionType, Block, TextBlock } from "../types/content";

interface SectionRendererProps {
    section: SectionType & { limit?: boolean; _layout?: any; media_list?: any; parallax_ratio?: number };
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
        sectionLimit,
        sectionProps
    } = resolveSectionData(section);

    return (
        <Section
            key={index}
            align={align}
            limit={sectionLimit}
            {...sectionProps}
            {...headerProps}
        >
            <div className="mt-6">
                {contentBlocks.map((block: Block, bIndex: number) => (
                    <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                        <BlockDispatcher
                            block={block}
                            align={align as any}
                            anchor={section.section_id}
                        />
                    </div>
                ))}
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
    if (firstBlock?.type === 'text_block' && (firstBlock.title || firstBlock.subtitle)) {
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

    // 3. 確定容器寬度限制 (Limit)
    const sectionLimit = determineSectionLimit(blocks, section.limit);

    return {
        headerProps,
        contentBlocks,
        align,
        sectionLimit,
        sectionProps: {
            layout: section._layout || {},
            anchor: section.section_id,
            media_list: section.media_list,
            parallax_ratio: section.parallax_ratio,
            divider: section.divider,
            shader_gradient: section.shader_gradient || section._layout?.title === "紫色大型看板 (CTA)",
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
        (firstContent as any).layout_method === 'scrollable_grid' &&
        ((firstContent as any).item_type === 'Benefit' || (firstContent as any).item_type === 'benefit_item');

    if (leftAlignedTypes.includes(firstContent.type) || isSpecialList) {
        return "left";
    }

    return "center";
}

/**
 * 判斷寬度限制 Helper
 */
function determineSectionLimit(blocks: Block[], explicitLimit?: boolean): boolean {
    if (explicitLimit !== undefined) return explicitLimit;

    const wideBlockTypes = [
        "member_block",
        "schedule_block",
        "curriculum_block",
        "visit_process_block",
        "spacing_demo_block",
        "typography_demo_block",
        "micro_interactions_block",
        "timeline_block"
    ];

    const hasWideBlock = blocks.some(b => {
        if (wideBlockTypes.includes(b.type)) return true;
        if (b.type === "list_block") {
            return ["grid_cards", "compact_grid", "scrollable_grid"].includes((b as any).layout_method);
        }
        return false;
    });

    return !hasWideBlock;
}
