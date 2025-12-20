import React, { useState } from "react";

const ScheduleBlock = ({ data }) => {
    const [activeGrade, setActiveGrade] = useState("low");

    const scheduleData = data || { low: [], high: [] };

    const activeData = scheduleData[activeGrade];

    return (
        <div className="max-w-4xl mx-auto px-4">
            {/* 呼吸說明 */}
            <div className="flex justify-center gap-6 text-sm mb-8">
                <div className="flex items-center gap-2">
                    <span className="bg-warning-100 text-primary-800 px-3 py-1 rounded-full font-bold">吸氣</span>
                    <span className="text-neutral-600 dark:text-neutral-400">專注吸收、精神匯聚</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-error-100 text-error-700 px-3 py-1 rounded-full font-bold">吐氣</span>
                    <span className="text-neutral-600 dark:text-neutral-400">肢體活動、社交消化</span>
                </div>
            </div>

            {/* 頁籤切換 */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-700">
                <button
                    onClick={() => setActiveGrade("low")}
                    className={`flex-1 py-4 text-center transition-all ${activeGrade === "low" ? "border-b-4 border-primary-500 text-primary-600 font-bold" : "text-neutral-500 hover:text-primary-500"
                        }`}
                >
                    中低年級 (1-4年級)
                </button>
                <button
                    onClick={() => setActiveGrade("high")}
                    className={`flex-1 py-4 text-center transition-all ${activeGrade === "high" ? "border-b-4 border-primary-500 text-primary-600 font-bold" : "text-neutral-500 hover:text-primary-500"
                        }`}
                >
                    高年級 (5-9年級)
                </button>
            </div>

            {/* 內容渲染 */}
            <div className="mt-8 space-y-4 pb-12">
                {activeData && activeData.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-primary-50 dark:border-neutral-700 flex items-center gap-4 hover:translate-y-[-5px] transition-transform">
                        <div className="text-xl font-bold text-primary-600 w-20 flex-shrink-0">{item.time}</div>
                        <div className="flex-1 border-l-2 border-primary-100 dark:border-neutral-700 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{item.title}</h3>
                                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${item.type === 'in' ? 'bg-warning-100 text-primary-800' : 'bg-error-100 text-error-700'
                                    }`}>
                                    {item.type === 'in' ? '吸氣' : '吐氣'}
                                </span>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleBlock;
