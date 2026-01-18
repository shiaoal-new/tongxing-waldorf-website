import Head from "next/head";
import Script from "next/script";
import Navbar from "./Navbar";
import Footer from "./Footer";

import ParallaxBackground from "./ParallaxBackground";
import SvgFilters from "./SvgFilters";
import PageContent from "./PageContent";
import UXTestPanel from "./UXTestPanel";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

//todo give a better name
export default function Layout({ children, title, description, navbarPadding = false, pages, navigation, className, backgroundSpeed = 0.2 }) {
    const { resolvedTheme } = useTheme();
    const [themeColor, setThemeColor] = useState("#F2F2F0");

    useEffect(() => {
        setThemeColor(resolvedTheme === 'dark' ? '#1C1917' : '#F2F2F0');
    }, [resolvedTheme]);

    return (
        <>
            <SvgFilters />
            <Head>
                <title>{title || "台北市同心華德福實驗教育機構"}</title>
                <meta
                    name="description"
                    content={description || "台北市同心華德福實驗教育機構 - 以身心靈全面發展為核心，為孩子提供順應生命節奏的教育環境。"}
                />
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

            <Navbar pages={pages} navigation={navigation} isHeroPage={!navbarPadding} />
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

            <UXTestPanel />

        </>
    );
}
