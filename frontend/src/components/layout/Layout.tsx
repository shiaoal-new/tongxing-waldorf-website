import Head from "next/head";
import Script from "next/script";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SvgFilters from "../ui/SvgFilters";
import PageContent from "./PageContent";
import { useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";
import { PageData, NavigationData, SEOData, HeroData } from "../../types/content";
import { useScrollRestoration } from "../../hooks/useScrollRestoration";

interface LayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    seo?: SEOData;
    hero?: HeroData;
    navbarPadding?: boolean;
    pages: PageData[];
    navigation: NavigationData;
    className?: string;
    backgroundSpeed?: number;
}

export default function Layout({
    children,
    title,
    description,
    seo,
    hero,
    navbarPadding = false,
    pages,
    navigation,
    className,
    backgroundSpeed = 0.2
}: LayoutProps) {
    const { resolvedTheme } = useTheme();
    const [themeColor, setThemeColor] = useState("#F2F2F0");

    useScrollRestoration();

    useEffect(() => {
        setThemeColor(resolvedTheme === 'dark' ? '#1C1917' : '#F2F2F0');
    }, [resolvedTheme]);

    // --- Smart SEO Logic ---
    const SITE_NAME = "台北市同心華德福實驗教育機構";

    // 1. Title Priority: Custom Props > SEO Data > Hero Title > Current Page Title > Site Name
    const pageTitle = seo?.title || (hero?.title ? `${hero.title} | ${SITE_NAME}` : title ? `${title} | ${SITE_NAME}` : SITE_NAME);
    const displayTitle = title === pageTitle ? title : pageTitle; // Avoid double SITE_NAME if Passed title already contains it

    // 2. Description Priority: Custom Props > SEO Data > Hero Subtitle > Hero Content (Truncated) > Default
    const fallbackDesc = hero?.subtitle || (hero?.content ? `${hero.content.substring(0, 155)}...` : "台北市同心華德福實驗教育機構 - 以身心靈全面發展為核心，為孩子提供順應生命節奏的教育環境。");
    const displayDescription = description || seo?.description || fallbackDesc;

    return (
        <>
            <SvgFilters />
            <Head>
                <title>{displayTitle}</title>
                <meta
                    name="description"
                    content={displayDescription}
                />
                {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="theme-color" content={themeColor} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Script
                id="clarity-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(c,l,a,r,i,t,y){
                            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                        })(window, document, "clarity", "script", "uzkx6y1ial");
                    `,
                }}
            />

            <Navbar pages={pages as any} navigation={navigation as any} isHeroPage={!navbarPadding} />
            {/* 
         Main content wrapper with parallax settings:
         - bg-brand-bg/dark:bg-trueGray-900: Ensures opacity to cover the fixed footer.
         - relative: Establishes stacking context.
         - shadow-[...]: Casts a drop shadow onto the footer to enhance depth.
         - Navbar padding logic to handle sticky/fixed navbar overlapping content.
      */}
            <PageContent
                navbarPadding={navbarPadding}
                className={className}
            >
                {children}
            </PageContent>

            <Footer />
        </>
    );
}
