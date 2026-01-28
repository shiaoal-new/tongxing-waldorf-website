import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Member } from "../../types/content";
import MediaRenderer from "./MediaRenderer";

interface MemberDetailModalProps {
    selectedMember: Member | null;
    onClose: () => void;
}

export default function MemberDetailModal({ selectedMember, onClose }: MemberDetailModalProps) {
    useEffect(() => {
        // if (selectedMember) {
        //     document.body.style.overflow = "hidden";
        // } else {
        //     document.body.style.overflow = "";
        // }
        // return () => {
        //     document.body.style.overflow = "";
        // };
    }, [selectedMember]);

    if (!selectedMember) return null;
    if (typeof document === "undefined") return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 touch-none"
            onClick={onClose}
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Image Container - Expanded */}
            <div
                className="relative w-full max-w-[400px] aspect-[3/4]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* We use layoutId to animate from the list */}
                <motion.div
                    layoutId={`member-image-${selectedMember.title}`}
                    layout
                    className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800"
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        layout: { duration: 0.5 }
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
                        <div className="w-full h-full flex items-center justify-center bg-brand-accent/5 dark:bg-white/5">
                            <span className="text-brand-accent/20 text-7xl font-bold select-none">
                                {selectedMember.title?.[0]}
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
