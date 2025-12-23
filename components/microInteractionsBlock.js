import React from "react";
import { motion } from "framer-motion";

const OrganicFadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
        {children}
    </motion.div>
);

const HoverFlowButton = () => (
    <button className="px-8 py-4 text-white bg-brand-accent rounded-lg micro-hover-flow hover:bg-brand-accent/80">
        Hover Flow Button
    </button>
);

const HoverFlowLink = () => (
    <a href="#" className="text-xl font-bold text-brand-text dark:text-brand-bg micro-hover-link">
        Hover Flow Link
    </a>
);

const ClickFeedbackButton = () => (
    <button className="px-8 py-4 text-white bg-brand-structural rounded-lg micro-click-press hover:shadow-lg">
        Click Me (Scale 0.98)
    </button>
);

export default function MicroInteractionsBlock({ data }) {
    const items = data.items || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-32">
            {items.map((item, index) => {
                return (
                    <div key={index}>
                        <div className="mb-10 text-center md:text-left border-b border-brand-taupe/20 pb-4">
                            <h2 className="text-2xl font-bold text-brand-text dark:text-brand-bg mb-2">{item.title}</h2>
                            <p className="text-brand-taupe dark:text-brand-taupe">
                                {item.description}
                            </p>
                        </div>

                        {item.type === "organic_fade_in" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <OrganicFadeIn key={i} delay={i * 0.2}>
                                        <div className="p-10 bg-white dark:bg-brand-structural border border-brand-taupe/10 rounded-2xl shadow-sm h-64 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-300">
                                            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4 text-brand-accent">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                            </div>
                                            <h3 className="font-bold text-brand-text dark:text-brand-bg text-lg">Card Element {i}</h3>
                                            <p className="text-sm text-brand-taupe dark:text-brand-taupe mt-2">Observe the subtle entry animation.</p>
                                        </div>
                                    </OrganicFadeIn>
                                ))}
                            </div>
                        )}

                        {item.type === "hover_flow" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center place-items-center md:place-items-start">
                                <div className="flex flex-col items-center md:items-start gap-4 p-8 bg-brand-bg/50 dark:bg-brand-structural/50 rounded-xl w-full">
                                    <span className="text-xs uppercase tracking-widest text-brand-taupe font-semibold">Button Transition</span>
                                    <HoverFlowButton />
                                    <p className="text-xs text-brand-taupe mt-2">Background color flows smoothly.</p>
                                </div>
                                <div className="flex flex-col items-center md:items-start gap-4 p-8 bg-brand-bg/50 dark:bg-brand-structural/50 rounded-xl w-full">
                                    <span className="text-xs uppercase tracking-widest text-brand-taupe font-semibold">Link Underline</span>
                                    <HoverFlowLink />
                                    <p className="text-xs text-brand-taupe mt-2">Underline expands with ease-in-out.</p>
                                </div>
                            </div>
                        )}

                        {item.type === "click_feedback" && (
                            <div className="flex flex-col items-center md:items-start gap-4 p-8 bg-brand-bg/50 dark:bg-brand-structural/50 rounded-xl">
                                <span className="text-xs uppercase tracking-widest text-brand-taupe font-semibold">Interactive Button</span>
                                <ClickFeedbackButton />
                                <p className="text-xs text-brand-taupe mt-2">Press and hold to see the effect.</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
