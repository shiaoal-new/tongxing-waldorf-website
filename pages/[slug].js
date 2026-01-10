import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation } from "../lib/settings";
import { getAllCourses } from "../lib/courses";
import DynamicPageContent from "../components/dynamicPage";

export default function DynamicPage(props) {
    return <DynamicPageContent {...props} />;
}

export async function getStaticPaths() {
    const pages = getAllPages();
    const excludedSlugs = ["index", "colors", "layout-spacing", "typography"];
    const paths = pages
        .filter((page) => !excludedSlugs.includes(page.slug))
        .map((page) => ({
            params: { slug: page.slug },
        }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const page = getPageBySlug(slug);
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
            page: page || null,
            pages,
            navigation,
            data: {
                facultyList,
                faqList,
                coursesList,
            },
        },
    };
}
