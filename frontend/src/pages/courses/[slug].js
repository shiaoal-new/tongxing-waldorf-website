import { getAllCourses, getCourseBySlug } from "../../lib/courses";
import { getAllPages } from "../../lib/pages";
import { getAllFaculty } from "../../lib/faculty";
import { getAllFaq } from "../../lib/faq";
import { getSectionLayoutByTitle } from "../../lib/sectionLayouts";
import { getNavigation } from "../../lib/settings";
import DynamicPageContent from "../../components/DynamicPage";

export default function CoursePage(props) {
    // We can use the same DynamicPageContent component as it's designed to render sections/blocks
    return <DynamicPageContent {...props} page={props.course} />;
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
    const facultyList = getAllFaculty();
    const faqList = getAllFaq();
    const coursesList = getAllCourses();

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

    return {
        props: {
            course: course || null,
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
