import Head from "next/head";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../lib/settings";
import DynamicPageContent from "../components/DynamicPage";

export default function Home(props) {
  // Extract hero poster images for preloading
  const heroPoster = props.page?.hero?.media_list?.[0]?.poster;
  const heroMobilePoster = props.page?.hero?.media_list?.[0]?.mobilePoster;

  return (
    <>
      <Head>
        {/* Dynamically preload hero poster images for faster LCP */}
        {heroPoster && (
          <link
            rel="preload"
            as="image"
            href={heroPoster}
            media="(min-width: 769px)"
            // @ts-ignore - fetchpriority is a valid attribute
            fetchpriority="high"
          />
        )}
        {heroMobilePoster && (
          <link
            rel="preload"
            as="image"
            href={heroMobilePoster}
            media="(max-width: 768px)"
            // @ts-ignore - fetchpriority is a valid attribute
            fetchpriority="high"
          />
        )}
      </Head>
      <DynamicPageContent {...props} contentType="page" />
    </>
  );
}

export async function getStaticProps() {
  const page = getPageBySlug("index");
  const pages = getAllPages();
  const navigation = getNavigation();
  const siteSettings = getSiteSettings();
  const facultyList = getAllFaculty();
  const faqList = getAllFaq();

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
      siteSettings,
      data: {
        facultyList,
        faqList,
      },
    },
  };
}
