import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import BlockDispatcher from './BlockDispatcher';
import styles from './TimelineBlock.module.css'; // Reusing some premium styles if possible, or defined here

interface SwitcherOption {
    id: string;
    label: string;
    icon: string;
    description?: string;
    blocks: any[];
}

interface InteractiveSwitcherProps {
    data: {
        options: SwitcherOption[];
    };
}

const InteractiveSwitcherBlock = ({ data }: InteractiveSwitcherProps) => {
    const options = data.options || [];
    const [activeId, setActiveId] = useState(options[0]?.id);

    if (options.length === 0) return null;

    const activeOption = options.find(opt => opt.id === activeId) || options[0];

    return (
        <div className="w-full py-6 md:py-12">
            {/* Selection Area - Unified Sticky Tabs for all screens */}
            <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 mb-8 md:mb-16">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    <div className="flex overflow-x-auto no-scrollbar justify-center gap-3 md:gap-4 py-3 md:py-4 items-center">
                        {options.map((option) => (
                            <motion.div
                                key={option.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveId(option.id)}
                                className={`
                                    flex-shrink-0 flex items-center cursor-pointer transition-all duration-300
                                    ${activeId === option.id
                                        ? 'bg-brand-accent/5 dark:bg-brand-accent/10 border-2 border-brand-accent shadow-lg shadow-brand-accent/10'
                                        : 'bg-brand-bg/20 dark:bg-brand-structural/10 border-2 border-transparent hover:border-brand-accent/30 opacity-70 hover:opacity-100'}
                                    rounded-full px-4 py-1.5 md:px-6 md:py-2.5
                                `}
                            >
                                <div className={`
                                    w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors duration-500
                                    ${activeId === option.id ? 'bg-brand-accent text-white' : 'bg-brand-accent/10 text-brand-accent'}
                                    mr-2 md:mr-3
                                `}>
                                    <Icon icon={option.icon} className="text-base md:text-lg" />
                                </div>

                                <div>
                                    <h3 className={`text-sm md:text-base font-bold whitespace-nowrap ${activeId === option.id ? 'text-brand-dark dark:text-white' : 'text-gray-500'}`}>
                                        {option.label}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeId}
                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-full"
                    >
                        {activeOption.blocks && activeOption.blocks.map((block, idx) => (
                            <div key={`${activeId}-block-${idx}`} className="mb-0">
                                <BlockDispatcher block={block} />
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InteractiveSwitcherBlock;
