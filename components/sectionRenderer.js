import Section from "./section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Benefit from "./benefits";
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

/**
 * 渲染单个section及其内部的所有blocks
 */
export function renderSection(section, index, { getMemberDetails, setSelectedMember, faqList, getImagePath }) {
    const layout = section._layout || {};
    const blocks = section.blocks || [];
    const sectionId = section.section_id;
    const mediaList = section.media_list;
    const parallaxRatio = section.parallax_ratio;

    // Identify if the first block is a header (text_block with header/subheader)
    const firstBlock = blocks[0];
    let headerProps = {};
    let contentBlocks = blocks;
    let align = "center"; // Default alignment

    if (firstBlock && firstBlock.type === 'text_block') {
        // If it has header properties, treat it as the section header
        if (firstBlock.header || firstBlock.sub_header) {
            headerProps = {
                title: firstBlock.header,
                pretitle: firstBlock.sub_header,
                description: firstBlock.description,
                buttons: firstBlock.buttons
            };
            // Consume the first block so it doesn't render again
            contentBlocks = blocks.slice(1);
        }
    }

    // Determine alignment based on the first CONTENT block (if any)
    if (contentBlocks.length > 0) {
        const firstContent = contentBlocks[0];
        if (firstContent.type === 'text_block' ||
            (firstContent.type === 'list_block' && firstContent.layout_method === 'scrollable_grid' && firstContent.item_type === 'benefit') ||
            (firstContent.type === 'member_block')) {
            align = "left";
        }
    }

    // Determine if we should limit the section body width
    // Generally, text-heavy or alternating layouts should be limited to 1200px (brand max-width)
    // Grid-based collections and specific overview blocks should be wide (uncapped)
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
                        {renderBlock(block, align, { getMemberDetails, setSelectedMember, faqList, getImagePath })}
                    </div>
                ))}
            </div>
        </Section>
    );
}

/**
 * 根据block类型渲染对应的内容
 */
