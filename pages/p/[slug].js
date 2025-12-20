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

export default function DynamicPage({ page, pages, facultyList, faqList, benefitsList }) {
    const router = useRouter();

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
                        return (
                            <Section
                                key={index}
                                layout={layout}
                                title={section.header}
                                pretitle={section.sub_header}
                                description={section.description}
                                align={section.type === "list_block" && section.display_mode === "alternating" || section.type === "text_block" || section.type === "member_block" ? "left" : "center"}
                                buttons={section.buttons}
                                className="mb-16"
                            >
                                <div className="mt-6 px-4 md:px-0">
                                    {section.type === "text_block" && (
                                        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {section.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    {section.type === "member_block" && (
                                        <div className="max-w-4xl mx-auto">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                {section.members && section.members.map((memberName, mIndex) => {
                                                    const member = getMemberDetails(memberName);
                                                    return (
                                                        <div key={mIndex} className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg ">
                                                            {member.media && (
                                                                <MediaRenderer
                                                                    media={member.media}
                                                                    className="flex-shrink-0 mr-4 w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100"
                                                                />
                                                            )}
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{member.name}</h3>
                                                                {member.title && <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">{member.title}</p>}
                                                                {member.bio && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{member.bio}</div>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {section.type === "list_block" && (
                                        <div className="mt-6 px-4 md:px-0">
                                            {section.display_mode === "alternating" && (
                                                <div className="flex flex-col gap-16">
                                                    {section.items?.map((item, bIndex) => (
                                                        <Benefits
                                                            key={bIndex}
                                                            imgPos={bIndex % 2 === 1 ? "right" : "left"}
                                                            data={{
                                                                ...item,
                                                                bullets: item.sub_items
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {section.display_mode === "accordion" && (
                                                <Faq faqList={section.items?.map(item => ({
                                                    question: item.title,
                                                    answer: item.desc
                                                }))} />
                                            )}

                                            {section.display_mode === "videos" && (
                                                <Video videoList={section.items?.map(item => ({
                                                    title: item.title,
                                                    media: item.media || (item.video_url ? { type: 'youtube', url: item.video_url } : null),
                                                    description: item.desc
                                                }))} />
                                            )}

                                            {section.display_mode === "grid_cards" && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                                    {section.items?.map((item, idx) => (
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

                                    {/* Legacy Blocks Support */}
                                    {section.type === "benefits_block" && (
                                        <div className="flex flex-col gap-10">
                                            {(section.benefits || benefitsList).map((benefit, bIndex) => (
                                                <Benefits
                                                    key={benefit.id || bIndex}
                                                    imgPos={bIndex % 2 === 1 ? "right" : "left"}
                                                    data={benefit}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {section.type === "video_block" && (
                                        <Video videoList={section.videos} />
                                    )}

                                    {section.type === "faq_block" && (
                                        <Faq faqList={section.faqs || faqList} />
                                    )}
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
