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
                                                    {block.buttons && block.buttons.length > 0 && (
                                                        <div className={`mt-6 flex flex-wrap gap-4 ${align === "left" ? "justify-start" : "justify-center"}`}>
                                                            {block.buttons.map((btn, idx) => {
                                                                const isPrimary = btn.style === "primary";
                                                                const isWhite = btn.style === "white";
                                                                return (
                                                                    <a
                                                                        key={idx}
                                                                        href={btn.link}
                                                                        target={btn.link?.startsWith("http") ? "_blank" : "_self"}
                                                                        rel="noopener noreferrer"
                                                                        className={`px-8 py-3 text-lg font-medium text-center rounded-md transition-all ${isPrimary
                                                                            ? "bg-primary-600 text-white hover:bg-primary-700"
                                                                            : isWhite
                                                                                ? "bg-white text-primary-600 hover:bg-gray-50"
                                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                            }`}
                                                                    >
                                                                        {btn.text}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
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
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            {selectedMember.media ? (
                                <MediaRenderer
                                    media={selectedMember.media}
                                    className="w-full aspect-square rounded-3xl overflow-hidden border-8 border-primary-50 shadow-sm"
                                />
                            ) : (
                                <div className="w-full aspect-square rounded-3xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center border-8 border-primary-50 dark:border-primary-900/50">
                                    <span className="text-primary-300 text-6xl font-bold">{selectedMember.name?.[0]}</span>
                                </div>
                            )}
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
                                            學學背景與資格
                                        </h5>
                                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pl-4 border-l border-gray-100 dark:border-gray-700">
                                            {selectedMember.education}
                                        </div>
                                    </div>
                                )}
                                {selectedMember.experience && (
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            專業經歷
                                        </h5>
                                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pl-4 border-l border-gray-100 dark:border-gray-700">
                                            {selectedMember.experience}
                                        </div>
                                    </div>
                                )}
                                {selectedMember.bio && (
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                                            教育理念 / 心語
                                        </h5>
                                        <div className="text-gray-600 dark:text-gray-400 italic leading-relaxed pl-4 border-l border-gray-100 dark:border-gray-700">
                                            {selectedMember.bio}
                                        </div>
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
