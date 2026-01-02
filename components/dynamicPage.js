import { useRouter } from "next/router";
import Layout from "./layout";
import Section from "./section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHero from "./pageHero";
import Modal from "./modal";
import MediaRenderer from "./mediaRenderer";
import TableOfContents from "./tableOfContents";
import ParallaxBackground from "./parallaxBackground";
import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SectionBlock } from "./sectionRenderer";
import { PageDataProvider } from "../contexts/PageDataContext";

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

    const getMemberDetails = (title) => {
        console.log('[getMemberDetails] Looking for:', title);
        console.log('[getMemberDetails] facultyList length:', facultyList?.length);
        console.log('[getMemberDetails] facultyList names:', facultyList?.map(f => f.title));
        const member = facultyList.find(f => f.title === title) || { title };
        console.log('[getMemberDetails] Found member:', member);
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
            if (firstBlock.title) title = firstBlock.title;
            else if (firstBlock.subtitle) title = firstBlock.subtitle;
        }
        return {
            id: section.section_id,
            title: title || section.section_id || "Section"
        };
    }).filter(s => s.id);

    // Fallback: if hero exists but has no title, use page title
    const effectiveHeroData = heroData ? {
        title: page.title,
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
                    <PageDataProvider value={{
                        getMemberDetails,
                        setSelectedMember,
                        faqList,
                        getImagePath
                    }}>
                        {sections.map((section, index) =>
                            <SectionBlock key={index} section={section} index={index} />
                        )}
                    </PageDataProvider>

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
                title={selectedMember?.title}
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
                                        <span className="text-brand-accent/60 text-6xl font-bold">{selectedMember.title?.[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="mb-6">
                                <h4 className="font-bold text-brand-accent dark:text-brand-accent mb-1">{selectedMember.subtitle}</h4>
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
                                {selectedMember.content && (
                                    <div className="bg-brand-accent/10/30 dark:bg-primary-900/10 p-5 md:p-8 rounded-3xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h5 className="text-xs font-bold text-brand-accent/60 uppercase tracking-widest mb-4 flex items-center">
                                                <span className="w-4 h-px bg-primary-200 mr-2"></span>
                                                教育理念 / 心語
                                            </h5>
                                            <div className="text-brand-text dark:text-brand-bg italic leading-relaxed whitespace-pre-line text-sm md:text-base">
                                                {selectedMember.content}
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

        </Layout >
    );
}

