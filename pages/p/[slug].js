import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Container from "../../components/container";
import Section from "../../components/section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPages, getPageBySlug } from "../../lib/pages";
import { getAllFaculty } from "../../lib/faculty";
import { getAllFaq } from "../../lib/faq";
import { getAllBenefits } from "../../lib/benefits";
import PageHero from "../../components/pageHero";
import Benefits from "../../components/benefits";
import Video from "../../components/video";
import Faq from "../../components/faq";
import { getSectionLayoutByTitle } from "../../lib/sectionLayouts";
import MediaRenderer from "../../components/mediaRenderer";
import ScheduleBlock from "../../components/scheduleBlock";
import CurriculumBlock from "../../components/curriculumBlock";
import Modal from "../../components/modal";
import ActionButtons from "../../components/actionButtons";
import { useState } from "react";


export default function DynamicPage({ page, pages, facultyList, faqList, benefitsList }) {
    const router = useRouter();
    const [selectedMember, setSelectedMember] = useState(null);

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

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

    // Fallback: if hero exists but has no title, use page title
    const effectiveHeroData = heroData ? {
        title: page.title,
        ...heroData
    } : null;

    return (
        <Layout pages={pages} title={page.title} navbarPadding={!effectiveHeroData}>
            {effectiveHeroData && <PageHero data={effectiveHeroData} />}

            <div className="w-full py-10">
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

                        if (mediaList) {
                            console.log(`Section ${index} (${sectionId}) has media_list:`, mediaList);
                        } else {
                            console.log(`Section ${index} (${sectionId}) has NO media_list`);
                        }


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
                        // If the first content block is "alternating" list or "text_block" (prose), usually left align looks better.
                        if (contentBlocks.length > 0) {
                            const firstContent = contentBlocks[0];
                            if (firstContent.type === 'text_block' ||
                                (firstContent.type === 'list_block' && firstContent.display_mode === 'alternating') ||
                                (firstContent.type === 'member_block')) {
                                align = "left";
                            }
                        }

                        return (
                            <Section
                                key={index}
                                layout={layout}
                                anchor={sectionId}
                                media_list={mediaList}
                                parallax_ratio={parallaxRatio}
                                align={align}
                                {...headerProps}
                                className="mb-16"
                            >
                                <div className="mt-6 px-4 md:px-0">
                                    {contentBlocks.map((block, bIndex) => (
                                        <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                                            {block.type === "text_block" && (
                                                <div className={`max-w-4xl mx-auto ${align === 'left' ? 'text-left' : 'text-center'}`}>
                                                    {block.sub_header && (
                                                        <div className="text-sm font-bold tracking-wider text-primary-600 uppercase">
                                                            {block.sub_header}
                                                        </div>
                                                    )}
                                                    {block.header && (
                                                        <h3 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:leading-tight lg:text-3xl">
                                                            {block.header}
                                                        </h3>
                                                    )}
                                                    {block.description && (
                                                        <div className="py-4 text-lg leading-normal text-gray-500 dark:text-gray-300">
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
                                                <div className="max-w-6xl mx-auto">
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                        {block.members && block.members.map((memberName, mIndex) => {
                                                            const member = getMemberDetails(memberName);
                                                            return (
                                                                <div
                                                                    key={mIndex}
                                                                    onClick={() => setSelectedMember(member)}
                                                                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                                                                >
                                                                    <div className="relative mb-4">
                                                                        {member.media ? (
                                                                            <MediaRenderer
                                                                                media={member.media}
                                                                                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-primary-50 group-hover:border-primary-100 transition-colors shadow-sm"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center border-4 border-primary-50 dark:border-primary-900/50">
                                                                                <span className="text-primary-300 text-3xl font-bold">{member.name?.[0]}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute -bottom-2 right-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary-700 transition-colors leading-tight">{member.name}</h3>
                                                                        {member.title && (
                                                                            <p className="mt-1 text-xs text-primary-600 dark:text-primary-400 font-medium tracking-tight whitespace-pre-wrap">
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
                                                <div className="px-4 md:px-0">
                                                    {(block.header || block.subtitle) && (
                                                        <div className={`max-w-4xl mx-auto mb-8 ${align === 'left' ? 'text-left' : 'text-center'}`}>
                                                            {block.subtitle && (
                                                                <div className="text-xs font-bold tracking-wider text-primary-500 uppercase mb-1">
                                                                    {block.subtitle}
                                                                </div>
                                                            )}
                                                            {block.header && (
                                                                <h4 className="text-xl font-bold text-gray-800 dark:text-white border-l-4 border-warning-400 pl-4">
                                                                    {block.header}
                                                                </h4>
                                                            )}
                                                        </div>
                                                    )}
                                                    {block.display_mode === "alternating" && (
                                                        <div className="flex flex-col gap-16">
                                                            {block.items?.map((item, iIndex) => (
                                                                <Benefits
                                                                    key={iIndex}
                                                                    imgPos={iIndex % 2 === 1 ? "right" : "left"}
                                                                    data={{
                                                                        ...item,
                                                                        bullets: item.sub_items
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {block.display_mode === "accordion" && (
                                                        <Faq faqList={block.items?.map(item => ({
                                                            question: item.title,
                                                            answer: item.desc
                                                        }))} />
                                                    )}

                                                    {block.display_mode === "videos" && (
                                                        <Video videoList={block.items?.map(item => ({
                                                            title: item.title,
                                                            media: item.media || (item.video_url ? { type: 'youtube', url: item.video_url } : null),
                                                            description: item.desc
                                                        }))} />
                                                    )}

                                                    {block.display_mode === "grid_cards" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                                            {block.items?.map((item, idx) => (
                                                                <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all hover:shadow-md">
                                                                    <MediaRenderer
                                                                        media={item.media || (item.image ? { type: 'image', image: getImagePath(item.image) } : null)}
                                                                        className="w-16 h-16 mb-4"
                                                                        imgClassName="object-contain"
                                                                    />
                                                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
                                                                    {item.subtitle && <p className="text-primary-600 dark:text-primary-400 text-sm font-medium mb-3">{item.subtitle}</p>}
                                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {block.display_mode === "compact_grid" && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                                                            {block.items?.map((item, idx) => (
                                                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-50 dark:border-gray-700 flex flex-col items-start transition-all hover:bg-primary-50/30 dark:hover:bg-primary-900/10">
                                                                    <div className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wider">{item.subtitle}</div>
                                                                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{item.title}</h3>
                                                                    {item.desc && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{item.desc}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {block.type === "schedule_block" && (
                                                <ScheduleBlock data={block} />
                                            )}
                                            {block.type === "curriculum_block" && (
                                                <CurriculumBlock data={block} />
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
                                className="relative w-full rounded-3xl overflow-hidden border-4 border-primary-50 shadow-md bg-gray-50 dark:bg-gray-800"
                                style={{ aspectRatio: '1/1' }}
                            >
                                {selectedMember.media ? (
                                    <MediaRenderer
                                        media={selectedMember.media}
                                        className="absolute inset-0 w-full h-full"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary-50 dark:bg-primary-900/30">
                                        <span className="text-primary-300 text-6xl font-bold">{selectedMember.name?.[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="mb-6">
                                <h4 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-1">{selectedMember.title}</h4>
                                <div className="h-1 w-20 bg-warning-500 rounded-full"></div>
                            </div>

                            <div className="space-y-6">
                                {selectedMember.education && (
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            學歷背景與資格
                                        </h5>
                                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed pl-4 border-l border-gray-100 dark:border-gray-700 text-sm">
                                            {selectedMember.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="flex items-start mb-2 group/item">
                                                    <span className="text-primary-500 mr-2 mt-1.5 flex-shrink-0">
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
                                        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            專業經歷
                                        </h5>
                                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed pl-4 border-l border-gray-100 dark:border-gray-700 text-sm">
                                            {selectedMember.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="flex items-start mb-2">
                                                    <span className="text-primary-500 mr-2 mt-1.5 flex-shrink-0">
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
                                    <div className="bg-primary-50/30 dark:bg-primary-900/10 p-5 md:p-8 rounded-3xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h5 className="text-xs font-bold text-primary-500/60 uppercase tracking-widest mb-4 flex items-center">
                                                <span className="w-4 h-px bg-primary-200 mr-2"></span>
                                                教育理念 / 心語
                                            </h5>
                                            <div className="text-gray-700 dark:text-gray-200 italic leading-relaxed whitespace-pre-line text-sm md:text-base">
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

export async function getStaticPaths() {
    const pages = getAllPages();
    const paths = pages.map((page) => ({
        params: { slug: page.slug },
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const page = getPageBySlug(slug);
    const pages = getAllPages();
    const facultyList = getAllFaculty();
    const faqList = getAllFaq();
    const benefitsList = getAllBenefits();

    // Resolve layout templates for each section
    if (page && page.sections) {
        page.sections = page.sections.map(section => {
            if (section.layout) {
                const layoutData = getSectionLayoutByTitle(section.layout);
                if (layoutData) {
                    return { ...section, _layout: layoutData };
                }
            }
            return section;
        });
    }

    return {
        props: {
            page,
            pages,
            facultyList,
            faqList,
            benefitsList,
        },
    };
}
