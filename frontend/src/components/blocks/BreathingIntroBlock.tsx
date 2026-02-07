import React from "react";
import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/outline";

const BreathingIntroBlock = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
    );
};

export default BreathingIntroBlock;
