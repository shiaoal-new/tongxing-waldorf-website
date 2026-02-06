import { GetStaticPaths, GetStaticProps } from "next";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../lib/settings";
import { getPageDataOptimized } from "../lib/dataLoader";
import DynamicPageContent from "../components/DynamicPage";
import { PageData, NavigationData, FaqItem, Member, Course, SiteData } from "../types/content";
import { getWordingDictionary, resolveWording } from "../lib/wording.server";

interface DynamicPageProps {
    page: PageData | null;
    pages: PageData[];
    navigation: NavigationData;
    siteSettings: SiteData;
    data: {
        facultyList: Member[];
        faqList: FaqItem[];
        coursesList: Course[];
    };
}

export default function DynamicPage(props: DynamicPageProps) {
    return <DynamicPageContent {...props} contentType="page" />;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const pages = getAllPages();
    const excludedSlugs = ["index", "colors", "layout-spacing", "typography", "waldorf-assessment"];
    const paths = pages
        .filter((page) => !excludedSlugs.includes(page.slug))
        .map((page) => ({
            params: { slug: page.slug },
        }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<DynamicPageProps> = async ({ params }) => {
    const slug = params?.slug as string;
    const page = getPageBySlug(slug) || null;
    const pages = getAllPages();
    const navigation = getNavigation();
    const siteSettings = getSiteSettings();

    // 处理 Hero Layout
    if (page && page.hero && typeof page.hero.layout === 'string') {
        const heroLayoutData = getSectionLayoutByTitle(page.hero.layout);
        if (heroLayoutData) {
            page.hero.layout = heroLayoutData;
        }
    }

    // 处理 section layouts
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

    // 按需加载数据 - 只加载页面实际需要的数据
    const pageData = getPageDataOptimized(page);

    // Resolve default wordings for static generation (only in production for SEO)
    const isProd = process.env.NODE_ENV === 'production';
    const dictionary = getWordingDictionary(slug, "default", ["faq"]);
    const resolvedPage = isProd ? (page ? resolveWording(page, dictionary) : null) : page;
    const resolvedDataList = isProd ? resolveWording({
        facultyList: pageData.facultyList || [],
        faqList: pageData.faqList || [],
        coursesList: pageData.coursesList || [],
    }, dictionary) : {
        facultyList: pageData.facultyList || [],
        faqList: pageData.faqList || [],
        coursesList: pageData.coursesList || [],
    };

    return {
        props: {
            page: resolvedPage,
            pages,
            navigation,
            siteSettings,
            data: resolvedDataList,
        },
    };
};
