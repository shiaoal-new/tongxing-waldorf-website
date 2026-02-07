import { getAllCourses, getCourseBySlug } from "../../lib/courses";
import { getAllPages } from "../../lib/pages";
import { getSectionLayoutByTitle } from "../../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../../lib/settings";
import { getPageDataOptimized } from "../../lib/dataLoader";
import DynamicPageContent from "../../components/DynamicPage";
import { useWording } from "../../hooks/useWording";
import { getWordingDictionary, resolveWording } from "../../lib/wording.server";

export default function CoursePage(props) {
    // Wording resolution is now handled inside DynamicPageContent via useWording hook
    return <DynamicPageContent {...props} page={props.course} data={props.data} contentType="course" />;
}

export async function getStaticPaths() {
    const courses = getAllCourses();
    const paths = courses.map((course) => ({
        params: { slug: course.slug },
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const course = getCourseBySlug(slug);
    const pages = getAllPages();
    const navigation = getNavigation();
    const siteSettings = getSiteSettings();
    const coursesList = getAllCourses();

    // 处理 section layouts
    if (course && course.sections) {
        course.sections = course.sections.map(section => {
            if (section.layout) {
                const layoutData = getSectionLayoutByTitle(section.layout);
                if (layoutData) {
                    return { ...section, _layout: layoutData };
                }
            }
            return section;
        });
    }

    // 按需加载数据 - 只加载课程页面實際需要的數據
    const pageData = getPageDataOptimized(course);

    // Resolve page titles for navigation (pages list)
    // This allows the Navbar to display correct titles instead of placeholders
    const resolvedPages = pages.map(p => {
        const dict = getWordingDictionary(p.slug, "default");
        return {
            ...p,
            title: resolveWording(p.title, dict)
        };
    });

    // Note: Wording resolution is deferred to the client in development
    // For production, we can optionally pre-resolve here for SEO if needed,
    // but CoursePage currently relies more on client-side loading.

    return {
        props: {
            course: course || null,
            pages: resolvedPages,
            navigation,
            siteSettings,
            data: {
                facultyList: pageData.facultyList || [],
                faqList: pageData.faqList || [],
                coursesList,
            },
        },
    };
}
