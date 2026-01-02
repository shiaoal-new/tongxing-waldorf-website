import Section from "./section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BenefitItem from "./benefit";
import ListRenderer from "./listRenderer";
import VideoItem from "./video";
import MediaRenderer from "./mediaRenderer";
import ScheduleBlock from "./scheduleBlock";
import CurriculumBlock from "./curriculumBlock";
import ColorPaletteBlock from "./colorPaletteBlock";
import ActionButtons from "./actionButtons";
import VisitProcess from "./visitProcess";
import VisitSchedule from "./visitSchedule";
import SpacingDemoBlock from "./spacingDemoBlock";
import TypographyDemoBlock from "./typographyDemoBlock";
import MicroInteractionsBlock from "./microInteractionsBlock";
import TabbedContentBlock from "./tabbedContentBlock";
import { usePageData } from "../contexts/PageDataContext";
import MarkdownContent from "./markdownContent";

/**
 * 渲染单个section及其内部的所有blocks
 */
export function SectionBlock({ section, index }) {
    const layout = section._layout || {};
    const blocks = section.blocks || [];
    const sectionId = section.section_id;
    const mediaList = section.media_list;
    const parallaxRatio = section.parallax_ratio;

    // Identify if the first block is a header (text_block with title/subtitle)
    const firstBlock = blocks[0];
    let headerProps = {};
    let contentBlocks = blocks;
    let align = "center"; // Default alignment

    if (firstBlock && firstBlock.type === 'text_block') {
        if (firstBlock.title || firstBlock.subtitle) {
            headerProps = {
                title: firstBlock.title,
                subtitle: firstBlock.subtitle,
                content: firstBlock.content,
                buttons: firstBlock.buttons
            };
            contentBlocks = blocks.slice(1);
        }
    }

    if (contentBlocks.length > 0) {
        const firstContent = contentBlocks[0];
        if (firstContent.type === 'text_block' ||
            (firstContent.type === 'list_block' && firstContent.layout_method === 'scrollable_grid' && (firstContent.item_type === 'benefit' || firstContent.item_type === 'benefit_item')) ||
            (firstContent.type === 'member_block')) {
            align = "left";
        }
    }

    let sectionLimit = section.limit;
    if (sectionLimit === undefined) {
        const wideBlocks = ["member_block", "schedule_block", "curriculum_block", "visit_process_block", "spacing_demo_block", "typography_demo_block", "micro_interactions_block"];
        const hasWideBlock = blocks.some(b =>
            wideBlocks.includes(b.type) ||
            (b.type === "list_block" && ["grid_cards", "compact_grid", "scrollable_grid"].includes(b.layout_method))
        );
        sectionLimit = !hasWideBlock;
    }

    return (
        <Section
            key={index}
            layout={layout}
            anchor={sectionId}
            media_list={mediaList}
            parallax_ratio={parallaxRatio}
            align={align}
            limit={sectionLimit}
            {...headerProps}
        >
            <div className="mt-6">
                {contentBlocks.map((block, bIndex) => (
                    <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                        <BlockRenderer block={block} align={align} />
                    </div>
                ))}
            </div>
        </Section>
    );
}

/**
 * 核心渲染器 (Block Dispatcher)
 * 負責將數據分配給各個 UI 組件
 */
function BlockRenderer({ block, align = "center", context = "standalone" }) {
    if (!block) return null;

    // 如果是 List 內部，某些樣式可能需要微調
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
                <BenefitItem title={block.title} icon={block.icon} buttons={block.buttons}>
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

        default:
            return null;
    }
}

/**
 * 提取的 UI 組件：文字區塊
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
                    <MarkdownContent content={data.content} />
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
        <div className="bg-brand-bg dark:bg-brand-structural p-8 rounded-2xl shadow-sm border border-brand-taupe/10 dark:border-brand-structural flex flex-col items-center text-center transition-all hover:shadow-md h-full">
            {data.media && (
                <MediaRenderer
                    media={data.media}
                    className="w-16 h-16 mb-4"
                    imgClassName="object-contain"
                />
            )}
            <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2">{data.title}</h3>
            {data.subtitle && <p className="text-brand-accent dark:text-brand-accent text-sm font-medium mb-3">{data.subtitle}</p>}
            <div className="text-brand-taupe dark:text-brand-taupe text-sm">
                <MarkdownContent content={data.content} />
            </div>
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
 * 渲染列表塊
 */
function ListBlock({ block }) {
    const { faqList } = usePageData();
    const direction = block.direction || (block.layout_method === "vertical" ? "vertical" : "horizontal");

    // 準備列表數據，將 FAQ 或普通項目統一轉化為 Block 結構
    const listItems = block.faq_ids
        ? block.faq_ids.map(id => faqList.find(f => f.id === id)).filter(Boolean).map(f => ({ ...f, type: 'faq_item' }))
        : (block.items || []).map(item => ({
            ...item,
            type: item.item_type || block.item_type || (direction === "vertical" ? "text" : "benefit_item")
        }));

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
                    <BlockRenderer block={item} context="list" />
                )}
            />
        </div>
    );
}


