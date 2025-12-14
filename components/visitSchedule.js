import React, { useState } from "react";
import Container from "./container";
import { ClockIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/outline";

const initialDates = [
    { id: 1, date: "2024-03-15 (五)", time: "09:30 - 11:30", quota: 5, total: 20 },
    { id: 2, date: "2024-03-29 (五)", time: "09:30 - 11:30", quota: 12, total: 20 },
    { id: 3, date: "2024-04-12 (五)", time: "09:30 - 11:30", quota: 0, total: 20 },
    { id: 4, date: "2024-04-26 (五)", time: "09:30 - 11:30", quota: 8, total: 20 },
];

export default function VisitSchedule() {
    const [dates, setDates] = useState(initialDates);

    const handleRegister = (id) => {
        alert("報名成功！我們會將確認信寄至您的信箱。");
        setDates(dates.map(d => {
            if (d.id === id) {
                return { ...d, quota: d.quota - 1 };
            }
            return d;
        }));
    };

    const renderButton = (item) => {
        if (item.quota > 0) {
            return (
                <button
                    onClick={() => handleRegister(item.id)}
                    className="inline-block rounded bg-indigo-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-indigo-700 hover:shadow-lg focus:bg-indigo-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-indigo-800 active:shadow-lg w-full sm:w-auto">
                    立即報名
                </button>
            );
        } else {
            return (
                <button
                    disabled
                    className="inline-block rounded bg-gray-400 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md cursor-not-allowed w-full sm:w-auto">
                    額滿
                </button>
            );
        }
    };

    return (
        <Container>
            <div className="flex flex-col w-full mt-4">

                {/* Mobile View: Cards */}
                <div className="block md:hidden space-y-4">
                    {dates.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-trueGray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center text-lg font-bold text-gray-800 dark:text-white">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                    {item.date}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${item.quota > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {item.quota > 0 ? "報名中" : "已額滿"}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <ClockIcon className="w-5 h-5 mr-2" />
                                    {item.time}
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <UserGroupIcon className="w-5 h-5 mr-2" />
                                    剩餘名額：<span className={item.quota > 0 ? "text-green-600 font-bold ml-1" : "text-red-500 font-bold ml-1"}>{item.quota}</span> / {item.total}
                                </div>
                            </div>

                            <div className="mt-auto">
                                {renderButton(item)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white dark:bg-trueGray-800 rounded-lg shadow">
                            <table className="min-w-full text-center text-sm font-light text-surface dark:text-white">
                                <thead className="border-b border-neutral-200 font-medium dark:border-white/10 dark:bg-trueGray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">日期</th>
                                        <th scope="col" className="px-6 py-4">時間</th>
                                        <th scope="col" className="px-6 py-4">剩餘名額</th>
                                        <th scope="col" className="px-6 py-4">狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dates.map((item) => (
                                        <tr key={item.id} className="border-b border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-trueGray-700">
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">{item.date}</td>
                                            <td className="whitespace-nowrap px-6 py-4">{item.time}</td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`${item.quota > 0 ? "text-green-600 font-bold" : "text-red-500"}`}>
                                                    {item.quota}
                                                </span>
                                                / {item.total}
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
            </div>
        </Container>
    );
}
