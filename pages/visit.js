import Head from "next/head";
import Navbar from "../components/navbar";
import VisitHero from "../components/visitHero";
import VisitProcess from "../components/visitProcess";
import VisitSchedule from "../components/visitSchedule";
import Footer from "../components/footer";
import PopupWidget from "../components/popupWidget";
import SectionTitle from "../components/sectionTitle";

export default function Visit() {
    return (
        <>
            <Head>
                <title>預約參觀 - 台北市同心華德福實驗教育機構</title>
                <meta
                    name="description"
                    content="預約參觀台北市同心華德福實驗教育機構，親自體驗我們的教育環境與理念。"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            <div className="pt-20 bg-white dark:bg-trueGray-900"> {/* Add padding top to account for fixed navbar */}
                <VisitHero />

                <SectionTitle
                    title="參觀流程"
                    align="center">
                    我們歡迎家長親自來到學校，透過實際的走訪與對話，深入了解同心華德福的教育內涵。
                </SectionTitle>
                <VisitProcess />

                <SectionTitle
                    title="參觀場次"
                    align="center">
                    請選擇適合您的場次進行預約，名額有限，額滿為止。
                </SectionTitle>
                <VisitSchedule />
            </div>

            <Footer />
            <PopupWidget />
        </>
    );
}
