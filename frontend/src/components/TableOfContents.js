
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DevComment from './DevComment';


const TableOfContents = ({ sections }) => {
    const [activeId, setActiveId] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showTOC, setShowTOC] = useState(false);

    // Filter out sections without IDs or Titles (use useMemo to prevent unnecessary recalculations)
    const validSections = useMemo(() => {
        return sections.filter(s => s.id && s.title);
    }, [sections]);

    // Show TOC button after scrolling past hero section (viewport height)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight - 100) {
                setShowTOC(true);
            } else {
                setShowTOC(false);
            }
        };

        // Initialize state
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Reset active ID and close mobile menu when sections change (page navigation)
    useEffect(() => {
        setActiveId('');
        setIsMobileMenuOpen(false);
    }, [sections]);

    useEffect(() => {
        if (validSections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-40% 0px -60% 0px', // Trigger when section is near the middle/top
                threshold: 0
            }
        );

        // Use a small delay to ensure DOM is ready after page transition
        const timeoutId = setTimeout(() => {
            validSections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                    observer.observe(element);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect(); // Disconnect observer completely for better cleanup
        };
    }, [validSections]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            // Need a slight offset for fixed headers if any, currently simple scroll
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsMobileMenuOpen(false);
        }
    };

    if (validSections.length === 0) {
        return null;
    }

    return (
        <>
            {/* Desktop View - "Notion-like" Right Side Lines */}
            <DevComment text="Desktop Table of Contents" />

            <AnimatePresence>
                {showTOC && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-1.5 p-4 rounded-xl transition-all duration-300"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Background for better readability when expanded */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-xl rounded-xl -z-10 border border-gray-200 dark:border-zinc-800"
                                />
                            )}
                        </AnimatePresence>

                        {validSections.map((section) => {
                            const isActive = activeId === section.id;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="group relative flex items-center justify-end w-full py-1"
                                >
                                    {/* Text Label - Visible on Container Hover */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className={`mr-4 text-xs font-medium text-right transition-colors duration-200 ${isActive
                                                    ? 'text-brand-accent'
                                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                                                    }`}
                                            >
                                                {section.title}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* The "Line" Indicator */}
                                    <div
                                        className={`
                  h-[2px] rounded-full transition-all duration-300
                  ${isActive
                                                ? 'w-6 bg-brand-accent shadow-[0_0_8px_rgba(var(--color-brand-accent),0.5)]'
                                                : 'w-4 bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500'
                                            }
                `}
                                    />
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile View - Floating Action Button & Modal */}
            <DevComment text="Mobile Table of Contents - UI/UX Pro Max Enhanced" />

            <AnimatePresence>
                {showTOC && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        className="lg:hidden fixed right-4 bottom-6 z-40"
                    >
                        {/* FAB - Table of Contents Button - Enhanced with Glassmorphism */}
                        <motion.button
                            onClick={() => setIsMobileMenuOpen(true)}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative overflow-hidden z-[45] shadow-2xl transition-all duration-300 
                                flex flex-col items-center justify-center gap-2 p-2 h-auto rounded-full
                                backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70
                                dark:from-zinc-800/90 dark:to-zinc-900/70
                                border border-white/20 dark:border-zinc-700/30
                                hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                                active:shadow-[0_4px_15px_rgb(0,0,0,0.08)]
                                ${isMobileMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                                w-11
                            `}
                            aria-label="打開目錄"
                            aria-expanded={isMobileMenuOpen}
                            role="button"
                        >
                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center gap-2">
                                {/* Menu Icon - Standalone */}
                                <div className="p-1 rounded-full bg-brand-accent/5 dark:bg-white/5">
                                    <svg
                                        className="w-4 h-4 text-brand-accent dark:text-brand-taupe"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </div>

                                {/* Clean Vertical Indicators - Compact */}
                                <div className="flex flex-col items-center gap-1">
                                    {validSections.slice(0, 4).map((section) => {
                                        const isActive = activeId === section.id;
                                        return (
                                            <motion.div
                                                key={section.id}
                                                layout
                                                animate={{
                                                    height: isActive ? 14 : 4,
                                                    width: isActive ? 4 : 4,
                                                }}
                                                className={`
                                                    rounded-full transition-colors duration-300
                                                    ${isActive
                                                        ? 'bg-brand-accent shadow-[0_0_8px_rgba(var(--color-brand-accent),0.6)]'
                                                        : 'bg-brand-text/20 dark:bg-brand-taupe/20'
                                                    }
                                                `}
                                            />
                                        );
                                    })}
                                    {validSections.length > 4 && (
                                        <span className="text-[9px] text-brand-text/40 dark:text-brand-taupe/40 font-bold mt-0.5 leading-none">
                                            +{validSections.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>

                        {/* Mobile Menu Overlay - Enhanced */}
                        <AnimatePresence>
                            {isMobileMenuOpen && (
                                <>
                                    {/* Backdrop - Enhanced with Better Blur */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-md"
                                        aria-hidden="true"
                                    />

                                    {/* Menu Content - Premium Design */}
                                    <motion.div
                                        initial={{ y: '100%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: '100%', opacity: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                        className="fixed bottom-0 left-0 right-0 z-50 
                                            bg-gradient-to-b from-brand-bg to-brand-bg/95 
                                            dark:from-zinc-900 dark:to-zinc-950
                                            rounded-t-[2rem] shadow-2xl 
                                            max-h-[75vh] overflow-hidden
                                            border-t-2 border-brand-accent/10"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="toc-title"
                                    >
                                        {/* Drag Handle Indicator */}
                                        <div className="flex justify-center pt-3 pb-2">
                                            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        </div>

                                        {/* Header - Enhanced */}
                                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/50 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-brand-accent"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 id="toc-title" className="text-xl font-bold text-brand-text dark:text-brand-bg">
                                                        目錄
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {validSections.length} 個章節
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center
                                                    bg-gray-100 dark:bg-zinc-800 
                                                    hover:bg-gray-200 dark:hover:bg-zinc-700
                                                    transition-colors duration-200
                                                    text-gray-600 dark:text-gray-400"
                                                aria-label="關閉目錄"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </motion.button>
                                        </div>

                                        {/* Scrollable Content Area */}
                                        <div className="overflow-y-auto px-4 py-4 max-h-[calc(75vh-120px)]">
                                            <ul className="space-y-1" role="list">
                                                {validSections.map((section, index) => {
                                                    const isActive = activeId === section.id;
                                                    return (
                                                        <motion.li
                                                            key={section.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                        >
                                                            <motion.a
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    scrollToSection(section.id);
                                                                }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`
                                                                    group relative flex items-center gap-3 px-4 py-4 rounded-2xl
                                                                    transition-all duration-200 cursor-pointer
                                                                    min-h-[56px]
                                                                    ${isActive
                                                                        ? 'bg-gradient-to-r from-brand-accent/15 to-brand-accent/5 shadow-sm'
                                                                        : 'hover:bg-gray-100/50 dark:hover:bg-zinc-800/50'
                                                                    }
                                                                `}
                                                                role="button"
                                                                aria-current={isActive ? 'true' : 'false'}
                                                            >
                                                                {/* Active Indicator */}
                                                                <div className={`
                                                                    w-1 h-8 rounded-full transition-all duration-300
                                                                    ${isActive
                                                                        ? 'bg-brand-accent shadow-[0_0_10px_rgba(var(--color-brand-accent),0.5)]'
                                                                        : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-zinc-600'
                                                                    }
                                                                `} />

                                                                {/* Text Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <span className={`
                                                                        block text-base leading-relaxed transition-colors duration-200
                                                                        ${isActive
                                                                            ? 'text-brand-accent font-bold'
                                                                            : 'text-brand-text dark:text-gray-300 group-hover:text-brand-text dark:group-hover:text-white font-medium'
                                                                        }
                                                                    `}>
                                                                        {section.title}
                                                                    </span>
                                                                </div>

                                                                {/* Chevron Icon */}
                                                                <svg
                                                                    className={`
                                                                        w-5 h-5 transition-all duration-200
                                                                        ${isActive
                                                                            ? 'text-brand-accent opacity-100'
                                                                            : 'text-gray-400 opacity-0 group-hover:opacity-100'
                                                                        }
                                                                    `}
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={2.5}
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </motion.a>
                                                        </motion.li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TableOfContents;
