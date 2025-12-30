import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TabbedContentBlock = ({ data }) => {
    const tabs = data.tabs || [];
    const [activeTab, setActiveTab] = useState(0);

    if (tabs.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-200 dark:border-neutral-700 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`btn btn-ghost px-6 py-4 text-sm font-bold transition-all border-b-2 rounded-none flex-shrink-0 whitespace-nowrap ${activeTab === index
                            ? "border-brand-accent text-brand-accent scale-105"
                            : "border-transparent text-gray-500 hover:text-brand-accent"
                            }`}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            <div className="bg-brand-bg/50 dark:bg-brand-structural/20 p-8 rounded-3xl border border-brand-accent/10 shadow-sm transition-all duration-300">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {tabs[activeTab]?.content || ""}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default TabbedContentBlock;
