import React from "react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { motion, AnimatePresence } from "framer-motion";

export default function Disclosure({ title, subtitle, children, isOpen, onToggle, className = "", index }) {
    // Format index to 01, 02, etc.
    const displayIndex = index !== undefined ? (index + 1).toString().padStart(2, '0') : null;

    return (
        <div className={`mb-6 transition-all duration-300 ${className}`}>
            <button
                onClick={onToggle}
                className={`
                    group relative flex items-center justify-between w-full px-6 py-5 text-lg text-left 
                    rounded-2xl md:rounded-3xl transition-all duration-500 ease-out
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-opacity-50
                    ${isOpen
                        ? 'bg-white dark:bg-black/40 shadow-xl ring-1 ring-brand-accent/20'
                        : 'bg-white/40 dark:bg-white/5 shadow-sm border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10'
                    }
                `}
            >
                {/* Decorative inner glow for open state */}
                {isOpen && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none rounded-2xl md:rounded-3xl" />
                )}

                <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                    {displayIndex && (
                        <span className={`
                            text-sm font-bold font-mono tracking-tighter transition-colors duration-300 flex-shrink-0
                            ${isOpen ? 'text-brand-accent' : 'text-brand-taupe/40'}
                        `}>
                            {displayIndex}
                        </span>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className={`font-bold transition-all duration-300 ${isOpen ? 'text-brand-text dark:text-brand-bg translate-x-1' : 'text-brand-text dark:text-brand-bg'}`}>
                                {title}
                            </span>
                            {subtitle && (
                                <span className={`text-sm font-medium transition-all duration-300 ${isOpen ? 'text-brand-accent' : 'text-brand-taupe/60'}`}>
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`
                    flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-500
                    ${isOpen ? 'bg-brand-accent text-white rotate-180 scale-110' : 'bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent/20'}
                `}>
                    <ChevronUpIcon className="w-5 h-5" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pt-6 pb-8 text-brand-text/80 dark:text-brand-bg/80 leading-relaxed text-base md:text-lg">
                            <div className="relative pl-6 md:pl-8 border-l-2 border-brand-accent/20 bg-gradient-to-r from-brand-accent/[0.02] to-transparent py-2">
                                {children}

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggle();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-accent transition-all duration-300 rounded-full hover:bg-brand-accent/10 hover:shadow-sm"
                                        aria-label="收合內容"
                                    >
                                        <span>收合內容</span>
                                        <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
