import { getAllCourses, getCourseBySlug } from "../../lib/courses";
import { getAllPages } from "../../lib/pages";
import { getSectionLayoutByTitle } from "../../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../../lib/settings";
import { getPageDataOptimized } from "../../lib/dataLoader";
import DynamicPageContent from "../../components/DynamicPage";

export default function CoursePage(props) {
    // We can use the same DynamicPageContent component as it's designed to render sections/blocks
    return <DynamicPageContent {...props} page={props.course} contentType="course" />;
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

    // 按需加载数据 - 只加载课程页面实际需要的数据
    const pageData = getPageDataOptimized(course);

    return {
        props: {
            course: course || null,
            pages,
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
