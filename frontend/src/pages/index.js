import Head from "next/head";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { loadAllData } from "../lib/dataLoader";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation, getSiteSettings } from "../lib/settings";
import DynamicPageContent from "../components/DynamicPage";
import { getWordingDictionary, getWordingDictionaryFromData, resolveWording } from "../lib/wording.server";

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
  // NOTE: FAQ 和 Faculty 數據現在通過 API 懶加載，不再包含在初始頁面數據中
  // 這將初始頁面數據從 ~249kB 減少到 ~128kB

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

  // Navbar 只需要 slug + title，剔除完整的 sections/blocks 結構避免傳送大量多餘資料
  const resolvedPages = pages.map(p => {
    const dict = getWordingDictionary(p.slug, "default");
    return {
      slug: p.slug,
      title: resolveWording(p.title, dict)
    };
  });

  // Wording resolution
  const dictionary = getWordingDictionaryFromData(page, "index", "default", ["faq", "testimonials"]);
  const resolvedPage = page ? resolveWording(page, dictionary) : null;

  // 為了 SEO 結構化數據，我們僅傳遞該頁面「實際用到」的 FAQ 項目
  // 這不會顯著增加資料大小 (首頁約僅數 kB)，且能讓搜尋引擎正確識別 FAQPage 並顯示在搜尋結果
  const pageFaqIds = new Set();
  (page?.sections || []).forEach(section => {
    (section.blocks || []).forEach(block => {
      if (block.type === 'list_block' && block.item_type === 'faq_item' && block.faq_ids) {
        block.faq_ids.forEach(id => pageFaqIds.add(id));
      }
    });
  });

  const allFaq = loadAllData("faq", { excludeWording: true });
  const filteredFaqList = (allFaq || []).filter(f => pageFaqIds.has(f.id));

  // Resolved Data 僅包含此頁面必要的 FAQ 內容 (用於 SEO)
  const resolvedData = { faqList: filteredFaqList, facultyList: [] };

  return {
    props: {
      page: resolvedPage || null,
      pages: resolvedPages,
      navigation,
      siteSettings,
      data: resolvedData,
      rawPage: page || null,
      // 不再傳遞 rawData 中的 FAQ 和 Faculty 列表
      rawData: { faqList: [], facultyList: [] },
    },
  };
}
