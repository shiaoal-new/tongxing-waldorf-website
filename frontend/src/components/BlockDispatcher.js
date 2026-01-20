import dynamic from "next/dynamic";
import BenefitItem from "./Benefit";
import VideoItem from "./Video";
import TextBlock from "./blocks/TextBlock";
import CardItem from "./blocks/CardItem";
import CompactCardItem from "./blocks/CompactCardItem";
import ListBlock from "./blocks/ListBlock";
import MemberBlock from "./blocks/MemberBlock";

/**
 * Loading Fallback Component
 * 動態載入組件時顯示的載入狀態
 */
function BlockLoadingFallback({ message = "載入中..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mb-3"></div>
            <p className="text-brand-taupe dark:text-brand-taupe text-sm">{message}</p>
        </div>
    );
}

/**
 * Helper function: 創建動態載入的組件
 * @param {string} componentPath - 組件路徑 (相對於 components 目錄)
 * @param {string} loadingMessage - 載入時顯示的訊息
 * @returns {React.Component} 動態載入的組件
 */
const createDynamicBlock = (componentPath, loadingMessage = "載入中...") => {
    return dynamic(() => import(`./${componentPath}`), {
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

/**
 * 內容分發器 (Block Dispatcher)
 * 負責將數據根據類型分配給具體的 UI 組件
 */
export default function BlockDispatcher({ block, align = "center", context = "standalone", anchor = "" }) {
    if (!block) return null;

    const isNested = context === "list";
    const type = block.type || block.item_type || "text_block";

    switch (type) {
        case "text_block":
        case "text":
        case "faq_item":
        case "faq":
            return <TextBlock data={block} align={isNested ? "left" : align} isNested={isNested} />;

        case "benefit_item":
        case "benefit":
            return (
                <BenefitItem
                    title={block.title}
                    icon={block.icon}
                    buttons={block.buttons}
                    media={block.media}
                    span={block.span}
                >
                    {block.content}
                </BenefitItem>
            );

        case "video_item":
        case "video":
            return (
                <VideoItem
                    video={{
                        title: block.title,
                        media: block.media,
                        content: block.content,
                        className: block.className
                    }}
                    className={!isNested ? "" : "md:even:translate-y-12 lg:even:translate-y-0 lg:[&:nth-child(3n+2)]:translate-y-12"}
                />
            );

        case "card_item":
        case "card":
            return <CardItem data={block} />;

        case "compact_card_item":
        case "compact_card":
            return <CompactCardItem data={block} />;

        case "list_block":
            return <ListBlock block={block} />;

        case "member_block":
            return <MemberBlock block={block} />;

        case "schedule_block":
            return <ScheduleBlock data={block} />;

        case "curriculum_block":
            return <CurriculumBlock data={block} />;

        case "color_palette_block":
            return <ColorPaletteBlock data={block} />;

        case "visit_process_block":
            return <VisitProcess />;

        case "visit_schedule_block":
            return <VisitSchedule />;

        case "spacing_demo_block":
            return <SpacingDemoBlock data={block} />;

        case "typography_demo_block":
            return <TypographyDemoBlock data={block} />;

        case "micro_interactions_block":
            return <MicroInteractionsBlock data={block} />;

        case "tabbed_content_block":
            return <TabbedContentBlock data={block} />;

        case "questionnaire_block":
            return <QuestionnaireBlock data={block} />;

        case "timeline_block":
            return <TimelineBlock data={block} anchor={anchor} />;

        default:
            return null;
    }
}
