import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";
import PopupWidget from "./popupWidget";

export default function Layout({ children, title, description, navbarPadding = false, pages }) {
    return (
        <>
            <Head>
                <title>{title || "台北市同心華德福實驗教育機構"}</title>
                <meta
                    name="description"
                    content={description || "台北市同心華德福實驗教育機構 - 以身心靈全面發展為核心，為孩子提供順應生命節奏的教育環境。"}
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar pages={pages} isHeroPage={!navbarPadding} />

            {/* 
         Main content wrapper with parallax settings:
         - bg-white/dark:bg-trueGray-900: Ensures opacity to cover the fixed footer.
         - relative: Establishes stacking context.
         - shadow-[...]: Casts a drop shadow onto the footer to enhance depth.
         - Navbar padding logic to handle sticky/fixed navbar overlapping content.
      */}
            <div className={`${navbarPadding ? "pt-20" : ""} bg-white dark:bg-trueGray-900 relative z-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`}>
                {children}
            </div>

            <Footer />
            <PopupWidget />
        </>
    );
}
