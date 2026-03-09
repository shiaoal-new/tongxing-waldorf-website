import React from "react";
import { motion, Variants } from "framer-motion";
import { PlayIcon } from "@heroicons/react/solid";
import ActionButtons from "./ActionButtons";
import ExpandableText from "./ExpandableText";
import MarkdownContent from "./MarkdownContent";
import { CTAButton } from "../../types/content";

import { useSectionTheme } from "../../context/SectionThemeContext";

interface StaggeredRevealProps {
    subtitle?: string;
    title?: string;
    content?: string;
    buttons?: CTAButton[];
    align?: 'left' | 'center' | 'right';
    isNested?: boolean;
    collapsedHeight?: number;
    className?: string;
    duration?: string; // 加入 duration 支援
    disableExpand?: boolean; // 新增：是否禁用收合功能
    // Allows passing external click handlers (e.g., from FeatureItem card click)
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    variant?: 'default' | 'minimal';
    expandText?: string;
    collapseText?: string;
}

/**
 * StaggeredReveal Component
 * 原子組件：處理標題、內文與按鈕的交錯顯現動畫
 */
export default function StaggeredReveal({
    subtitle,
    title,
    content,
    buttons,
    align = 'center',
    isNested = false,
    collapsedHeight,
    className = "",
    duration,
    disableExpand,
    expanded,
    onToggle,
    variant = 'default',
    expandText,
    collapseText
}: StaggeredRevealProps) {
    const sectionContext = useSectionTheme();

    /**
     * Determines the optimal text color based on the section's background theme.
     * This "smart" logic ensures readability regardless of global dark/light mode
     * when a section has a specific overlay or media background.
     */
    const titleColorClass = sectionContext?.theme === 'dark'
        ? "text-white drop-shadow-sm"
        : sectionContext?.theme === 'light'
            ? "text-gray-900 dark:text-gray-900" // Force dark text even in system dark mode if section is light
            : "text-brand-text dark:text-brand-bg";

    const contentColorClass = sectionContext?.theme === 'dark'
        ? "text-stone-100/90"
        : sectionContext?.theme === 'light'
            ? "text-gray-700 dark:text-gray-700" // Force dark-ish text even in system dark mode
            : "text-brand-taupe dark:text-brand-taupe";

    // 容器動畫變體：控制子元素交錯出現 (Stagger)
    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.3 // 與用戶調整一致
            }
        }
    };

    // 子元素動畫變體：位移 + 漸顯 + 模糊 (Blur Reveal)
    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 80, // 與用戶調整一致
            filter: "blur(8px)"
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const alignmentClasses = align === 'left' ? 'text-left items-start' : 'text-center items-center';

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={containerVariants}
            className={`flex flex-col ${alignmentClasses} ${className}`}
        >
            {subtitle && (
                <motion.div variants={itemVariants} className="label-accent">
                    {subtitle}
                </motion.div>
            )}

            {title && (
                <motion.div variants={itemVariants} className={`flex items-baseline gap-3 flex-wrap ${align === 'center' ? 'justify-center' : ''}`}>
                    {duration && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-tight bg-black/80 dark:bg-black/60 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap tabular-nums">
                            <PlayIcon className="w-2.5 h-2.5 mb-0.5" />
                            {duration}
                        </span>
                    )}
                    <h3 className={`${isNested ? 'text-xl md:text-2xl font-bold' : 'text-3xl md:text-4xl font-bold mt-3'} ${titleColorClass} leading-tight tracking-tight`}>
                        <MarkdownContent content={title} isInline />
                    </h3>
                </motion.div>
            )}

            {content && (
                <motion.div variants={itemVariants} className={`py-2 ${isNested ? 'text-base md:text-lg opacity-80' : 'text-lg'} ${contentColorClass} leading-relaxed`}>
                    <ExpandableText
                        content={content}
                        collapsedHeight={collapsedHeight || (isNested ? 220 : 160)}
                        disableExpand={disableExpand !== undefined ? disableExpand : isNested}
                        expanded={expanded}
                        onToggle={onToggle}
                        variant={variant}
                        expandText={expandText}
                        collapseText={collapseText}
                    />
                </motion.div>
            )}

            {Array.isArray(buttons) && buttons.length > 0 && (
                <motion.div variants={itemVariants}>
                    <ActionButtons
                        buttons={buttons}
                        align={align}
                        className="mt-6"
                        size={isNested ? "sm" : "default"}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
