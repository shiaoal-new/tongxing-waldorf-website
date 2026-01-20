import { GetStaticPaths, GetStaticProps } from "next";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation } from "../lib/settings";
import { getAllCourses } from "../lib/courses";
import DynamicPageContent from "../components/DynamicPage";
import { PageData, NavigationData, FaqItem, Member, Course } from "../types/content";

interface DynamicPageProps {
    page: PageData | null;
    pages: PageData[];
    navigation: NavigationData;
    data: {
        facultyList: Member[];
        faqList: FaqItem[];
        coursesList: Course[];
    };
}

export default function DynamicPage(props: DynamicPageProps) {
    return <DynamicPageContent {...props} />;
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
    const facultyList = getAllFaculty();
    const faqList = getAllFaq();
    const coursesList = getAllCourses();

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
            navigation,
            data: {
                facultyList,
                faqList,
                coursesList,
            },
        },
    };
};