function renderBlock(block, align, { getMemberDetails, setSelectedMember, faqList, getImagePath }) {
    switch (block.type) {
        case "text_block":
            return renderTextBlock(block, align);
        case "member_block":
            return renderMemberBlock(block, getMemberDetails, setSelectedMember);
        case "list_block":
            return renderListBlock(block, faqList, getImagePath);
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
 * 渲染文本块
 */
function renderTextBlock(block, align) {
    return (
        <div className={`max-w-4xl mx-auto ${align === 'left' ? 'text-left' : 'text-center'}`}>
            {block.sub_header && (
                <div className="text-sm font-bold tracking-wider text-brand-accent uppercase">
                    {block.sub_header}
                </div>
            )}
            {block.header && (
                <h3 className="mt-3 text-brand-text dark:text-brand-bg">
                    {block.header}
                </h3>
            )}
            {block.description && (
                <div className="py-4 text-lg text-brand-taupe dark:text-brand-taupe">
                    {block.description}
                </div>
            )}
            {block.content && (
                <div className={`prose prose-lg dark:prose-invert max-w-none ${align === 'left' ? '' : 'mx-auto'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {block.content}
                    </ReactMarkdown>
                </div>
            )}
            <ActionButtons buttons={block.buttons} align={align === "left" ? "left" : "center"} className="mt-6" />
        </div>
    );
}

/**
 * 渲染成员块
 */
function renderMemberBlock(block, getMemberDetails, setSelectedMember) {
    return (
        <div className="max-w-brand mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {block.members && block.members.map((memberName, mIndex) => {
                    const member = getMemberDetails(memberName);
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
                                        <span className="text-brand-accent/60 text-3xl font-bold">{member.name?.[0]}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-2 right-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h3 className="font-bold text-brand-text dark:text-brand-bg group-hover:text-brand-accent transition-colors">{member.name}</h3>
                                {member.title && (
                                    <p className="mt-1 text-xs text-brand-accent dark:text-brand-accent font-medium tracking-tight whitespace-pre-wrap">
                                        {member.title}
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
 * 渲染列表块
 */
function renderListBlock(block, faqList, getImagePath) {
    return (
        <ListRenderer
            direction={block.direction || "horizontal"}
            items={
                block.faq_ids
                    ? block.faq_ids.map(id => faqList.find(f => f.id === id)).filter(Boolean).map(f => ({
                        question: f.question,
                        answer: f.answer,
                        title: f.question // 为 accordion 提供 title
                    }))
                    : (block.items || [])
            }
            layout={block.layout_method || "scrollable_grid"}
            columns={3}
            renderItem={(item, index) => {
                // FAQ 模式
                if (block.faq_ids) {
                    return (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ node, ...props }) => (
                                    <a
                                        {...props}
                                        className="text-brand-accent hover:text-primary-800 dark:text-brand-accent dark:hover:text-brand-accent/60 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                p: ({ node, ...props }) => (
                                    <p {...props} className="mb-3 last:mb-0" />
                                ),
                                table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto my-4">
                                        <table {...props} className="min-w-full divide-y divide-brand-taupe/20 dark:divide-gray-700 border border-brand-taupe/20 dark:border-brand-structural" />
                                    </div>
                                ),
                                thead: ({ node, ...props }) => (
                                    <thead {...props} className="bg-brand-bg dark:bg-brand-structural" />
                                ),
                                th: ({ node, ...props }) => (
                                    <th {...props} className="px-6 py-3 text-left text-xs font-medium text-brand-taupe dark:text-brand-taupe uppercase tracking-wider border-b border-brand-taupe/20 dark:border-brand-structural" />
                                ),
                                td: ({ node, ...props }) => (
                                    <td {...props} className="px-6 py-4 whitespace-normal text-sm text-brand-taupe dark:text-brand-taupe border-b border-brand-taupe/20 dark:border-brand-structural" />
                                ),
                            }}
                        >
                            {item.answer}
                        </ReactMarkdown>
                    );
                }


                // Vertical 模式 (非 FAQ)
                if (block.direction === "vertical") {
                    return (
                        <>
                            {item.subtitle && (
                                <div className="text-sm font-bold text-brand-accent mb-2">
                                    {item.subtitle}
                                </div>
                            )}
                            <div className="text-brand-taupe dark:text-brand-taupe">
                                {item.desc}
                            </div>
                        </>
                    );
                }

                // Grid Cards 模式
                if (block.layout_method === "grid_cards") {
                    return (
                        <div className="bg-brand-bg dark:bg-brand-structural p-8 rounded-2xl shadow-sm border border-brand-taupe/10 dark:border-brand-structural flex flex-col items-center text-center transition-all hover:shadow-md">
                            <MediaRenderer
                                media={item.media || (item.image ? { type: 'image', image: getImagePath(item.image) } : null)}
                                className="w-16 h-16 mb-4"
                                imgClassName="object-contain"
                            />
                            <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2">{item.title}</h3>
                            {item.subtitle && <p className="text-brand-accent dark:text-brand-accent text-sm font-medium mb-3">{item.subtitle}</p>}
                            <p className="text-brand-taupe dark:text-brand-taupe text-sm">{item.desc}</p>
                        </div>
                    );
                }

                // Compact Grid 模式
                if (block.layout_method === "compact_grid") {
                    return (
                        <div className="bg-brand-bg dark:bg-brand-structural p-4 rounded-xl shadow-sm border border-gray-50 dark:border-brand-structural flex flex-col items-start transition-all hover:bg-brand-accent/10/30 dark:hover:bg-primary-900/10">
                            <div className="text-xs font-bold text-brand-accent dark:text-brand-accent mb-1 uppercase tracking-wider">{item.subtitle}</div>
                            <h3 className="font-bold text-brand-text dark:text-brand-bg">{item.title}</h3>
                            {item.desc && <p className="text-brand-taupe dark:text-brand-taupe text-xs mt-1">{item.desc}</p>}
                        </div>
                    );
                }

                // Scrollable Grid 模式 - 根据 item_type
                if (block.item_type === "benefit") {
                    return (
                        <Benefit title={item.title} icon={item.icon} buttons={item.buttons}>
                            {item.desc}
                        </Benefit>
                    );
                } else if (block.item_type === "video") {
                    return (
                        <VideoItem
                            video={{
                                title: item.title,
                                media: item.media || (item.video_url ? { type: 'youtube', url: item.video_url } : null),
                                description: item.desc,
                                className: item.className
                            }}
                            className="md:even:translate-y-12 lg:even:translate-y-0 lg:[&:nth-child(3n+2)]:translate-y-12"
                        />
                    );
                }
                return null;
            }}
        />
    );
}
