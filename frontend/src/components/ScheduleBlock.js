import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon, SunIcon, MoonIcon } from "@heroicons/react/outline";

const ScheduleList = ({ data, title }) => (
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
                            ${item.type === 'in' ? 'hover:shadow-warning-100/50' : 'hover:shadow-error-100/50'}
                        `}>
                            <div className="flex items-start gap-4">
                                {/* 時間與圖標 */}
                                <div className="flex flex-col items-center gap-2 w-20 flex-shrink-0">
                                    <div className="relative">
                                        <div className={`
                                            absolute inset-0 rounded-full blur-md opacity-50
                                            ${item.type === 'in' ? 'bg-warning-200' : 'bg-error-200'}
                                        `} />
                                        <div className={`
                                            relative w-10 h-10 rounded-full flex items-center justify-center
                                            ${item.type === 'in' ? 'bg-warning-100 text-primary-800' : 'bg-error-100 text-error-700'}
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
                                        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100">
                                            {item.title}
                                        </h3>
                                        <span className={`
                                            text-xs px-3 py-1 rounded-full font-bold flex-shrink-0
                                            backdrop-blur-sm border
                                            ${item.type === 'in'
                                                ? 'bg-warning-100/80 text-primary-800 border-warning-200'
                                                : 'bg-error-100/80 text-error-700 border-error-200'
                                            }
                                        `}>
                                            {item.type === 'in' ? '吸氣 ⬆' : '吐氣 ⬇'}
                                        </span>
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            </div>

                            {/* 裝飾性漸變邊框 */}
                            <div className={`
                                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                                bg-gradient-to-r ${item.type === 'in' ? 'from-warning-200/20 to-transparent' : 'from-error-200/20 to-transparent'}
                            `} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </div>
);

const ScheduleBlock = ({ data }) => {
    const [activeGrade, setActiveGrade] = useState("low");

    const scheduleData = data || { low: [], high: [] };
    const activeData = scheduleData[activeGrade];

    return (
        <div className="w-full">
            {/* 呼吸節奏說明卡片 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto mb-12"
            >
                <div className="bg-gradient-to-br from-brand-accent/5 to-brand-accent/10 dark:from-brand-accent/10 dark:to-brand-accent/5 rounded-3xl p-6 border border-brand-accent/20 backdrop-blur-sm">
                    <h3 className="text-center text-brand-accent font-bold mb-4 text-lg">
                        一呼一吸的學習節奏
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-warning-200/50">
                            <div className="w-12 h-12 rounded-full bg-warning-100 text-primary-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
                                ⬆
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
                        <div className="flex items-start gap-3 bg-white/50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-error-200/50">
                            <div className="w-12 h-12 rounded-full bg-error-100 text-error-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
                                ⬇
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
                {/* 年級切換按鈕 - 改進版 */}
                <div className="relative mb-8">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5 shadow-inner">
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 bg-white dark:bg-neutral-700 rounded-xl shadow-md"
                            initial={false}
                            animate={{
                                left: activeGrade === "low" ? "0.375rem" : "50%",
                                right: activeGrade === "low" ? "50%" : "0.375rem",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveGrade("low")}
                            className={`
                                relative flex-1 py-3 px-6 text-center transition-all duration-300 rounded-xl font-bold
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
                                relative flex-1 py-3 px-6 text-center transition-all duration-300 rounded-xl font-bold
                                ${activeGrade === "high"
                                    ? "text-brand-accent"
                                    : "text-neutral-500 hover:text-brand-accent/70"
                                }
                            `}
                        >
                            <span className="relative z-10">高年級 (5-9)</span>
                        </button>
                    </div>
                </div>

                {/* 時間表內容 - 使用 AnimatePresence 實現流暢切換 */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGrade}
                        initial={{ opacity: 0, x: activeGrade === "low" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeGrade === "low" ? 20 : -20 }}
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
