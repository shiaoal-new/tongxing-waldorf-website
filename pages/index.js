import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getAllBenefits } from "../lib/benefits";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import DynamicPageContent from "../components/dynamicPage";

export default function Home(props) {
  return <DynamicPageContent {...props} />;
}

export async function getStaticProps() {
  const page = getPageBySlug("index");
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
