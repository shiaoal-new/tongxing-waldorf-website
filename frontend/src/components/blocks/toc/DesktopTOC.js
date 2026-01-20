import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DesktopTOC = ({ validSections, activeId, scrollToSection, showTOC }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
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
    );
};

export default DesktopTOC;
