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
}

/**
 * TestimonialItem
 * 渲染單則見證與推薦，具有精緻的排版與視覺回饋
 */
export default function TestimonialItem({ quote, author, title, media, avatar }: TestimonialItemProps) {
    return (
        <div className="group relative flex flex-col items-center text-center bg-white dark:bg-neutral-800 rounded-3xl p-6 pt-16 md:p-10 md:pt-20 shadow-xl hover:shadow-2xl transition-all duration-500 border border-neutral-100 dark:border-neutral-700 my-12 h-full">

            {/* Overlapping Avatar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-700 shadow-lg ring-4 ring-brand-accent/10 group-hover:ring-brand-accent/30 transition-all duration-500 z-20">
                {avatar ? (
                    <img src={avatar} alt={author} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                        <Icon icon="lucide:user" className="w-12 h-12" />
                    </div>
                )}
            </div>

            {/* Top Quote Mark */}
            <div className="absolute top-8 left-8 text-cyan-400/30">
                <Icon icon="fa6-solid:quote-left" className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            {/* Content Area */}
            <div className="flex flex-col items-center flex-grow">
                <h3 className="text-2xl md:text-3xl font-bold text-brand-text dark:text-neutral-100 mb-2 group-hover:text-brand-accent transition-colors duration-300">
                    {author}
                </h3>
                {title && (
                    <p className="text-sm md:text-base text-brand-taupe dark:text-neutral-400 font-medium mb-6 tracking-wide uppercase">
                        {title}
                    </p>
                )}

                <blockquote className="relative">
                    <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        {quote}
                    </p>
                </blockquote>
            </div>

            {/* Bottom Quote Mark */}
            <div className="absolute bottom-8 right-8 text-cyan-400/30">
                <Icon icon="fa6-solid:quote-right" className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            {/* Subtle highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
        </div>
    );
}
