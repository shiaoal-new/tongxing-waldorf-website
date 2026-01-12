import { useRouter } from "next/router";
import Layout from "./layout";
import Section from "./section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHero from "./pageHero";
import MemberDetailModal from "./memberDetailModal";
import TableOfContents from "./tableOfContents";
import ParallaxBackground from "./parallaxBackground";
import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SectionRenderer } from "./sectionRenderer";
import { PageDataProvider } from "../contexts/PageDataContext";
import { useDynamicTOC } from "./useDynamicTOC";

export default function DynamicPageContent({ page, pages, navigation, data = {} }) {
    // 從 data 物件中解構所需的資料，提供預設值以保持向後相容
    const {
        facultyList = [],
        faqList = [],
        coursesList = [],
        questionnaire = null,
        // 未來可以在這裡輕鬆添加新的資料類型
        // 例如：testimonials, events, gallery 等
    } = data;

    const [selectedMember, setSelectedMember] = useState(null);
    const { theme } = useTheme();

    // 使用 useDynamicTOC Hook 生成目錄
    const tocSections = useDynamicTOC(page, { questionnaire });


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
        const member = facultyList.find(f => f.title === title) || { title };
        const media = member.media || (member.photo ? { type: 'image', image: getImagePath(member.photo) } : null);
        return { ...member, media };
    };

    const heroData = page.hero;
    const sections = page.sections || [];

    // Fallback: if hero exists but has no title, use page title
    const effectiveHeroData = heroData ? {
        title: page.title,
        ...heroData
    } : null;

    return (
        <>
            <TableOfContents sections={tocSections} />
            <Layout pages={pages} navigation={navigation} title={page.title} navbarPadding={!effectiveHeroData}>
                {effectiveHeroData && <PageHero data={effectiveHeroData} />}

                <div className="w-full py-10 relative overflow-hidden">
                    {!effectiveHeroData && (
                        <Section title={page.title} align="left" description={page.description} />
                    )}

                    <div className="mt-10">
                        <PageDataProvider value={{
                            getMemberDetails,
                            setSelectedMember,
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

                <MemberDetailModal
                    selectedMember={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />

            </Layout>
        </>
    );
}

