import React, { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ClockIcon, SunIcon, MoonIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/outline";
import { ScheduleBlock as ScheduleBlockType, ScheduleItem } from "../../types/content";

const TERM_DICTIONARY: Record<string, string> = {
    '主課程': 'term-main-lesson',
    '一呼一吸': 'term-rhythm',
    '形線畫': 'term-form-drawing',
    '專科課程': 'term-specialty',
    '年段任務': 'term-grade-projects',
    '專題': 'term-grade-projects'
};

interface InteractiveContentProps {
    content: string;
    className?: string;
}

const InteractiveContent = ({ content, className }: InteractiveContentProps) => {
    // 簡單的關鍵字替換邏輯
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

interface ScheduleListProps {
    data: ScheduleItem[];
    title?: string;
}

const ScheduleList = ({ data, title }: ScheduleListProps) => (
    <div className="flex-1">
        {title && <h4 className="text-center font-bold text-brand-accent mb-6 text-lg uppercase tracking-widest">{title}</h4>}
        <div className="space-y-3">
            {data && data.map((item, index) => {
                // 判斷時段（早上、中午、下午）
                const hour = parseInt(item.time.split(':')[0]);
                const timeOfDay = hour < 12 ? 'morning' : hour < 14 ? 'noon' : 'afternoon';
                const timeIcon = timeOfDay === 'morning' ? SunIcon : timeOfDay === 'noon' ? ClockIcon : MoonIcon;
                const TimeIconComponent = timeIcon;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className="group relative"
                    >
                        {/* 時間軸連接線 */}
                        {index < data.length - 1 && (
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
                                {/* 時間與圖標 */}
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

                                {/* 內容 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <InteractiveContent
                                            content={item.title}
                                            className="font-bold text-lg text-neutral-800 dark:text-neutral-100"
                                        /> {/* 如果標題裡也有關鍵字 */}
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

                            {/* 裝飾性漸變邊框 */}
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

interface ScheduleBlockProps {
    data: ScheduleBlockType;
}

const ScheduleBlock = ({ data }: ScheduleBlockProps) => {
    const [activeGrade, setActiveGrade] = useState<"low" | "high">("low");
    const containerRef = useRef<HTMLDivElement>(null);

    // 使用 useScroll 監測滾動進度
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 100px", "start 50px"] // 當元件頂部接近導覽列時觸發動畫
    });

    // 將滾動進度映射到各項樣式數值
    const paddingY = useTransform(scrollYProgress, [0, 1], ["16px", "4px"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const marginBottom = useTransform(scrollYProgress, [0, 1], ["16px", "8px"]);
    const bgOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.95]);
    const shadowOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.1]);

    const scheduleData = data || { low: [], high: [] };
    const activeData = scheduleData[activeGrade];

    return (
        <div ref={containerRef} className="w-full">
            {/* 呼吸節奏說明卡片 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto mb-12"
            >
                <div className="bg-gradient-to-br from-brand-accent/5 to-brand-accent/10 dark:from-brand-accent/10 dark:to-brand-accent/5 rounded-3xl p-6 border border-brand-accent/20 backdrop-blur-sm">
                    <h3 className="text-center text-brand-accent font-bold mb-4 text-lg animate-breathing">
                        一呼一吸的學習節奏
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-brand-accent/20">
                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                                <ArrowUpIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                                    吸氣時刻
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    專注吸收知識、精神匯聚、深度學習的時段
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-brand-structural/20">
                            <div className="w-12 h-12 rounded-full bg-brand-structural/10 text-brand-structural flex items-center justify-center flex-shrink-0">
                                <ArrowDownIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                                    吐氣時刻
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    肢體活動、社交互動、消化吸收的時段
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 年級切換與時間表 */}
            <div className="max-w-3xl mx-auto px-4">
                {/* 年級切換按鈕 - 滾動連動版 */}
                <motion.div
                    style={{
                        paddingTop: paddingY,
                        paddingBottom: paddingY,
                        marginBottom: marginBottom,
                        backgroundColor: useTransform(bgOpacity, o => `rgba(var(--brand-bg-rgb, 242, 242, 240), ${o})`),
                        boxShadow: useTransform(shadowOpacity, o => `0 4px 6px -1px rgba(0, 0, 0, ${o}), 0 2px 4px -1px rgba(0, 0, 0, ${o * 0.5})`)
                    }}
                    className="sticky top-[80px] z-30 -mx-4 px-4 backdrop-blur-md"
                >
                    <motion.div
                        style={{ scale }}
                        className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 shadow-inner origin-center"
                    >
                        <motion.div
                            className="absolute top-1 bottom-1 bg-white dark:bg-neutral-700 rounded-xl shadow-md"
                            initial={false}
                            animate={{
                                left: activeGrade === "low" ? "0.25rem" : "50%",
                                right: activeGrade === "low" ? "50%" : "0.25rem",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveGrade("low")}
                            className={`
                                relative flex-1 py-1.5 md:py-3 px-3 md:px-6 text-center transition-colors duration-300 rounded-xl font-bold text-sm md:text-base
                                ${activeGrade === "low"
                                    ? "text-brand-accent"
                                    : "text-neutral-500 hover:text-brand-accent/70"
                                }
                            `}
                        >
                            <span className="relative z-10">中低年級 (1-4)</span>
                        </button>
                        <button
                            onClick={() => setActiveGrade("high")}
                            className={`
                                relative flex-1 py-1.5 md:py-3 px-3 md:px-6 text-center transition-colors duration-300 rounded-xl font-bold text-sm md:text-base
                                ${activeGrade === "high"
                                    ? "text-brand-accent"
                                    : "text-neutral-500 hover:text-brand-accent/70"
                                }
                            `}
                        >
                            <span className="relative z-10">高年級 (5-9)</span>
                        </button>
                    </motion.div>
                </motion.div>

                {/* 時間表內容 */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGrade}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="pb-12"
                    >
                        <ScheduleList data={activeData} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ScheduleBlock;
