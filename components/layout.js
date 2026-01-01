import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";
import PopupWidget from "./popupWidget";
import ParallaxBackground from "./parallaxBackground";
import SvgFilters from "./svgFilters";
import PageContent from "./pageContent";


export default function Layout({ children, title, description, navbarPadding = false, pages, navigation, className, backgroundSrc, backgroundSpeed = 0.2 }) {
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
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar pages={pages} navigation={navigation} isHeroPage={!navbarPadding} />

            {backgroundSrc && (
                <ParallaxBackground src={backgroundSrc} speed={backgroundSpeed} />
            )}

            {/* 
         Main content wrapper with parallax settings:
         - bg-brand-bg/dark:bg-trueGray-900: Ensures opacity to cover the fixed footer.
         - relative: Establishes stacking context.
         - shadow-[...]: Casts a drop shadow onto the footer to enhance depth.
         - Navbar padding logic to handle sticky/fixed navbar overlapping content.
      */}
            <PageContent
                navbarPadding={navbarPadding}
                backgroundSrc={backgroundSrc}
                className={className}
            >
                {children}
            </PageContent>

            <Footer />
            {/* <PopupWidget /> */}


        </>
    );
}
