import Link from "next/link";
import VisitHero from "../components/visitHero";
import VisitProcess from "../components/visitProcess";
import VisitSchedule from "../components/visitSchedule";
import Section from "../components/section";
import Layout from "../components/layout";
import { getAllPages } from "../lib/pages";
import { getNavigation } from "../lib/settings";

export default function Visit({ pages, navigation }) {
    return (
        <Layout
            title="預約參觀 - 台北市同心華德福實驗教育機構"
            description="預約參觀台北市同心華德福實驗教育機構，親自體驗我們的教育環境與理念。"
            navbarPadding={true}
            pages={pages}
            navigation={navigation}
        >
            <VisitHero />

            <Section
                title="參觀流程"
                align="center"
                description="我們歡迎家長親自來到學校，透過實際的走访與對話，深入了解同心華德福的教育內涵。">
                <VisitProcess />
            </Section>

            <Section
                title="參觀場次"
                align="center"
                description="請選擇適合您的場次進行預約，名額有限，額滿為止。">
                <VisitSchedule />
            </Section>
        </Layout>
    );
}

export async function getStaticProps() {
    const pages = getAllPages();
    const navigation = getNavigation();
    return {
        props: {
            pages,
            navigation,
        },
    };
}
