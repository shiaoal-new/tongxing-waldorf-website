import Head from "next/head";
import Layout from "../components/layout/Layout";
import Container from "../components/ui/Container";
import Section from "../components/layout/Section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPages, getPageBySlug } from "../lib/pages";
import PageHero from "../components/layout/PageHero";
import ColorPaletteBlock from "../components/blocks/ColorPaletteBlock";
import ActionButtons from "../components/ui/ActionButtons";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation } from "../lib/settings";

export default function ColorsDynamicPage({ page, pages, navigation }) {
    if (!page) return <div>Page data not found</div>;

    const heroData = page.hero;
    const sections = page.sections || [];
    const effectiveHeroData = heroData ? { title: page.title, ...heroData } : null;

    return (
        <Layout pages={pages} navigation={navigation} title={page.title || "Colors"} navbarPadding={!effectiveHeroData}>
            <Head>
                <title>{page.title || "Color Palette"} | Tung-Hsin Waldorf</title>
            </Head>

            {effectiveHeroData && <PageHero data={effectiveHeroData} />}

            <div className="w-full py-10">
                {!effectiveHeroData && (
                    <Section title={page.title} align="left" description={page.description} />
                )}

                <div className="mt-10">
                    {sections.map((section, index) => {
                        const layout = section._layout || {};
                        const blocks = section.blocks || [];

                        return (
                            <Section
                                key={index}
                                layout={layout}
                                anchor={section.section_id}
                                align="center"
                                className="mb-16"
                            >
                                <div className="mt-6">
                                    {blocks.map((block, bIndex) => (
                                        <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                                            {block.type === "text_block" && (
                                                <div className="max-w-4xl mx-auto text-center">
                                                    {block.sub_header && (
                                                        <div className="text-sm font-bold tracking-wider text-brand-accent uppercase">
                                                            {block.sub_header}
                                                        </div>
                                                    )}
                                                    {block.header && (
                                                        <h3 className="mt-3 text-2xl font-bold text-brand-text lg:text-3xl">
                                                            {block.header}
                                                        </h3>
                                                    )}
                                                    {block.description && (
                                                        <div className="py-4 text-lg text-brand-taupe">
                                                            {block.description}
                                                        </div>
                                                    )}
                                                    {block.content && (
                                                        <div className="prose prose-lg mx-auto text-left">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {block.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                    <ActionButtons buttons={block.buttons} align="center" className="mt-6" />
                                                </div>
                                            )}

                                            {block.type === "color_palette_block" && (
                                                <ColorPaletteBlock data={block} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}

export async function getStaticProps() {
    const page = getPageBySlug("colors") || null;
    const pages = getAllPages();
    const navigation = getNavigation();

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
            page,
            pages,
            navigation,
        },
    };
}
