import React, { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ImmersiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * The layoutId for the shared element transition of the background/image.
     */
    layoutId?: string;
    /**
     * The content to render in the background (usually the image).
     * This element will be wrapped in the layoutID motion div.
     */
    backgroundContent: ReactNode;
    /**
     * The scrollable content overlay.
     */
    children: ReactNode;
    /**
     * Optional callback when the expansion animation completes
     */
    onExpandComplete?: () => void;
}

export default function ImmersiveModal({
    isOpen,
    onClose,
    layoutId,
    backgroundContent,
    children,
    onExpandComplete
}: ImmersiveModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setIsClosing(false);
            setIsExpanded(false);
        } else {
            // Delay clearing overflow until exit animation might currently be handled by AnimatePresence?
            // Actually AnimatePresence handles unmounting, but we need to ensure body scroll is restored.
            // If we use AnimatePresence, the component stays mounted during exit.
            // But here we might just rely on the parent rendering us conditionally?
            // The Modal.tsx pattern uses AnimatePresence internal to the component and takes isOpen prop.
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsClosing(true);
        // Wait for internal animations if needed, but typically we just call onClose and let parent/AnimatePresence handle it.
        // But MemberDetailModal had a specific "text fade out" logic.
        // We can replicate that logic via exit animations on children if we use AnimatePresence.
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
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

                    {/* Modal Card */}
                    <motion.div
                        className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-[2rem] pointer-events-auto shadow-2xl overflow-hidden bg-neutral-900"
                        onClick={(e) => e.stopPropagation()}
                        layoutId={layoutId} // If layoutId is provided, the whole container animates?
                    // Actually in MemberDetailModal, the inner image div had the layoutId.
                    // But if we want the "container" to grow, we might put it here.
                    // However, MemberDetailModal put it on the BACKGROUND div (line 61).
                    // Let's stick to the MemberDetailModal structure: Container is static-ish (flex layout), Background div expands.
                    // Wait, MemberDetailModal's `layoutId` was on the `absolute inset-0` background div.
                    // So the container itself (the div with max-w-2xl) just appears?
                    // No, `MemberDetailModal` did NOT have AnimatePresence around the container div itself from the parent?
                    // Let's re-read MemberDetailModal carefully.
                    >
                        {/* 
                           Replicating MemberDetailModal Structure:
                           The container is a standard div.
                           Inside:
                           1. Background Motion Div (Image) - This has the layoutId.
                           2. Close Button
                           3. Content Scroll Container
                        */}

                        {/* Background Layer */}
                        <motion.div
                            layoutId={layoutId}
                            layout={!!layoutId}
                            className="absolute inset-0 z-0 bg-neutral-900 overflow-hidden"
                            onLayoutAnimationComplete={() => {
                                setIsExpanded(true);
                                onExpandComplete?.();
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200, // Slightly faster than original 100 for snappiness
                                damping: 25,
                                mass: 1
                            }}
                            // Fallback if no layoutId (standard fade/scale)
                            initial={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
                            animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
                            exit={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
                        >
                            {backgroundContent}
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            // Note: MemberDetailModal waited for expansion. We can approximate or make it just fade in.
                            // We'll keep it simple: fade in.
                            transition={{ duration: 0.3, delay: 0.2 }}
                            onClick={handleClose}
                            className="absolute top-5 right-5 z-50 p-2 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>

                        {/* Content Container */}
                        <div className="relative z-20 w-full h-full overflow-y-auto custom-scrollbar rounded-[2rem]">
                            <div className="min-h-full flex flex-col">
                                {/* Spacer to push content down */}
                                <div className="flex-grow min-h-[50%]" />

                                {/* Inner Content with simple entry animation */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="p-8 md:p-10 text-white/90"
                                >
                                    {children}
                                    {/* Bottom padding */}
                                    <div className="h-10" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
