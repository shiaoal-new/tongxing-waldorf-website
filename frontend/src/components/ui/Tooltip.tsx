import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimationFrame, useInView } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const isInView = useInView(triggerRef, { once: false, margin: "0px 0px -50% 0px" });

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords(prev => {
                const newTop = rect.top + window.scrollY;
                const newLeft = rect.left + rect.width / 2 + window.scrollX;
                if (Math.abs(prev.top - newTop) < 0.1 && Math.abs(prev.left - newLeft) < 0.1) return prev;
                return { top: newTop, left: newLeft };
            });
        }
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync position on every frame to handle animations and scroll perfectly, 
    // but only when visible to save performance
    useAnimationFrame(() => {
        if (isMounted && isInView) {
            updatePosition();
        }
    });

    return (
        <>
            <span
                ref={triggerRef}
                className="cursor-help relative z-10 inline-block"
            >
                {children}
            </span>

            {typeof document !== 'undefined' && isMounted && createPortal(
                <AnimatePresence>
                    {isInView && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-80%' }}
                            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-100%' }}
                            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-80%' }}
                            transition={{
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1],
                                opacity: { duration: 0.3 }
                            }}
                            style={{
                                position: 'absolute',
                                top: coords.top - 12,
                                left: coords.left,
                                zIndex: 40,
                                pointerEvents: 'none'
                            }}
                            className="min-w-[120px] max-w-[250px]"
                        >
                            <div className="bg-neutral-800/95 dark:bg-neutral-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-2xl text-sm relative border border-white/10 text-center leading-relaxed">
                                {content}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                                    <div className="border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-neutral-800/95 dark:border-t-neutral-900/95" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default Tooltip;
