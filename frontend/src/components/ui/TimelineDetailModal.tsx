import React from "react";
import Image from "next/image";
import { TimelineItem } from "../../types/content";
import ImmersiveModal from "./ImmersiveModal";
import MarkdownContent from "./MarkdownContent";

interface TimelineDetailModalProps {
    item: TimelineItem | null;
    onClose: () => void;
}

export default function TimelineDetailModal({ item, onClose }: TimelineDetailModalProps) {
    if (!item) return null;

    // Use a strict consistent layoutId key
    const layoutId = `timeline-image-${String(item.year)}-${item.title}`;

    return (
        <ImmersiveModal
            isOpen={!!item}
            onClose={onClose}
            layoutId={layoutId}
            backgroundContent={
                item.image ? (
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-800" />
                )
            }
        >
            {/* Header */}
            <div>
                <div className="text-brand-accent font-bold text-lg mb-2 tracking-widest">{item.year}</div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-black drop-shadow-lg leading-tight">
                    {item.title}
                </h2>
                {item.subtitle && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-medium text-white/80">
                            {item.subtitle}
                        </span>
                        <div className="h-1.5 w-16 bg-brand-accent rounded-full mt-3 shadow-lg"></div>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="space-y-10">
                <div className="text-white/90 leading-relaxed text-lg pb-10">
                    {item.detail ? (
                        <div className="prose prose-invert prose-lg max-w-none">
                            <MarkdownContent content={item.detail} className="text-white/90" />
                        </div>
                    ) : (
                        <p>{item.content}</p>
                    )}
                </div>
            </div>
        </ImmersiveModal>
    );
}
