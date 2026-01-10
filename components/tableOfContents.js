
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DevComment from './DevComment';


const TableOfContents = ({ sections }) => {
    const [activeId, setActiveId] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showTOC, setShowTOC] = useState(false);

    // Filter out sections without IDs or Titles
    const validSections = sections.filter(s => s.id && s.title);

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

        validSections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            validSections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                    observer.unobserve(element);
                }
            });
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
            <DevComment text="Mobile Table of Contents" />

            <AnimatePresence>
                {showTOC && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden fixed right-8 bottom-8 z-40"
                    >
                        {/* FAB - Table of Contents Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`
            btn btn-secondary fixed right-0 bottom-0 z-[45] shadow-lg transition-all duration-300 
            flex flex-col items-center justify-center gap-2 px-3 py-3 h-auto rounded-2xl backdrop-blur-sm bg-white/10
            ${isMobileMenuOpen ? 'scale-0' : 'scale-100'}
          `}
                            aria-label="打開目錄"
                        >
                            <span className="text-[10px] font-medium text-brand-text dark:text-brand-taupe leading-none">目錄</span>

                            {/* Section Indicator Lines - Mini version of desktop TOC */}
                            <div className="flex flex-col items-center gap-1">
                                {validSections.slice(0, 5).map((section) => {
                                    const isActive = activeId === section.id;
                                    return (
                                        <div
                                            key={section.id}
                                            className={`
                                                h-[2px] rounded-full transition-all duration-300
                                                ${isActive
                                                    ? 'w-4 bg-brand-accent shadow-[0_0_6px_rgba(var(--color-brand-accent),0.6)]'
                                                    : 'w-2 bg-brand-text/30 dark:bg-brand-taupe/30'
                                                }
                                            `}
                                        />
                                    );
                                })}
                                {validSections.length > 5 && (
                                    <div className="text-[8px] text-brand-text/50 dark:text-brand-taupe/50 leading-none">
                                        +{validSections.length - 5}
                                    </div>
                                )}
                            </div>

                        </button>

                        {/* Mobile Menu Overlay */}
                        <AnimatePresence>
                            {isMobileMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                                    />

                                    {/* Menu Content */}
                                    <motion.div
                                        initial={{ y: '100%' }}
                                        animate={{ y: 0 }}
                                        exit={{ y: '100%' }}
                                        className="fixed bottom-0 left-0 right-0 z-50 bg-brand-bg dark:bg-zinc-900 rounded-t-3xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto"
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-brand-text dark:text-brand-bg">目錄</h3>
                                            <button onClick={() => setIsMobileMenuOpen(false)} className="btn btn-ghost btn-circle btn-sm -mr-2 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <ul className="menu bg-transparent rounded-box w-full">
                                            {validSections.map((section) => {
                                                const isActive = activeId === section.id;
                                                return (
                                                    <li key={section.id}>
                                                        <a
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                scrollToSection(section.id);
                                                            }}
                                                            className={`
                                                        ${isActive ? 'active bg-brand-accent/10 text-brand-accent font-bold' : 'text-brand-text dark:text-gray-400'}
                                                    `}
                                                        >
                                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                                                            {section.title}
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
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
