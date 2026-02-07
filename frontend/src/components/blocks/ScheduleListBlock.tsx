import React, { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ClockIcon, SunIcon, MoonIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/outline";
import { ScheduleItem } from "../../types/content";

const TERM_DICTIONARY: Record<string, string> = {
    '主課程': 'term-main-lesson',
    '一呼一吸': 'term-rhythm',
    '形線畫': 'term-form-drawing',
    '專科課程': 'term-specialty',
    '年段任務': 'term-grade-projects',
    '專題': 'term-grade-projects'
};

const InteractiveContent = ({ content, className }: { content: string; className?: string }) => {
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    const sortedTerms = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${sortedTerms.join('|')})`, 'g');

    let match;
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            segments.push(content.substring(lastIndex, match.index));
        }

        const term = match[0];
        segments.push(
            <span
                key={match.index}
                className="cursor-pointer text-brand-accent border-b border-dashed border-brand-accent/50 hover:bg-brand-accent/10 transition-colors px-0.5 rounded inline-block"
                onClick={(e: MouseEvent<HTMLSpanElement>) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('trigger-dictionary-item', {
                        detail: { id: TERM_DICTIONARY[term] }
                    }));
                }}
                title="點擊查看詳細解釋"
            >
                {term}
                <sup className="text-[0.6em] ml-0.5 align-top opacity-70">?</sup>
            </span>
        );

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
        segments.push(content.substring(lastIndex));
    }

    return <div className={className}>{segments}</div>;
};

interface ScheduleListBlockProps {
    data: {
        items: ScheduleItem[];
        title?: string;
    };
}

const ScheduleListBlock = ({ data }: ScheduleListBlockProps) => {
    const items = Array.isArray(data.items) ? data.items : [];

    return (
        <div className="max-w-3xl mx-auto px-4">
            {data.title && <h4 className="text-center font-bold text-brand-accent mb-6 text-lg uppercase tracking-widest">{data.title}</h4>}
            <div className="space-y-3">
                {items.map((item, index) => {
                    const hour = parseInt(item.time.split(':')[0]);
                    const timeOfDay = hour < 12 ? 'morning' : hour < 14 ? 'noon' : 'afternoon';
                    const TimeIconComponent = timeOfDay === 'morning' ? SunIcon : timeOfDay === 'noon' ? ClockIcon : MoonIcon;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className="group relative"
                        >
                            {index < items.length - 1 && (
                                <div className="absolute left-[52px] top-[60px] w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-brand-accent/30 to-transparent" />
                            )}

                            <div className={`
                                relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900
                                p-5 rounded-2xl shadow-sm border border-brand-accent/10 dark:border-neutral-700
                                hover:shadow-lg hover:border-brand-accent/30 hover:-translate-y-1
                                transition-all duration-300 ease-out
                                ${item.type === 'in' ? 'hover:shadow-brand-accent/20' : 'hover:shadow-brand-structural/20'}
                            `}>
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-2 w-20 flex-shrink-0">
                                        <div className="relative">
                                            <div className={`
                                                absolute inset-0 rounded-full blur-md opacity-50
                                                ${item.type === 'in' ? 'bg-brand-accent/30' : 'bg-brand-structural/30'}
                                            `} />
                                            <div className={`
                                                relative w-10 h-10 rounded-full flex items-center justify-center
                                                ${item.type === 'in' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-structural/10 text-brand-structural'}
                                                group-hover:scale-110 transition-transform duration-300
                                            `}>
                                                <TimeIconComponent className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-brand-accent tabular-nums">
                                            {item.time}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <InteractiveContent
                                                content={item.title}
                                                className="font-bold text-lg text-neutral-800 dark:text-neutral-100"
                                            />
                                            <span className={`
                                                text-xs px-3 py-1 rounded-full font-bold flex-shrink-0
                                                backdrop-blur-sm border
                                                ${item.type === 'in'
                                                    ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                                                    : 'bg-brand-structural/10 text-brand-structural border-brand-structural/20'
                                                }
                                            `}>
                                                {item.type === 'in' ? (
                                                    <span className="flex items-center gap-1">吸氣 <ArrowUpIcon className="w-3 h-3 opacity-80" /></span>
                                                ) : (
                                                    <span className="flex items-center gap-1">吐氣 <ArrowDownIcon className="w-3 h-3 opacity-80" /></span>
                                                )}
                                            </span>
                                        </div>
                                        <InteractiveContent
                                            content={item.content}
                                            className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>

                                <div className={`
                                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                                    bg-gradient-to-r ${item.type === 'in' ? 'from-brand-accent/10 to-transparent' : 'from-brand-structural/10 to-transparent'}
                                `} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScheduleListBlock;
