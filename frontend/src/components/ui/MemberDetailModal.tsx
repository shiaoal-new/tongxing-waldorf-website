import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Member } from "../../types/content";
import MediaRenderer from "./MediaRenderer";

interface MemberDetailModalProps {
    selectedMember: Member | null;
    onClose: () => void;
}

export default function MemberDetailModal({ selectedMember, onClose }: MemberDetailModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setIsClosing(false);
        setIsExpanded(false);

        if (selectedMember) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedMember]);

    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsClosing(true);
        // Wait for text fade out (200ms) before triggering actual close
        setTimeout(() => {
            onClose();
        }, 200);
    };

    if (!selectedMember) return null;
    if (typeof document === "undefined") return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 touch-none pointer-events-auto"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card - Immersive Style */}
            <div
                className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-[2rem] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Section - Fills the whole card */}
                <motion.div
                    layoutId={`member-image-${selectedMember.title}`}
                    layout
                    className="absolute inset-0 z-0 bg-neutral-900 shadow-2xl rounded-[2rem] overflow-hidden"
                    onLayoutAnimationComplete={() => setIsExpanded(true)}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 1
                    }}
                >
                    {selectedMember.media ? (
                        <MediaRenderer
                            media={selectedMember.media as any}
                            className="w-full h-full"
                            imgClassName="object-cover w-full h-full"
                            priority={true}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-accent/5">
                            <span className="text-brand-accent/20 text-9xl font-bold select-none">
                                {selectedMember.title?.[0]}
                            </span>
                        </div>
                    )}
                    {/* Gradient Overlay moving inside to animate with the container */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
                </motion.div>

                {/* Close Button - Floating with fade in only after expansion */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExpanded && !isClosing ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleClose}
                    className="absolute top-5 right-5 z-50 p-2 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>

                {/* Scrollable Content Container */}
                <div className="relative z-20 w-full h-full overflow-y-auto custom-scrollbar rounded-[2rem]">
                    <div className="min-h-full flex flex-col">
                        {/* Spacer to push content down - allows seeing the face/image initially */}
                        <div className="flex-grow min-h-[50%]" />

                        {/* Content Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: isExpanded && !isClosing ? 1 : 0,
                                y: isExpanded && !isClosing ? 0 : 20
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-8 md:p-10 space-y-8 text-white/90"
                        >
                            {/* Header */}
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-black drop-shadow-lg">
                                    {selectedMember.title}
                                </h2>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xl font-medium text-white/80">
                                        {selectedMember.subtitle}
                                    </span>
                                    <div className="h-1.5 w-16 bg-brand-accent rounded-full mt-3 shadow-lg"></div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-10">
                                {/* Education */}
                                {selectedMember.education && (
                                    <div>
                                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                                            學歷背景與資格
                                        </h5>
                                        <div className="pl-4 border-l-2 border-dashed border-white/20 space-y-2">
                                            {selectedMember.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="text-white/80 leading-relaxed font-light">
                                                    {line.replace(/^[-\*\+]\s*/, '')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {selectedMember.experience && (
                                    <div>
                                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                                            專業經歷
                                        </h5>
                                        <div className="pl-4 border-l-2 border-dashed border-white/20 space-y-2">
                                            {selectedMember.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                <div key={idx} className="text-white/80 leading-relaxed font-light">
                                                    {line.replace(/^[-\*\+]\s*/, '')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quote/Content */}
                                {selectedMember.content && (
                                    <div className="pt-8 border-t border-white/10">
                                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                                            教育理念 / 心語
                                        </h5>
                                        <blockquote className="italic font-serif text-2xl text-white leading-loose opacity-90">
                                            "{selectedMember.content}"
                                        </blockquote>
                                    </div>
                                )}
                            </div>

                            {/* Bottom padding for scroll */}
                            <div className="h-10" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
