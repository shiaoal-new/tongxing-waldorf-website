import Section from "./Section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BenefitItem from "./Benefit";
import ListRenderer from "./ListRenderer";
import VideoItem from "./Video";
import MediaRenderer from "./MediaRenderer";
import ActionButtons from "./ActionButtons";
import { usePageData } from "../context/PageDataContext";
import MarkdownContent from "./MarkdownContent";
import ExpandableText from "./ExpandableText";
import dynamic from "next/dynamic";

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
 * SectionRenderer
 * 負責將一個完整的 Section 數據解析並渲染成 UI 章節
 */
export function SectionRenderer({ section, index }) {
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
                {contentBlocks.map((block, bIndex) => (
                    <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                        <BlockDispatcher
                            block={block}
                            align={align}
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
function resolveSectionData(section) {
    const blocks = section.blocks || [];
    const firstBlock = blocks[0];

    // 1. 處理 Header 提取邏輯
    let headerProps = {};
    let contentBlocks = blocks;
    if (firstBlock?.type === 'text_block' && (firstBlock.title || firstBlock.subtitle)) {
        headerProps = {
            title: firstBlock.title,
            subtitle: firstBlock.subtitle,
            content: firstBlock.content,
            buttons: firstBlock.buttons
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
function determineAlignment(contentBlocks) {
    if (contentBlocks.length === 0) return "center";

    const firstContent = contentBlocks[0];
    const leftAlignedTypes = ['text_block', 'member_block'];
    const isSpecialList = firstContent.type === 'list_block' &&
        firstContent.layout_method === 'scrollable_grid' &&
        (firstContent.item_type === 'Benefit' || firstContent.item_type === 'benefit_item');

    if (leftAlignedTypes.includes(firstContent.type) || isSpecialList) {
        return "left";
    }

    return "center";
}

/**
 * 判斷寬度限制 Helper
 */
function determineSectionLimit(blocks, explicitLimit) {
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
            return ["grid_cards", "compact_grid", "scrollable_grid"].includes(b.layout_method);
        }
        return false;
    });

    return !hasWideBlock;
}

/**
 * 內容分發器 (Block Dispatcher)
 * 負責將數據根據類型分配給具體的 UI 組件
 */
function BlockDispatcher({ block, align = "center", context = "standalone", anchor = "" }) {
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


/**
 * 提取的 UI 組件:文字區塊
 */
function TextBlock({ data, align, isNested }) {
    return (
        <div className={`${isNested ? '' : 'max-w-4xl mx-auto'} ${align === 'left' ? 'text-left' : 'text-center'}`}>
            {data.subtitle && (
                <div className="text-sm font-bold tracking-wider text-brand-accent uppercase mb-2">
                    {data.subtitle}
                </div>
            )}
            {data.title && !isNested && (
                <h3 className="mt-3 text-brand-text dark:text-brand-bg">
                    {data.title}
                </h3>
            )}
            {data.content && (
                <div className={`py-2 ${isNested ? 'text-base' : 'text-lg'} text-brand-taupe dark:text-brand-taupe`}>
                    <ExpandableText
                        content={data.content}
                        collapsedHeight={isNested ? 80 : 120}
                        disableExpand={isNested}
                    />
                </div>
            )}
            {!isNested && <ActionButtons buttons={data.buttons} align={align === "left" ? "left" : "center"} className="mt-6" />}
        </div>
    );
}

/**
 * 提取的 UI 組件：卡片
 */
function CardItem({ data }) {
    return (
        <div className="group bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl shadow-sm border border-brand-taupe/10 dark:border-neutral-700 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 hover:border-brand-accent/30 h-full duration-300">
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

/**
 * 提取的 UI 組件：緊湊卡片
 */
function CompactCardItem({ data }) {
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

/**
 * 渲染成員塊
 */
function MemberBlock({ block }) {
    const { getMemberDetails, setSelectedMember } = usePageData();
    return (
        <div className="max-w-brand mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {block.members && block.members.map((memberName, mIndex) => {
                    const member = getMemberDetails(memberName);
                    if (!member) return null;
                    return (
                        <div
                            key={mIndex}
                            onClick={() => setSelectedMember(member)}
                            className="flex flex-col items-center text-center p-6 bg-brand-bg dark:bg-brand-structural rounded-3xl shadow-sm border border-gray-50 dark:border-brand-structural transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                        >
                            <div className="relative mb-4">
                                {member.media ? (
                                    <MediaRenderer
                                        media={member.media}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-brand-accent/20 group-hover:border-primary-100 transition-colors shadow-sm"
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-brand-accent/10 dark:bg-primary-900/30 flex items-center justify-center border-4 border-brand-accent/20 dark:border-primary-900/50">
                                        <span className="text-brand-accent/60 text-3xl font-bold">{member.title?.[0]}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-2 right-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h3 className="font-bold text-brand-text dark:text-brand-bg group-hover:text-brand-accent transition-colors">{member.title}</h3>
                                {member.subtitle && (
                                    <p className="mt-1 text-xs text-brand-accent dark:text-brand-accent font-medium tracking-tight whitespace-pre-wrap">
                                        {member.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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
 * 渲染列表塊
 */
function ListBlock({ block }) {
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


