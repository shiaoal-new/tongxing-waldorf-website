import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ImmersiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    layoutId?: string;
    backgroundContent: React.ReactNode;
    children: React.ReactNode;
}

export default function ImmersiveModal({
    isOpen,
    onClose,
    layoutId,
    backgroundContent,
    children
}: ImmersiveModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setIsExpanded(false);

            // Prevent body scroll and handle scrollbar width to avoid jumping
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (scrollBarWidth > 0) {
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
        } else {
            // Restore overflow and padding when closing
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [isOpen]);

    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsClosing(true);
        // Wait for animation frame or short timeout to sync animations if needed
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;
    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 touch-none pointer-events-auto"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isClosing ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card - Immersive Style */}
            <div
                className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-[2rem] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Section (Image/Media) - Fills the whole card */}
                {/* If layoutId is provided, we use it for shared element transition */}
                <motion.div
                    layoutId={layoutId}
                    layout // Ensure layout prop is present for shared element transition
                    className="absolute inset-0 z-0 bg-neutral-900 shadow-2xl rounded-[2rem] overflow-hidden"
                    onLayoutAnimationComplete={() => setIsExpanded(true)}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 1
                    }}
                >
                    {backgroundContent}
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
                            {children}

                            {/* Bottom padding for scroll */}
                            <div className="h-10" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
