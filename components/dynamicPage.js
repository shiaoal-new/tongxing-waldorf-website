import { useRouter } from "next/router";
import Layout from "./layout";
import Section from "./section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHero from "./pageHero";
import Benefits from "./benefits";
import ScrollableGrid from "./scrollableGrid";
import VideoItem from "./video";
import MediaRenderer from "./mediaRenderer";
import ScheduleBlock from "./scheduleBlock";
import CurriculumBlock from "./curriculumBlock";
import ColorPaletteBlock from "./colorPaletteBlock";
import Modal from "./modal";
import ActionButtons from "./actionButtons";
import Faq from "./faq";
import AccordionList from "./accordionList";
import VisitProcess from "./visitProcess";
import VisitSchedule from "./visitSchedule";
import SpacingDemoBlock from "./spacingDemoBlock";
import TypographyDemoBlock from "./typographyDemoBlock";
import MicroInteractionsBlock from "./microInteractionsBlock";
import TabbedContentBlock from "./tabbedContentBlock";
import TableOfContents from "./tableOfContents";
import ParallaxBackground from "./parallaxBackground";
import { useState, useRef } from "react";
import { useTheme } from "next-themes";

export default function DynamicPageContent({ page, pages, navigation, facultyList, faqList, benefitsList, coursesList = [] }) {
    const [selectedMember, setSelectedMember] = useState(null);
    const { theme } = useTheme();

    const handleButtonClick = (link) => {
        if (!link) return false;

        // Pattern for member details or other special triggers can go here

        return false;
    };

    if (!page) {
        return <div>Page not found</div>;
    }


    const getImagePath = (path) => {
        if (!path) return path;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    const getMemberDetails = (name) => {
        const member = facultyList.find(f => f.name === name) || { name };
        const media = member.media || (member.photo ? { type: 'image', image: getImagePath(member.photo) } : null);
        return {
            ...member,
            media
        };
    };

    const heroData = page.hero;
    const sections = page.sections || [];

    // Extract TOC sections
    const tocSections = sections.map(section => {
        const blocks = section.blocks || [];
        let title = "";
        const firstBlock = blocks[0];
        if (firstBlock && firstBlock.type === 'text_block') {
            if (firstBlock.header) title = firstBlock.header;
            else if (firstBlock.sub_header) title = firstBlock.sub_header;
        }
        return {
            id: section.section_id,
            title: title || section.section_id || "Section"
        };
    }).filter(s => s.id);

    // Fallback: if hero exists but has no title, use page title
    const effectiveHeroData = heroData ? {
        header: page.title,
        ...heroData
    } : null;

    return (
        <Layout pages={pages} navigation={navigation} title={page.title} navbarPadding={!effectiveHeroData}>
            <TableOfContents sections={tocSections} />
            {effectiveHeroData && <PageHero data={effectiveHeroData} />}

            <div className="w-full py-10 relative overflow-hidden">
                {theme === 'tongxing' && <ParallaxBackground src="/img/background/background.webp" />}
                {!effectiveHeroData && (
                    <Section title={page.title} align="left" description={page.description} />
                )}

                <div className="mt-10">
                    {sections.map((section, index) => {
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
                                (firstContent.type === 'list_block' && firstContent.display_mode === 'scrollable_grid' && firstContent.item_type === 'benefit') ||
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
                                (b.type === "list_block" && ["grid_cards", "compact_grid", "scrollable_grid"].includes(b.display_mode))
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
                                            {block.type === "text_block" && (
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
                                            )}

                                            {block.type === "member_block" && (
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
                                            )}

                                            {block.type === "list_block" && (
                                                <>
                                                    {(block.header || block.subtitle) && (
                                                        <div className={`max-w-4xl mx-auto mb-8 ${align === 'left' ? 'text-left' : 'text-center'}`}>
                                                            {block.subtitle && (
                                                                <div className="text-xs font-bold tracking-wider text-brand-accent uppercase mb-1">
                                                                    {block.subtitle}
                                                                </div>
                                                            )}
                                                            {block.header && (
                                                                <h4 className="font-bold text-brand-text dark:text-brand-bg border-l-4 border-warning-400 pl-4">
                                                                    {block.header}
                                                                </h4>
                                                            )}
                                                        </div>
                                                    )}
                                                    {block.display_mode === "scrollable_grid" && (
                                                        <ScrollableGrid
                                                            items={block.items || []}
                                                            renderItem={(item, index) => {
                                                                if (block.item_type === "benefit") {
                                                                    return (
                                                                        <Benefits
                                                                            key={index}
                                                                            data={{
                                                                                ...item,
                                                                                bullets: item.sub_items?.map(bullet => ({
                                                                                    ...bullet,
                                                                                    buttons: bullet.buttons?.map(btn => {
                                                                                        if (btn.link?.startsWith("#")) {
                                                                                            return {
                                                                                                ...btn,
                                                                                                onClick: () => handleButtonClick(btn.link)
                                                                                            };
                                                                                        }
                                                                                        return btn;
                                                                                    })
                                                                                }))
                                                                            }}
                                                                        />
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
                                                            columns={3}
                                                            className={block.item_type === "video" ? "spacing-component" : ""}
                                                            itemClassName={block.item_type === "video" ? "gap-y-16" : ""}
                                                        />
                                                    )}

                                                    {block.display_mode === "accordion" && (
                                                        block.faq_ids ? (
                                                            <Faq faqList={block.faq_ids.map(id => faqList.find(f => f.id === id)).filter(Boolean).map(f => ({
                                                                question: f.question,
                                                                answer: f.answer
                                                            }))} />
                                                        ) : (
                                                            <AccordionList items={block.items} />
                                                        )
                                                    )}



                                                    {block.display_mode === "grid_cards" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-brand mx-auto">
                                                            {block.items?.map((item, idx) => (
                                                                <div key={idx} className="bg-brand-bg dark:bg-brand-structural p-8 rounded-2xl shadow-sm border border-brand-taupe/10 dark:border-brand-structural flex flex-col items-center text-center transition-all hover:shadow-md">
                                                                    <MediaRenderer
                                                                        media={item.media || (item.image ? { type: 'image', image: getImagePath(item.image) } : null)}
                                                                        className="w-16 h-16 mb-4"
                                                                        imgClassName="object-contain"
                                                                    />
                                                                    <h3 className="font-bold text-brand-text dark:text-brand-bg mb-2">{item.title}</h3>
                                                                    {item.subtitle && <p className="text-brand-accent dark:text-brand-accent text-sm font-medium mb-3">{item.subtitle}</p>}
                                                                    <p className="text-brand-taupe dark:text-brand-taupe text-sm">{item.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {block.display_mode === "compact_grid" && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-brand mx-auto">
                                                            {block.items?.map((item, idx) => (
                                                                <div key={idx} className="bg-brand-bg dark:bg-brand-structural p-4 rounded-xl shadow-sm border border-gray-50 dark:border-brand-structural flex flex-col items-start transition-all hover:bg-brand-accent/10/30 dark:hover:bg-primary-900/10">
                                                                    <div className="text-xs font-bold text-brand-accent dark:text-brand-accent mb-1 uppercase tracking-wider">{item.subtitle}</div>
                                                                    <h3 className="font-bold text-brand-text dark:text-brand-bg">{item.title}</h3>
                                                                    {item.desc && <p className="text-brand-taupe dark:text-brand-taupe text-xs mt-1">{item.desc}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {block.type === "schedule_block" && (
                                                <ScheduleBlock data={block} />
                                            )}
                                            {block.type === "curriculum_block" && (
                                                <CurriculumBlock data={block} />
                                            )}
                                            {block.type === "color_palette_block" && (
                                                <ColorPaletteBlock data={block} />
                                            )}
                                            {block.type === "visit_process_block" && (
                                                <VisitProcess />
                                            )}
                                            {block.type === "visit_schedule_block" && (
                                                <VisitSchedule />
                                            )}
                                            {block.type === "spacing_demo_block" && (
                                                <SpacingDemoBlock data={block} />
                                            )}
                                            {block.type === "typography_demo_block" && (
                                                <TypographyDemoBlock data={block} />
                                            )}
                                            {block.type === "micro_interactions_block" && (
                                                <MicroInteractionsBlock data={block} />
                                            )}
                                            {block.type === "tabbed_content_block" && (
                                                <TabbedContentBlock data={block} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        );
                    })}

                    {!page.sections && page.content && (
                        <div className="max-w-4xl mx-auto px-4">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {page.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                title={selectedMember?.name}
            >
                {selectedMember && (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-5/12 flex-shrink-0">
                            <div
                                className="relative w-full rounded-3xl overflow-hidden border-4 border-brand-accent/20 shadow-md bg-brand-bg dark:bg-brand-structural"
                                style={{ aspectRatio: '1/1' }}
                            >
                                {selectedMember.media ? (
                                    <MediaRenderer
                                        media={selectedMember.media}
                                        className="absolute inset-0 w-full h-full"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-brand-accent/10 dark:bg-primary-900/30">
                                        <span className="text-brand-accent/60 text-6xl font-bold">{selectedMember.name?.[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="mb-6">
                                <h4 className="font-bold text-brand-accent dark:text-brand-accent mb-1">{selectedMember.title}</h4>
                                <div className="h-1 w-20 bg-warning-500 rounded-full"></div>
                            </div>

                            <div className="space-y-6">
                                {selectedMember.education && (
                                    <div>
                                        <h5 className="text-sm font-bold text-brand-taupe uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            學歷背景與資格
                                        </h5>
                                        <div className="text-brand-text dark:text-brand-taupe leading-relaxed pl-4 border-l border-brand-taupe/10 dark:border-brand-structural text-sm">
                                            {selectedMember.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="flex items-start mb-2 group/item">
                                                    <span className="text-brand-accent mr-2 mt-1.5 flex-shrink-0">
                                                        <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="3" />
                                                        </svg>
                                                    </span>
                                                    <span>{line.replace(/^[-\*\+]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedMember.experience && (
                                    <div>
                                        <h5 className="text-sm font-bold text-brand-taupe uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            專業經歷
                                        </h5>
                                        <div className="text-brand-text dark:text-brand-taupe leading-relaxed pl-4 border-l border-brand-taupe/10 dark:border-brand-structural text-sm">
                                            {selectedMember.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="flex items-start mb-2">
                                                    <span className="text-brand-accent mr-2 mt-1.5 flex-shrink-0">
                                                        <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="3" />
                                                        </svg>
                                                    </span>
                                                    <span>{line.replace(/^[-\*\+]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedMember.bio && (
                                    <div className="bg-brand-accent/10/30 dark:bg-primary-900/10 p-5 md:p-8 rounded-3xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h5 className="text-xs font-bold text-brand-accent/60 uppercase tracking-widest mb-4 flex items-center">
                                                <span className="w-4 h-px bg-primary-200 mr-2"></span>
                                                教育理念 / 心語
                                            </h5>
                                            <div className="text-brand-text dark:text-brand-bg italic leading-relaxed whitespace-pre-line text-sm md:text-base">
                                                {selectedMember.bio}
                                            </div>
                                        </div>
                                        <svg className="absolute -bottom-4 -right-2 w-24 h-24 text-primary-100/50 dark:text-primary-900/20 pointer-events-none" fill="currentColor" viewBox="0 0 32 32">
                                            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H7.2c.5-1.5 1.7-2.8 3.2-3.2V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6.8c.5-1.5 1.7-2.8 3.2-3.2V8z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

        </Layout>
    );
}

