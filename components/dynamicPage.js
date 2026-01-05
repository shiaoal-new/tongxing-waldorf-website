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

export default function DynamicPageContent({ page, pages, navigation, facultyList, faqList, coursesList = [] }) {
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

        </Layout >
    );
}

