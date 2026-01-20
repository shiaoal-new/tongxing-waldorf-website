import React from "react";

export default function SessionTable({ dates, formatSessionDate, formatSessionTime, renderButton }) {
    return (
        <div className="hidden md:block overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-brand-bg dark:bg-brand-structural/20 rounded-xl shadow-sm border border-brand-taupe/10">
                    <table className="min-w-full text-center text-sm font-light text-brand-text dark:text-brand-bg">
                        <thead className="border-b border-brand-taupe/10 font-bold dark:bg-brand-structural/30">
                            <tr>
                                <th scope="col" className="px-6 py-4">日期</th>
                                <th scope="col" className="px-6 py-4">時間</th>
                                <th scope="col" className="px-6 py-4">剩餘名額</th>
                                <th scope="col" className="px-6 py-4">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dates.map((item) => (
                                <tr key={item.id} className="border-b border-brand-taupe/10 dark:hover:bg-brand-structural/40 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 font-bold">{formatSessionDate(item.date)}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{formatSessionTime(item.start_time, item.duration)}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`${item.remaining_seats > 0 ? "text-green-600 font-bold" : "text-red-500"}`}>
                                            {item.remaining_seats}
                                        </span>
                                        / {item.total_seats}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {renderButton(item)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
