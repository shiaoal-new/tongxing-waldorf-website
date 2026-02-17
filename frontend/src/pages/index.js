import Head from "next/head";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../lib/settings";
import DynamicPageContent from "../components/DynamicPage";
import { useWording } from "../hooks/useWording";
import { getWordingDictionary, resolveWording } from "../lib/wording.server";

export default function Home(props) {
  // Wording resolution is now handled inside DynamicPageContent via useWording hook

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
      <DynamicPageContent {...props} page={props.page} data={props.data} contentType="page" />
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

  // Resolve page titles for navigation (pages list)
  // This allows the Navbar to display correct titles instead of placeholders
  const resolvedPages = pages.map(p => {
    const dict = getWordingDictionary(p.slug, "default");
    return {
      ...p,
      title: resolveWording(p.title, dict)
    };
  });

  // Always resolve default wordings at build time for all environments.
  // This eliminates text flash (FOUC) where raw $ids like "$hero.title" briefly appear.
  // Client-side useWording hook will only re-resolve when user actively switches wording style.
  const dictionary = getWordingDictionary("index", "default", ["faq"]);
  const resolvedPage = page ? resolveWording(page, dictionary) : null;
  const resolvedData = resolveWording({ facultyList, faqList }, dictionary);

  return {
    props: {
      page: resolvedPage || null,
      pages: resolvedPages,
      navigation,
      siteSettings,
      data: resolvedData,
    },
  };
}
