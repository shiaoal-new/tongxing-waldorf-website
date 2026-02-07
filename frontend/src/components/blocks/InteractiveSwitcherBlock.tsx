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
        <div className="w-full py-12">
            {/* Selection Area - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 mb-16">
                {options.map((option) => (
                    <motion.div
                        key={option.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveId(option.id)}
                        className={`
                            relative cursor-pointer p-8 rounded-[2.5rem] border-2 transition-all duration-500
                            ${activeId === option.id
                                ? 'bg-white dark:bg-gray-900 border-brand-accent shadow-2xl shadow-brand-accent/20 scale-105 z-10'
                                : 'bg-brand-bg/30 dark:bg-brand-structural/10 border-transparent hover:border-brand-accent/30 opacity-70 hover:opacity-100'}
                        `}
                    >
                        {activeId === option.id && (
                            <motion.div
                                layoutId="active-bg"
                                className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent rounded-[2.3rem] -z-1"
                            />
                        )}

                        <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500
                            ${activeId === option.id ? 'bg-brand-accent text-white' : 'bg-brand-accent/10 text-brand-accent'}
                        `}>
                            <Icon icon={option.icon} className="text-3xl" />
                        </div>

                        <h3 className={`text-xl font-bold mb-2 ${activeId === option.id ? 'text-brand-dark dark:text-white' : 'text-gray-500'}`}>
                            {option.label}
                        </h3>

                        {option.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {option.description}
                            </p>
                        )}

                        {activeId === option.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-brand-accent rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                            />
                        )}
                    </motion.div>
                ))}
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
