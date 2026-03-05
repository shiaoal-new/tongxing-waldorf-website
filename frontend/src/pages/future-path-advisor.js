import Head from "next/head";
import { getNavigation, getSiteSettings } from "../lib/settings";
import { getAllPages, getPageBySlug } from "../lib/pages";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import DynamicPageContent from "../components/DynamicPage";
import { getWordingDictionary, resolveWording } from "../lib/wording.server";
import { getQuestionnaireBySlug } from "../lib/questionnaire";

export default function FuturePathAdvisor(props) {
    // Extract hero poster images for preloading
    const heroPoster = props.page?.hero?.media_list?.[0]?.poster;
    const heroMobilePoster = props.page?.hero?.media_list?.[0]?.mobilePoster;

    return (
        <>
            <Head>
                {heroPoster && (
                    <link
                        rel="preload"
                        as="image"
                        href={heroPoster}
                        media="(min-width: 769px)"
                        // @ts-ignore
                        fetchpriority="high"
                    />
                )}
                {heroMobilePoster && (
                    <link
                        rel="preload"
                        as="image"
                        href={heroMobilePoster}
                        media="(max-width: 768px)"
                        // @ts-ignore
                        fetchpriority="high"
                    />
                )}
            </Head>
            <DynamicPageContent {...props} page={props.page} data={props.data} contentType="page" />
        </>
    );
}

export async function getStaticProps() {
    const page = getPageBySlug("future-path-advisor");
    const questionnaire = getQuestionnaireBySlug("future-path-advisor");
    const pages = getAllPages();
    const navigation = getNavigation();
    const siteSettings = getSiteSettings();

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
    const resolvedPages = pages.map(p => {
        const dict = getWordingDictionary(p.slug, "default");
        return {
            slug: p.slug,
            title: resolveWording(p.title, dict)
        };
    });

    // Always resolve default wordings at build time for all environments.
    const dictionary = getWordingDictionary("future-path-advisor", "default");
    const resolvedPage = page ? resolveWording(page, dictionary) : null;
    const resolvedData = resolveWording({ questionnaire }, dictionary);

    return {
        props: {
            page: resolvedPage || page || null,
            pages: resolvedPages,
            navigation,
            siteSettings,
            data: resolvedData,
        },
    };
}
