import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getAllBenefits } from "../lib/benefits";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import DynamicPageContent from "../components/dynamicPage";

export default function DynamicPage(props) {
    return <DynamicPageContent {...props} />;
}

export async function getStaticPaths() {
    const pages = getAllPages();
    // Filter out 'index' slug as it's handled by index.js
    const paths = pages
        .filter((page) => page.slug !== "index")
        .map((page) => ({
            params: { slug: page.slug },
        }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const page = getPageBySlug(slug);
    const pages = getAllPages();
    const facultyList = getAllFaculty();
    const faqList = getAllFaq();
    const benefitsList = getAllBenefits();

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
            facultyList,
            faqList,
            benefitsList,
        },
    };
}
