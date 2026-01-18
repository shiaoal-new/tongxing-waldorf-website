import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import Section from "../components/Section";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPages, getPageBySlug } from "../lib/pages";
import PageHero from "../components/PageHeroWithUXTest";
import SpacingDemoBlock from "../components/SpacingDemoBlock";
import { getSectionLayoutByTitle } from "../lib/sectionLayouts";
import { getNavigation } from "../lib/settings";

export default function LayoutSpacingPage({ page, pages, navigation }) {
    const [isMobileSim, setIsMobileSim] = useState(false);

    if (!page) return <div>Page data not found</div>;

    const heroData = page.hero;
    const sections = page.sections || [];
    const effectiveHeroData = heroData ? { title: page.title, ...heroData } : null;

    return (
        <Layout pages={pages} navigation={navigation} title={page.title || "Layout & Spacing"} navbarPadding={!effectiveHeroData}>
            <Head>
                <title>{page.title || "Layout & Spacing"} | Tung-Hsin Waldorf</title>
            </Head>

            {/* Mobile View Toggle - Sticky Controls */}
            <div className="fixed bottom-8 right-8 z-50 hidden lg:block">
                <button
                    onClick={() => setIsMobileSim(!isMobileSim)}
                    className={`px-6 py-3 rounded-full font-bold shadow-xl transition-all flex items-center space-x-2 ${isMobileSim
                        ? "bg-brand-accent text-white ring-4 ring-brand-accent/30"
                        : "bg-brand-structural text-white hover:bg-brand-structural/90"
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{isMobileSim ? "切換回桌機版" : "模擬手機版佈局"}</span>
                </button>
            </div>

            {effectiveHeroData && <PageHero data={effectiveHeroData} />}

            <div className={`transition-all duration-500 ease-in-out ${isMobileSim ? "max-w-[400px] mx-auto border-x-8 border-gray-800 shadow-2xl overflow-hidden my-10 rounded-[3rem]" : "w-full"}`}>
                <div className="w-full py-10 ">
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
                                    align="left"
                                    className="mb-16"
                                >
                                    <div className="mt-6">
                                        {blocks.map((block, bIndex) => (
                                            <div key={bIndex} className={bIndex > 0 ? "mt-16" : ""}>
                                                {block.type === "text_block" && (
                                                    <div className="max-w-4xl">
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
                                                            <div className="prose prose-brand max-w-none mt-4">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {block.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === "spacing_demo_block" && (
                                                    <SpacingDemoBlock data={block} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isMobileSim && (
                <div className="hidden lg:block fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm transition-opacity" />
            )}
        </Layout>
    );
}

export async function getStaticProps() {
    const page = getPageBySlug("layout-spacing") || null;
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
