import React from "react";

export default function RegistrationCard({ reg, formatSessionDate, formatSessionTime, onCancel }) {
    return (
        <div className="bg-white dark:bg-brand-structural/30 rounded-xl p-6 border-l-4 border-brand-accent shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="font-bold text-lg text-brand-text">{formatSessionDate(reg.session?.date)}</p>
                    <p className="text-brand-taupe">{formatSessionTime(reg.session?.start_time, reg.session?.duration)}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    已確認
                </span>
            </div>
            <div className="text-sm text-brand-taupe border-t border-gray-100 pt-4 mt-2">
                <div className="flex justify-between mb-2">
                    <span>登記人數</span>
                    <span className="font-bold">{reg.visitors} 位</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span>登記姓名</span>
                    <span className="font-bold">{reg.name}</span>
                </div>
                <button
                    onClick={() => onCancel(reg)}
                    className="btn btn-ghost btn-sm w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 hover:border-red-300 rounded-full"
                >
                    取消預約
                </button>
            </div>
        </div>
    );
}
