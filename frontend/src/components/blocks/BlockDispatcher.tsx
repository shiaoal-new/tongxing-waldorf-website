import dynamic from "next/dynamic";
// Touch fix build
import React from "react";

import HeroCardItem from "./HeroCardItem"; // Assuming file is created
import FeatureItem from "./FeatureItem";

// ... existing code ...

// ... (removed the block)
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
const PathQuestionnaire = createDynamicBlock("PathQuestionnaire", "載入路径诊断系统中...");
const TimelineBlock = createDynamicBlock("TimelineBlock", "載入時間軸中...");
const ScheduleBlock = createDynamicBlock("ScheduleBlock");
const CurriculumBlock = createDynamicBlock("CurriculumBlock");
const ColorPaletteBlock = createDynamicBlock("ColorPaletteBlock");
const VisitProcess = createDynamicBlock("VisitProcess", "載入參訪流程中...");
const VisitSchedule = createDynamicBlock("VisitSchedule");
const MermaidBlock = createDynamicBlock("MermaidBlock");
const PieChartBlock = createDynamicBlock("PieChartBlock");
const RadarChartBlock = createDynamicBlock("RadarChartBlock");
const BarChartBlock = createDynamicBlock("BarChartBlock");
const InteractiveSwitcherBlock = createDynamicBlock("InteractiveSwitcherBlock");
const BreathingIntroBlock = createDynamicBlock("BreathingIntroBlock");
const ScheduleListBlock = createDynamicBlock("ScheduleListBlock");
const ComparisonBlock = createDynamicBlock("ComparisonBlock");
const StatsBlock = createDynamicBlock("StatsBlock");
const CalComBlock = createDynamicBlock("CalComBlock");

interface BlockDispatcherProps {
    block: Block | ListItem;
    align?: 'left' | 'center' | 'right';
    context?: 'standalone' | 'list';
    anchor?: string;
    sectionLazy?: boolean; // Section level lazy load setting
    expanded?: boolean; // 新增：是否受父組件（如 Disclosure）控制展開
}

/**
 * 內容分發器 (Block Dispatcher)
 * 負責將數據根據類型分配給具體的 UI 組件
 */
export default function BlockDispatcher({ block, align = "center", context = "standalone", anchor, sectionLazy = true, expanded }: BlockDispatcherProps) {
    if (!block) return null;

    const isNested = context === "list";
    const type = (block as any).type || (block as any).item_type || "text_block";

    switch (type) {
        case "hero_card_item":
            return (
                <HeroCardItem
                    {...(block as any)}
                />
            );
        case "faq_item":
        case "faq":
            return <TextBlock data={block as TextBlockType} align={isNested ? "left" : align} isNested={isNested} disableExpand={true} expanded={expanded} />;

        case "text_block":
        case "text":
            return <TextBlock data={block as TextBlockType} align={isNested ? "left" : align} isNested={isNested} expanded={expanded} />;

        case "feature_item":
        case "feature":
        case "benefit_item":
        case "benefit":
            const feature = block as FeatureItemType;
            return (
                <FeatureItem
                    title={feature.title}
                    icon={feature.icon}
                    buttons={feature.buttons as any}
                    media={feature.media}
                    span={feature.span}
                    align={(block as any).align || align}
                    sub_items={feature.sub_items}
                    expanded={expanded}
                    isNested={isNested}
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
            // Block level lazy > Section level lazy > Default true
            const blockLazy = (block as any).lazy;
            const isLazy = blockLazy !== undefined ? blockLazy : sectionLazy;
            return <ListBlock block={block as ListBlockType} align={(block as any).align || align} lazy={isLazy} anchor={anchor} />;

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

        case "path_questionnaire_block":
            return <PathQuestionnaire data={block as QuestionnaireBlockType} />;


        case "mermaid_block":
            return <MermaidBlock data={block as any} />;

        case "timeline_block":
            return <TimelineBlock data={block as any} anchor={anchor} />;

        case "pie_chart_block":
            return <PieChartBlock data={block as any} />;
        case "radar_chart_block":
            return <RadarChartBlock data={block as any} />;
        case "bar_chart_block":
            return <BarChartBlock data={block as any} />;
        case "interactive_switcher_block":
            return <InteractiveSwitcherBlock data={block as any} />;

        case "breathing_intro_block":
            return <BreathingIntroBlock />;

        case "schedule_list_block":
            return <ScheduleListBlock data={block as any} />;

        case "comparison_block":
            return <ComparisonBlock data={block as any} />;

        case "stats_block":
            return <StatsBlock data={block as any} />;

        case "cal_com_block":
            return <CalComBlock data={block as any} />;

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
                    tags={testimonial.tags}
                    source={testimonial.source}
                    date={testimonial.date}
                    pagination={(block as any).pagination}
                />
            );

        default:
            return null;
    }
}
