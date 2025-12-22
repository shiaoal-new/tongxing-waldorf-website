import React, { useState } from "react";
import Container from "./container";
import { ClockIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/outline";
import VisitRegistrationForm from "./visitRegistrationForm";
import Modal from "./modal";

import initialDates from "./initialVisitDates.json";

export default function VisitSchedule() {
    const [dates, setDates] = useState(initialDates);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const openModal = (session) => {
        setSelectedSession(session);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // We don't need a timeout here as Modal handles animation and lifecycle
        setTimeout(() => setSelectedSession(null), 300);
    };

    // Placeholder for your deployed Apps Script Web App URL
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP28DYxKx8A3ZcjJV2lqYYRUue6WHiMXFCpwWWt9HVpzOGvGw7ZVJjEOF4MaSafnlF/exec";

    const handleFormComplete = (data) => {
        const visitors = parseInt(data.visitors || 1);

        // Prepare data for submission
        const payload = {
            ...data,
            sessionDate: selectedSession.date,
            sessionTime: selectedSession.time
        };

        // Submit to Apps Script
        if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_WEB_APP_URL") {
            fetch(APPS_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            }).catch(err => console.error("Error submitting form:", err));
        } else {
            console.warn("Apps Script URL not set. Data not sent to backend.");
        }

        setDates(dates.map(d => {
            if (d.id === selectedSession.id) {
                return { ...d, quota: Math.max(0, d.quota - visitors) };
            }
            return d;
        }));

        closeModal();
        setTimeout(() => {
            alert("報名成功！確認信將發送至 " + data.email);
        }, 500);
    };

    const renderButton = (item) => {
        if (item.quota > 0) {
            return (
                <button
                    onClick={() => openModal(item)}
                    className="inline-block rounded-md bg-brand-accent px-6 py-2.5 text-xs font-bold uppercase leading-brand tracking-brand text-brand-bg shadow-md transition duration-150 ease-in-out hover:opacity-90 hover:shadow-lg focus:outline-none w-full sm:w-auto">
                    立即報名
                </button>
            );
        } else {
            return (
                <button
                    disabled
                    className="inline-block rounded-md bg-brand-taupe/40 px-6 py-2.5 text-xs font-bold uppercase leading-brand tracking-brand text-brand-bg shadow-md cursor-not-allowed w-full sm:w-auto">
                    額滿
                </button>
            );
        }
    };

    return (
        <Container>
            <div className="flex flex-col w-full mt-component">

                {/* Mobile View: Cards */}
                <div className="block md:hidden space-y-component">
                    {dates.map((item) => (
                        <div key={item.id} className="bg-brand-bg dark:bg-brand-structural/20 rounded-xl shadow-sm p-component border border-brand-taupe/10">
                            <div className="flex justify-between items-start mb-component">
                                <div className="flex items-center text-lg font-bold text-brand-text dark:text-brand-bg leading-brand tracking-brand">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-brand-accent" />
                                    {item.date}
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.quota > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {item.quota > 0 ? "報名中" : "已額滿"}
                                </span>
                            </div>

                            <div className="space-y-3 mb-component">
                                <div className="flex items-center text-brand-taupe">
                                    <ClockIcon className="w-5 h-5 mr-2" />
                                    {item.time}
                                </div>
                                <div className="flex items-center text-brand-taupe">
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
                                            <td className="whitespace-nowrap px-6 py-4 font-bold">{item.date}</td>
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

            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                title={`預約參觀 - ${selectedSession?.date}`}
                maxWidth="max-w-md"
            >
                {selectedSession && (
                    <div className="mt-2">
                        <VisitRegistrationForm onComplete={handleFormComplete} />
                    </div>
                )}
            </Modal>
        </Container>
    );
}
