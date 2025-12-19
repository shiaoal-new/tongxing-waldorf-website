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
        return {
            ...member,
            photo: getImagePath(member.photo)
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
                        const wrapperClass = layout.wrapper_class || "mb-16";

                        return (
                            <Section
                                key={index}
                                layout={layout}
                                title={section.header}
                                pretitle={section.sub_header}
                                description={section.description}
                                align={section.type === "benefits_block" || section.type === "text_block" || section.type === "member_block" ? "left" : "center"}
                                className={wrapperClass}
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
                                                            {member.photo && (
                                                                <div className="flex-shrink-0 mr-4">
                                                                    <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary-100" />
                                                                </div>
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

                                    {section.type === "benefits_block" && (
                                        <div className="flex flex-col gap-10">
                                            {benefitsList.map((benefit, bIndex) => (
                                                <Benefits
                                                    key={benefit.id}
                                                    imgPos={bIndex % 2 === 1 ? "right" : "left"}
                                                    data={benefit}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {section.type === "video_block" && (
                                        <Video />
                                    )}

                                    {section.type === "faq_block" && (
                                        <Faq faqList={faqList} />
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
    const { getSectionLayoutByTitle } = require("../../lib/sectionLayouts");

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
