import React from "react";
import { Icon } from "@iconify/react";
import MediaRenderer from "../ui/MediaRenderer";
import { MediaItem } from "../../types/content";

interface TestimonialItemProps {
    quote: string;
    author: string;
    title?: string;
    media?: MediaItem;
    avatar?: string;
    tags?: string[];
    pagination?: { current: number; total: number };
}

/**
 * TestimonialItem
 * 渲染單則見證與推薦，具有精緻的排版與視覺回饋
 */
export default function TestimonialItem({ quote, author, title, media, avatar, tags, pagination }: TestimonialItemProps) {
    return (
        <div className="group relative flex flex-col items-center text-center bg-white dark:bg-neutral-800 rounded-3xl p-6 pt-16 md:p-8 md:pt-16 shadow-xl hover:shadow-2xl transition-all duration-500 border border-neutral-100 dark:border-neutral-700 mb-6 h-full">
            {/* Top Quote Mark - Large & Subtle */}
            <div className="absolute top-4 left-4 text-brand-accent/5 group-hover:text-brand-accent/10 transition-colors">
                <Icon icon="fa6-solid:quote-left" className="w-24 h-24" />
            </div>

            {/* Overlapping Avatar Area */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white dark:border-neutral-700 shadow-lg ring-4 ring-brand-accent/10 group-hover:ring-brand-accent/30 transition-all duration-500 overflow-hidden bg-brand-accent/5">
                    {avatar ? (
                        <img src={avatar} alt={author} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-accent">
                            <Icon icon="lucide:user" className="w-10 h-10" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col items-center flex-grow pt-4 relative z-10 w-full">
                {/* Review Stars/Badge - "Wall of Love" hallmark */}
                <div className="flex gap-1 mb-4 text-brand-accent/80">
                    {[...Array(5)].map((_, i) => (
                        <Icon key={i} icon="material-symbols:star" className="w-4 h-4" />
                    ))}
                </div>

                <blockquote className="relative mb-6">
                    <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium italic">
                        {quote}
                    </p>
                </blockquote>

                {/* Tags Section */}
                {Array.isArray(tags) && tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-brand-accent/5 text-brand-accent rounded-full border border-brand-accent/10"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-700 w-full">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-0.5">
                        {author}
                    </h3>
                    {title && (
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-brand">
                            {title}
                        </p>
                    )}
                </div>
            </div>

            {/* Subtle background flair */}
            <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
