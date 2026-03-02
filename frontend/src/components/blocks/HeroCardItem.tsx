import React from "react";
import MediaRenderer from "../ui/MediaRenderer";
import MarkdownContent from "../ui/MarkdownContent";
import { MediaItem, CTAButton } from "../../types/content";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface HeroCardItemProps {
    title: string;
    subtitle?: string; // Optional subtitle (e.g., "Midsize SUV")
    content?: string;
    media?: MediaItem;
    buttons?: CTAButton[];
    // You can add more props as needed for styling variants
}

export default function HeroCardItem({ title, subtitle, content, media, buttons }: HeroCardItemProps) {
    return (
        <div className="hero-card relative w-full h-[500px] overflow-hidden rounded-3xl group cursor-pointer">
            {/* Background Media */}
            {media && (
                <div className="absolute inset-0 z-0">
                    <MediaRenderer
                        media={media}
                        className="w-full h-full"
                        imgClassName="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            )}

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                {/* Top Section - Subtitle */}
                <div className="flex justify-between items-start">
                    {subtitle && (
                        <span className="text-white/90 text-sm font-medium tracking-wider uppercase backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full border border-white/10">
                            {subtitle}
                        </span>
                    )}
                </div>

                {/* Bottom Section - Title, Content, Buttons */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        <MarkdownContent content={title} isInline />
                    </h3>

                    {content && (
                        <div className="text-white/80 text-sm md:text-base line-clamp-2 max-w-prose">
                            <MarkdownContent content={content} />
                        </div>
                    )}

                    {/* Buttons Area */}
                    <div className="flex flex-row gap-3 mt-auto">
                        {Array.isArray(buttons) && buttons.map((btn, idx) => {
                            const isPrimary = idx === 0;
                            // Ensure button styling works for Link component
                            const btnClasses = `
                                flex-1 py-3 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 inline-block
                                ${isPrimary
                                    ? 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20'
                                    : 'bg-white text-black hover:bg-gray-100'
                                }
                            `;

                            return (
                                <Link
                                    key={idx}
                                    href={btn.link || '#'}
                                    className={btnClasses}
                                >
                                    {btn.text}
                                </Link>
                            )
                        })}

                        {/* If no buttons, show a default "Learn More" style arrow */}
                        {(!Array.isArray(buttons) || buttons.length === 0) && (
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:bg-brand-accent group-hover:border-brand-accent transition-colors duration-300 ml-auto">
                                <Icon icon="ph:arrow-right-bold" className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
