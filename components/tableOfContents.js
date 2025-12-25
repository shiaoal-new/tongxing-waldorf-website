
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TableOfContents = ({ sections }) => {
    const [activeId, setActiveId] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Filter out sections without IDs or Titles
    const validSections = sections.filter(s => s.id && s.title);

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

    if (validSections.length === 0) return null;

    return (
        <>
            {/* Desktop View - "Notion-like" Right Side Lines */}
            <div
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
            </div>

            {/* Mobile View - Floating Action Button & Modal */}
            <div className="lg:hidden">
                {/* FAB */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={`
            fixed right-4 bottom-8 z-40 p-3 rounded-full shadow-lg transition-transform duration-300
            bg-brand-bg dark:bg-brand-structural border border-gray-200 dark:border-gray-700
            ${isMobileMenuOpen ? 'scale-0' : 'scale-100'}
          `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-text dark:text-brand-taupe" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
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
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {validSections.map((section) => {
                                        const isActive = activeId === section.id;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`
                          w-full flex items-center p-3 rounded-xl transition-colors text-left
                          ${isActive
                                                        ? 'bg-brand-accent/10 text-brand-accent font-bold'
                                                        : 'text-brand-text dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                                    }
                        `}
                                            >
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mr-3" />}
                                                <span className={isActive ? '' : 'pl-4'}>{section.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default TableOfContents;
