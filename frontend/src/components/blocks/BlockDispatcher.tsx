import dynamic from "next/dynamic";
// Touch fix build
import React from "react";

import FeatureItem from "./FeatureItem";
import VideoItem from "../Video";
import TextBlock from "./TextBlock";
import Card from "./Card";
import ListBlock from "./ListBlock";
import MemberBlock from "./MemberBlock";
import CTABlock from "./CTABlock";
import TestimonialItem from "./TestimonialItem";
import { Block, ListItem, TextBlock as TextBlockType, FeatureItem as FeatureItemType, ListBlock as ListBlockType, ScheduleBlock as ScheduleBlockType, CurriculumBlock as CurriculumBlockType, QuestionnaireBlock as QuestionnaireBlockType, CTABlock as CTABlockType } from "../../types/content";

/**
 * Loading Fallback Component
 * 動態載入組件時顯示的載入狀態
 */
function BlockLoadingFallback({ message = "載入中..." }: { message?: string }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="text-brand-taupe dark:text-brand-taupe text-sm">{message}</p>
        </div>
    );
}

/**
 * Helper function: 創建動態載入的組件
 * @param {string} componentPath - 組件路徑 (相對於 components 目錄)
 * @param {string} loadingMessage - 載入時顯示的訊息
 * @returns {React.ComponentType<any>} 動態載入的組件
 */
const createDynamicBlock = (componentPath: string, loadingMessage = "載入中...") => {
    return dynamic<any>(() => import(`./${componentPath}`), {
        loading: () => <BlockLoadingFallback message={loadingMessage} />,
        ssr: false
    });
};

// 動態載入較少使用的組件,減少初始 bundle 大小
const SpacingDemoBlock = createDynamicBlock("SpacingDemoBlock");
const TypographyDemoBlock = createDynamicBlock("TypographyDemoBlock");
const MicroInteractionsBlock = createDynamicBlock("MicroInteractionsBlock");
const TabbedContentBlock = createDynamicBlock("TabbedContentBlock");
const QuestionnaireBlock = createDynamicBlock("QuestionnaireBlock", "載入問卷中...");
const TimelineBlock = createDynamicBlock("TimelineBlock", "載入時間軸中...");
const ScheduleBlock = createDynamicBlock("ScheduleBlock");
const CurriculumBlock = createDynamicBlock("CurriculumBlock");
const ColorPaletteBlock = createDynamicBlock("ColorPaletteBlock");
const VisitProcess = createDynamicBlock("VisitProcess", "載入參訪流程中...");
const VisitSchedule = createDynamicBlock("VisitSchedule", "載入參訪時程中...");

interface BlockDispatcherProps {
    block: Block | ListItem;
    align?: 'left' | 'center' | 'right';
    context?: 'standalone' | 'list';
    anchor?: string;
}

/**
 * 內容分發器 (Block Dispatcher)
 * 負責將數據根據類型分配給具體的 UI 組件
 */
export default function BlockDispatcher({ block, align = "center", context = "standalone", anchor = "" }: BlockDispatcherProps) {
    if (!block) return null;

    const isNested = context === "list";
    const type = (block as any).type || (block as any).item_type || "text_block";

    switch (type) {
        case "faq_item":
        case "faq":
            return <TextBlock data={block as TextBlockType} align={isNested ? "left" : align} isNested={isNested} disableExpand={true} />;

        case "text_block":
        case "text":
            return <TextBlock data={block as TextBlockType} align={isNested ? "left" : align} isNested={isNested} />;

        case "feature_item":
        case "feature":
        case "benefit_item":
        case "benefit":
            const feature = block as FeatureItemType;
            return (
                <FeatureItem
                    title={feature.title}
                    icon={feature.icon || "lucide:star"}
                    buttons={feature.buttons as any}
                    media={feature.media}
                    span={feature.span}
                    align={(block as any).align || align}
                >
                    {feature.content}
                </FeatureItem>
            );

        case "video_item":
        case "video":
            const video = block as any;
            return (
                <VideoItem
                    video={{
                        title: video.title,
                        media: video.media,
                        content: video.content,
                        duration: video.duration,
                        className: video.className
                    }}
                    className={!isNested ? "" : "md:even:translate-y-12 lg:even:translate-y-0 lg:[&:nth-child(3n+2)]:translate-y-12"}
                />
            );

        case "card_item":
        case "card":
            return <Card data={block as any} variant="default" />;

        case "compact_card_item":
        case "compact_card":
            return <Card data={block as any} variant="compact" />;

        case "list_block":
            return <ListBlock block={block as ListBlockType} align={(block as any).align || align} />;

        case "cta_block":
            return <CTABlock block={block as CTABlockType} />;

        case "member_block":
            return <MemberBlock block={block as any} />;

        case "schedule_block":
            return <ScheduleBlock data={block as ScheduleBlockType} />;

        case "curriculum_block":
            return <CurriculumBlock data={block as CurriculumBlockType} />;

        case "color_palette_block":
            return <ColorPaletteBlock data={block as any} />;

        case "visit_process_block":
            return <VisitProcess />;

        case "visit_schedule_block":
            return <VisitSchedule />;

        case "spacing_demo_block":
            return <SpacingDemoBlock data={block as any} />;

        case "typography_demo_block":
            return <TypographyDemoBlock data={block as any} />;

        case "micro_interactions_block":
            return <MicroInteractionsBlock data={block as any} />;

        case "tabbed_content_block":
            return <TabbedContentBlock data={block as any} />;

        case "questionnaire_block":
            return <QuestionnaireBlock data={block as QuestionnaireBlockType} />;

        case "timeline_block":
            return <TimelineBlock data={block as any} anchor={anchor} />;

        case "testimonial_item":
        case "testimonial":
            const testimonial = block as any;
            return (
                <TestimonialItem
                    quote={testimonial.quote || testimonial.content}
                    author={testimonial.author}
                    title={testimonial.title}
                    media={testimonial.media}
                    avatar={testimonial.avatar}
                    pagination={(block as any).pagination}
                />
            );

        default:
            return null;
    }
}
