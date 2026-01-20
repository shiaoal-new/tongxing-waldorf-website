import React from "react";
import { CalendarIcon, ClockIcon, UserGroupIcon } from "@heroicons/react/outline";

export default function SessionCard({ item, formatSessionDate, formatSessionTime, renderButton }) {
    return (
        <div key={item.id} className="bg-brand-bg dark:bg-brand-structural/20 rounded-xl shadow-sm p-component border border-brand-taupe/10">
            <div className="flex justify-between items-start mb-component">
                <div className="flex items-center text-lg font-bold text-brand-text dark:text-brand-bg leading-brand tracking-brand">
                    <CalendarIcon className="w-5 h-5 mr-2 text-brand-accent" />
                    {formatSessionDate(item.date)}
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.remaining_seats > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.remaining_seats > 0 ? "報名中" : "已額滿"}
                </span>
            </div>

            <div className="space-y-3 mb-component">
                <div className="flex items-center text-brand-taupe">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    {formatSessionTime(item.start_time, item.duration)}
                </div>
                <div className="flex items-center text-brand-taupe">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    剩餘名額：<span className={item.remaining_seats > 0 ? "text-green-600 font-bold ml-1" : "text-red-500 font-bold ml-1"}>{item.remaining_seats}</span> / {item.total_seats}
                </div>
            </div>

            <div className="mt-auto">
                {renderButton(item)}
            </div>
        </div>
    );
}
