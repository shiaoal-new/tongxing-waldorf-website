import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ComparisonBlock as ComparisonBlockType } from '../../types/content';

interface ComparisonBlockProps {
    data: ComparisonBlockType;
}

const ComparisonBlock = ({ data }: ComparisonBlockProps) => {
    // Prevent crash if data is missing
    if (!data) return null;

    const { left, right, title, subtitle, image } = data;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as any
            }
        }
    };

    return (
        <section className="relative py-16 md:py-32 overflow-hidden bg-brand-bg/30">
            <div className="max-w-[1500px] mx-auto px-6">
                {/* Header */}
                {(title || subtitle) && (
                    <div className="text-center mb-16 md:mb-24">
                        {title && (
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4"
                            >
                                {title}
                            </motion.h2>
                        )}
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-lg text-brand-taupe/80 max-w-2xl mx-auto"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                )}

                {/* Comparison Container */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative min-h-[600px] md:min-h-[850px] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-brand-dark/5 text-brand-dark bg-white"
                >
                    {/* --- Layer 1: Background Colors (Desktop) --- */}
                    <div className="absolute inset-0 hidden md:flex flex-row z-0">
                        {/* Left Background */}
                        <div className="w-1/2 h-full bg-[#F9F7F2] dark:bg-stone-900/40" />
                        {/* Right Background */}
                        <div className="w-1/2 h-full bg-[#F0F2F5] dark:bg-stone-800/40" />
                    </div>

                    {/* --- Layer 2: Center Image (Desktop) --- */}
                    {image && (
                        <div className="absolute inset-0 pointer-events-none z-10 hidden md:flex items-center justify-center overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                whileInView={{ opacity: 0.85, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                className="h-full w-full flex items-center justify-center"
                            >
                                <img
                                    src={image}
                                    alt="Artistic background comparison"
                                    className="h-[90%] md:h-[95%] lg:h-[105%] w-auto object-contain object-center opacity-90 mix-blend-multiply dark:mix-blend-normal"
                                />
                            </motion.div>
                        </div>
                    )}

                    {/* --- Layer 3: Grid Content --- */}
                    <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 h-full">

                        {/* Central Vertical Line Decor (Optional) */}
                        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-brand-dark/5 hidden md:block" />

                        {/* Left Side Content (Public HS) */}
                        <div className="relative p-10 md:p-12 lg:p-20 md:pr-32 lg:pr-48 flex flex-col items-center md:items-end text-center md:text-right overflow-hidden">

                            {/* Mobile Background + Left Half Image */}
                            <div className="absolute inset-0 z-0 md:hidden bg-[#F9F7F2] dark:bg-stone-900/40">
                                {image && (
                                    <img
                                        src={image}
                                        alt="Public path background"
                                        className="w-[200%] max-w-none h-full object-cover object-left opacity-30 mix-blend-multiply dark:mix-blend-normal absolute top-0 left-0"
                                    />
                                )}
                            </div>

                            <div className="relative z-10 w-full flex flex-col items-center md:items-end">
                                {left?.label && (
                                    <motion.div variants={itemVariants} className="mb-12 md:mb-24 w-full md:max-w-[280px] lg:max-w-xs">
                                        <h3 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-brand-dark leading-tight">
                                            {left.label}
                                        </h3>
                                    </motion.div>
                                )}

                                <div className="space-y-12 md:space-y-20 flex-grow w-full md:max-w-[280px] lg:max-w-xs">
                                    {left?.items?.map((item: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="flex flex-col md:flex-row-reverse items-center md:items-start gap-4 md:gap-6"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0 text-brand-accent shadow-sm bg-white/80 backdrop-blur-sm">
                                                <Icon icon={item.icon || "lucide:check"} className="w-6 h-6" />
                                            </div>
                                            <div className="md:pr-2">
                                                <h4 className="font-bold mb-2 md:text-lg text-brand-dark">{item.text}</h4>
                                                {item.description && <p className="text-xs md:text-sm text-brand-taupe leading-relaxed text-balance">{item.description}</p>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {left?.badge && (
                                    <motion.div
                                        variants={itemVariants}
                                        className="mt-12 px-8 py-3 bg-white/60 backdrop-blur-md border-2 border-brand-accent text-brand-accent font-bold rounded-xl uppercase tracking-wider text-xs shadow-sm"
                                    >
                                        {left.badge}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Right Side Content (Private HS) */}
                        <div className="relative p-10 md:p-12 lg:p-20 md:pl-32 lg:pl-48 flex flex-col items-center md:items-start text-center md:text-left overflow-hidden">

                            {/* Mobile Background + Right Half Image */}
                            <div className="absolute inset-0 z-0 md:hidden bg-[#F0F2F5] dark:bg-stone-800/40">
                                {image && (
                                    <img
                                        src={image}
                                        alt="Private path background"
                                        className="w-[200%] max-w-none h-full object-cover object-right opacity-30 mix-blend-multiply dark:mix-blend-normal absolute top-0 right-0"
                                    />
                                )}
                            </div>

                            <div className="relative z-10 w-full flex flex-col items-center md:items-start">
                                {right?.label && (
                                    <motion.div variants={itemVariants} className="mb-12 md:mb-24 w-full md:max-w-[280px] lg:max-w-xs">
                                        <h3 className="text-2xl md:text-3xl font-medium tracking-widest uppercase text-brand-taupe leading-tight">
                                            {right.label}
                                        </h3>
                                    </motion.div>
                                )}

                                <div className="space-y-12 md:space-y-20 flex-grow w-full md:max-w-[280px] lg:max-w-xs">
                                    {right?.items?.map((item: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 text-stone-500 shadow-sm bg-white/80 backdrop-blur-sm">
                                                <Icon icon={item.icon || "lucide:info"} className="w-6 h-6" />
                                            </div>
                                            <div className="md:pl-2">
                                                <h4 className="font-bold mb-2 md:text-lg text-brand-dark">{item.text}</h4>
                                                {item.description && <p className="text-xs md:text-sm text-brand-taupe leading-relaxed text-balance">{item.description}</p>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {right?.badge && (
                                    <motion.div
                                        variants={itemVariants}
                                        className="mt-12 px-8 py-3 bg-white/60 backdrop-blur-md border-2 border-stone-300 text-stone-500 font-medium rounded-xl uppercase tracking-wider text-xs shadow-sm"
                                    >
                                        {right.badge}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

export default ComparisonBlock;
