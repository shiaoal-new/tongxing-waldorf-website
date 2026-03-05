import { useRouter } from "next/router";
import Layout from "./layout/Layout";
import Section from "./layout/Section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import HeroSection from "./layout/HeroSection";
import MemberDetailModal from "./ui/MemberDetailModal";
import TableOfContents from "./blocks/TableOfContents";
import ParallaxBackground from "./ParallaxBackground";
import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SectionRenderer } from "./SectionRenderer";
import { PageDataProvider } from "../context/PageDataContext";
import { useDynamicTOC } from "../hooks/useDynamicTOC";
import { useWording } from "../hooks/useWording";
import { PageData, NavigationData, FaqItem, Member, Course, QuestionnaireData, SiteData } from "../types/content";
import { AnimatePresence, LayoutGroup } from "framer-motion";


interface DynamicPageContentProps {
    page: PageData | null;
    pages: Partial<PageData>[];
    navigation: NavigationData;
    siteSettings?: SiteData;
    data?: {
        facultyList?: Member[];
        faqList?: FaqItem[];
        coursesList?: Course[];
        questionnaire?: QuestionnaireData | null;
    };
    contentType?: 'page' | 'course';
    rawPage?: any;
    rawData?: any;
}

export default function DynamicPageContent({ page: initialPage, pages, navigation, siteSettings, data: initialData = {}, contentType = 'page', rawPage, rawData }: DynamicPageContentProps) {
    // 使用 useWording Hook 處理客戶端動態文案切換 (主要用於開發環境)
    const pageId = initialPage?.slug || 'index';
    const { page, data: resolvedData } = useWording(pageId, {
        page: initialPage,
        data: {
            ...initialData,
            coursesList: [] // 排除大型列表的遞迴解析，避免產生大量無關頁面的 [Missing] 警告
        }
    }, {
        // Pass raw unresolved data for client-side resolution
        page: rawPage || initialPage,
        data: {
            ...(rawData || initialData),
            coursesList: []
        }
    }, ["faq", "testimonials"]);

    // 從 data 物件中解構所需的資料，提供預設值以保持向後相容
    const {
        facultyList = [],
        faqList = [],
        questionnaire = null,
    } = resolvedData;

    // 恢復未經全文解析的 coursesList (避免干擾導航等基本功能)
    const coursesList = initialData.coursesList || [];

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const { theme } = useTheme();

    // 使用 useDynamicTOC Hook 生成目錄
    const tocSections = useDynamicTOC(page, { questionnaire });

    if (!page) {
        return <div>Page not found</div>;
    }

    const getImagePath = (path: string): string => {
        if (!path) return path;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    const getMemberDetails = (title: string): Member => {
        const member = facultyList.find(f => f.title === title) || { title, id: title } as Member;
        const media = member.media || (member.photo ? { type: 'image', image: getImagePath(member.photo) } : null);
        return { ...member, media } as Member;
    };

    const heroData = page.hero;
    const sections = page.sections || [];

    // Fallback: if hero exists but has no title, use page title
    const effectiveHeroData = heroData ? {
        title: page.title,
        ...heroData
    } : null;

    // Filter FAQ list to only include FAQs used on this page
    const pageFaqIds = new Set<string>();
    sections.forEach(section => {
        section.blocks?.forEach(block => {
            if (block.type === 'list_block' && block.item_type === 'faq_item' && block.faq_ids) {
                block.faq_ids.forEach(id => pageFaqIds.add(id));
            }
        });
    });
    const filteredFaqList = faqList.filter(faq => pageFaqIds.has(faq.id));

    return (
        <>
            <TableOfContents sections={tocSections} />
            <LayoutGroup>
                <Layout
                    pages={pages}
                    navigation={navigation}
                    title={page.title}
                    seo={page.seo}
                    hero={page.hero}
                    navbarPadding={!effectiveHeroData}
                    slug={page.slug}
                    faqList={filteredFaqList}
                    courseList={coursesList}
                    contentType={contentType}
                    siteSettings={siteSettings}
                    modal={
                        <AnimatePresence>
                            {selectedMember && (
                                <MemberDetailModal
                                    selectedMember={selectedMember}
                                    onClose={() => setSelectedMember(null)}
                                />
                            )}
                        </AnimatePresence>
                    }
                >
                    {effectiveHeroData && <HeroSection data={effectiveHeroData as any} />}

                    <div className={`w-full relative ${effectiveHeroData ? 'pb-10' : 'py-10'}`}>
                        {!effectiveHeroData && (
                            <Section
                                title={page.title}
                                align="left"
                                {...(page as any).description ? { description: (page as any).description } : {}}
                            />
                        )}

                        <div className={effectiveHeroData ? "" : "mt-10"}>
                            <PageDataProvider value={{
                                getMemberDetails,
                                setSelectedMember,
                                selectedMember,
                                faqList,
                                getImagePath,
                                questionnaire
                            }}>
                                {sections.map((section, index) => (
                                    <SectionRenderer key={index} section={section} index={index} />
                                ))}
                            </PageDataProvider>
                        </div>
                    </div>
                </Layout>
            </LayoutGroup>

        </>
    );
}
