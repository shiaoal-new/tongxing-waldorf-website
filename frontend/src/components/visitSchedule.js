import React, { useState, useEffect, useRef } from "react";
import liff from "@line/liff"; // Import LIFF SDK
import Container from "./container";
import { ClockIcon, CalendarIcon, UserGroupIcon, TicketIcon } from "@heroicons/react/outline";
import VisitRegistrationForm from "./visitRegistrationForm";
import Modal from "./modal";
import DevComment from "./DevComment";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function VisitSchedule() {
    const { data: session } = useSession();
    const router = useRouter();
    const [dates, setDates] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // API Base URL (使用相對路徑以配合 Firebase Hosting Rewrites)
    const API_BASE = "/api";

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/getVisitSessions`);
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "無法獲取場次資訊");
            }

            if (data) setDates(data);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setError("暫時無法連線至預約系統，請確認後端服務是否已啟動。");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserRegistrations = async () => {
        if (!session) return;
        try {
            const res = await fetch(`${API_BASE}/getUserRegistrations`);
            if (res.ok) {
                const data = await res.json();
                setUserRegistrations(data);
            }
        } catch (err) {
            console.error("Failed to fetch user registrations:", err);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (session) {
            fetchUserRegistrations();
        }
    }, [session]);

    // LIFF Initialization & Auto-Login
    // 追蹤是否已嘗試登入（防止無限循環）
    const loginAttempted = useRef(false);

    useEffect(() => {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
            console.warn("LIFF ID is missing in environment variables");
            return;
        }

        // Initialize LIFF
        liff.init({ liffId })
            .then(() => {
                console.log("LIFF initialized");

                // Logic: If user is in LINE App (LIFF browser) and NOT logged in to our website (NextAuth),
                // we automatically trigger the login process.
                // This ensures that when they open the LIFF link, they get logged in effortlessly.
                if (liff.isInClient() && !session && !isLoading && !loginAttempted.current) {
                    console.log("Auto-login triggered by LIFF context");
                    loginAttempted.current = true;
                    loginWithLine();
                }
            })
            .catch((err) => {
                console.error("LIFF init failed", err);
            });
    }, [session, isLoading]);
    // 直接構建 LINE OAuth URL（繞過 NextAuth 的 signIn 函數）
    const loginWithLine = () => {
        const clientId = '2008899796';
        const baseUrl = window.location.origin;
        const redirectUri = encodeURIComponent(`${baseUrl}/api/lineCallback`);
        const state = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 15);
        // 設置 NextAuth 期望的 state cookie
        document.cookie = `next-auth.state=${state}; path=/; samesite=lax`;



        const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
            `response_type=code&` +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `state=${state}&` +
            `scope=profile%20openid%20email&` +
            `nonce=${nonce}`;

        window.location.href = authUrl;
    };



    // Handle "manage" mode from LINE Bot (Legacy/Web fallback)
    useEffect(() => {
        // If not in LIFF (e.g. external browser) but mode=manage is present, also trigger login
        if (router.query.mode === 'manage' && !session && !isLoading) {
            // Avoid double trigger if LIFF handles it, but safe to keep as fallback
            // We can check !liff.isInClient() if we want to be strict, but liff init is async.
            // Let's rely on the fact that if LIFF is initing, this might fire too.
            // But since specific checks are good:
            loginWithLine();
        }
    }, [router.query, session, isLoading]);

    const openModal = (sessionObj) => {
        if (!session) {
            // Trigger LINE login if not logged in
            loginWithLine();
            return;
        }
        setSelectedSession(sessionObj);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setSelectedSession(null), 300);
    };

    const handleFormComplete = async (data) => {
        // Deprecated: Registration now moved to LINE OA
        console.warn("handleFormComplete is deprecated. Use LINE OA for registration.");
    };

    // LINE Official Account URL - 根據環境自動切換
    // 我們優先使用 NEXT_PUBLIC_LINE_OA_ID (通常是正式版 @tongxing)
    // 但如果是本地開發 (development)，我們可能希望連到測試帳號 (例如 @443brhul)
    // 請確保 frontend/.env.local 的 NEXT_PUBLIC_LINE_OA_ID 是您的測試帳號 ID
    const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID || "@tongxing";
    const LINE_OA_URL = `https://line.me/R/ti/p/${LINE_OA_ID}`;

    const redirectToLine = () => {
        window.open(LINE_OA_URL, "_blank");
    };

    const renderButton = (item) => {
        if (item.remaining_seats > 0) {
            return (
                <button
                    onClick={redirectToLine}
                    className="btn btn-primary w-full sm:w-auto px-6 uppercase tracking-brand">
                    前往 LINE 報名
                </button>
            );
        } else {
            return (
                <button
                    disabled
                    className="btn btn-disabled w-full sm:w-auto px-6">
                    額滿
                </button>
            );
        }
    };

    if (isLoading) {
        return (
            <Container limit>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container limit>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-brand-accent/5 p-8 rounded-2xl border border-brand-accent/10 max-w-md">
                        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClockIcon className="w-8 h-8 text-brand-accent animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-text mb-2 tracking-brand">預約系統稍候片刻</h3>
                        <p className="text-brand-taupe mb-6 leading-relaxed">
                            抱歉，目前系統正在稍微休息中。請您過幾分鐘後，再點擊下方按鈕重新整理試試看。
                        </p>
                        <button
                            onClick={fetchSessions}
                            className="btn btn-primary px-8"
                        >
                            重新整理
                        </button>
                    </div>
                </div>
            </Container>
        );
    }

    if ((!dates || dates.length === 0) && userRegistrations.length === 0) {
        return (
            <Container limit>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-brand-bg dark:bg-brand-structural/20 p-10 rounded-2xl border border-brand-taupe/10 max-w-lg shadow-sm">
                        <div className="w-20 h-20 bg-brand-accent/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-10 h-10 text-brand-accent/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-brand-text dark:text-brand-bg mb-4 tracking-brand">目前暫無開放預約場次</h3>
                        <p className="text-brand-taupe dark:text-brand-taupe/80 mb-8 leading-relaxed">
                            謝謝您對同心華德福的關注。目前所有的參觀場次皆已額滿或辦理完畢。<br />
                            新場次資訊將會不定期更新，歡迎您隨時留意官網公告，或 <span className="font-bold">透過官方 LINE 登記候補</span>。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/" className="btn bg-brand-bg dark:bg-brand-structural/40 border border-brand-taupe/20 px-8 hover:bg-brand-accent/5 transition-colors dark:text-brand-bg">
                                回到首頁
                            </Link>
                            <button
                                onClick={redirectToLine}
                                className="btn btn-primary px-8"
                            >
                                前往 LINE 官方帳號
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container limit>
            <div className="flex flex-col w-full mt-component">

                {/* User Registrations Section */}
                {session && userRegistrations.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center mb-6">
                            <TicketIcon className="w-6 h-6 text-brand-accent mr-3" />
                            <h2 className="text-2xl font-bold text-brand-text tracking-brand">我的參訪登記</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userRegistrations.map((reg) => (
                                <div key={reg.id} className="bg-white dark:bg-brand-structural/30 rounded-xl p-6 border-l-4 border-brand-accent shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-lg text-brand-text">{reg.session?.date || "未知日期"}</p>
                                            <p className="text-brand-taupe">{reg.session?.time || "---"}</p>
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
                                        <div className="flex justify-between">
                                            <span>登記姓名</span>
                                            <span className="font-bold">{reg.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="my-8 border-b border-brand-taupe/10"></div>
                    </div>
                )}


                <DevComment text="Visit Schedule Mobile Cards View" />
                {/* Mobile View: Cards */}

                <div className="block md:hidden space-y-component">
                    {dates.map((item) => (
                        <div key={item.id} className="bg-brand-bg dark:bg-brand-structural/20 rounded-xl shadow-sm p-component border border-brand-taupe/10">
                            <div className="flex justify-between items-start mb-component">
                                <div className="flex items-center text-lg font-bold text-brand-text dark:text-brand-bg leading-brand tracking-brand">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-brand-accent" />
                                    {item.date}
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.remaining_seats > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {item.remaining_seats > 0 ? "報名中" : "已額滿"}
                                </span>
                            </div>

                            <div className="space-y-3 mb-component">
                                <div className="flex items-center text-brand-taupe">
                                    <ClockIcon className="w-5 h-5 mr-2" />
                                    {item.time}
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
                    ))}
                </div>

                <DevComment text="Visit Schedule Desktop Table View" />
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
            </div>

            {/* 註解：報名功能已遷移至 LINE 官方帳號 */}
        </Container>
    );
}
