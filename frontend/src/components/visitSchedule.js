import React, { useState, useEffect } from "react";
import { useSession } from "../context/SessionContext";
import liff from "@line/liff"; // Import LIFF SDK
import Container from "./Container";
import { ClockIcon, CalendarIcon, UserGroupIcon, TicketIcon } from "@heroicons/react/outline";
import VisitRegistrationForm from "./VisitRegistrationForm";
import Modal from "./Modal";
import DevComment from "./DevComment";
import Link from "next/link";
import { useRouter } from "next/router";

export default function VisitSchedule() {
    const router = useRouter();
    const { session, loading: sessionLoading, loginWithLine } = useSession();
    const [dates, setDates] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

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

                // Logic: If user is in LINE App (LIFF browser) and NOT logged in to our website,
                // we automatically trigger the login process.
                if (liff.isInClient() && !session && !sessionLoading) {
                    console.log("Auto-login triggered by LIFF context");
                    loginWithLine();
                }
            })
            .catch((err) => {
                console.error("LIFF init failed", err);
            });
    }, [session, sessionLoading]);



    // Format helpers
    const formatSessionDate = (sessionDate) => {
        if (!sessionDate) return "未知日期";
        // If it's a Firestore Timestamp from JSON
        let d;
        if (sessionDate && typeof sessionDate === 'object' && sessionDate._seconds) {
            d = new Date(sessionDate._seconds * 1000);
        } else {
            d = new Date(sessionDate);
        }

        if (isNaN(d.getTime())) return "日期格式錯誤";

        const days = ["日", "一", "二", "三", "四", "五", "六"];
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dayOfWeek = days[d.getDay()];

        return `${year}-${month}-${day} (${dayOfWeek})`;
    };

    const formatSessionTime = (startTime, duration) => {
        if (!startTime) return "---";
        if (!duration) return startTime;

        // Parse start time (HH:mm)
        const parts = startTime.split(':');
        if (parts.length !== 2) return startTime;

        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);

        // Add duration (minutes)
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

        return `${startTime} - ${endHours}:${endMinutes}`;
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
        setIsRegistrationModalOpen(true);
    };

    const closeModal = () => {
        setIsRegistrationModalOpen(false);
        setTimeout(() => setSelectedSession(null), 300);
    };

    const handleFormComplete = async (data) => {
        if (!selectedSession || !session) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/registerVisit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: selectedSession.id,
                    userId: session.user.id,
                    name: data.name,
                    cellphone: data.cellphone,
                    visitors: data.visitors || 1,
                    remark: data.remark || ""
                }),
            });

            if (res.ok) {
                setIsRegistrationModalOpen(false);
                setSelectedSession(null);
                fetchSessions();
                fetchUserRegistrations();
                alert("預約成功！我們已收到您的申請，將會透過 LINE 通知您後續事宜。");
            } else {
                const errorData = await res.json();
                let errMsg = "未知錯誤";
                if (errorData.error === "ALREADY_REGISTERED") {
                    errMsg = "您已經預約過這個場次囉！請查看「我的參訪登記」。";
                } else if (errorData.error === "QUOTA_EXCEEDED") {
                    errMsg = "抱歉，該場次名額已滿。";
                } else {
                    errMsg = errorData.error || "未知錯誤";
                }
                alert(`預約失敗: ${errMsg}`);
            }
        } catch (err) {
            console.error("Failed to register visit:", err);
            alert("系統繁忙中，請稍後再試。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRegistration = async () => {
        if (!selectedRegistration || !cancelReason) {
            alert("請選擇取消原因");
            return;
        }

        setIsCancelling(true);
        try {
            const res = await fetch(`${API_BASE}/cancelRegistration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    registrationId: selectedRegistration.id,
                    reason: cancelReason
                }),
            });

            if (res.ok) {
                setIsCancelModalOpen(false);
                setSelectedRegistration(null);
                setCancelReason("");
                fetchSessions();
                fetchUserRegistrations();
                alert("預約已取消成功。");
            } else {
                const errorData = await res.json();
                alert(`取消失敗: ${errorData.error || "未知錯誤"}`);
            }
        } catch (err) {
            console.error("Failed to cancel registration:", err);
            alert("系統繁忙中，請稍後再試。");
        } finally {
            setIsCancelling(false);
        }
    };

    const openCancelModal = (reg) => {
        setSelectedRegistration(reg);
        setIsCancelModalOpen(true);
    };

    const cancelReasons = [
        "時間突然不方便",
        "行程衝突",
        "已有其他安排",
        "生病或身體不適",
        "其他原因"
    ];

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
        const isRegistered = userRegistrations.some(reg => reg.session_id === item.id);

        if (isRegistered) {
            return (
                <button
                    disabled
                    className="btn btn-disabled w-full sm:w-auto px-6">
                    已預約
                </button>
            );
        }

        if (item.remaining_seats > 0) {
            return (
                <button
                    onClick={() => openModal(item)}
                    className="btn btn-primary w-full sm:w-auto px-6 uppercase tracking-brand">
                    立即預約
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
                                            onClick={() => openCancelModal(reg)}
                                            className="btn btn-ghost btn-sm w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 hover:border-red-300 rounded-full"
                                        >
                                            取消預約
                                        </button>
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
                <Modal
                    title={`預約參訪場次：${formatSessionDate(selectedSession?.date)}`}
                    isOpen={isRegistrationModalOpen}
                    onClose={closeModal}
                >
                    <div className="p-4">
                        {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mb-4"></div>
                                <p className="text-brand-taupe">預約處理中，請稍候...</p>
                            </div>
                        ) : (
                            <VisitRegistrationForm onComplete={handleFormComplete} />
                        )}
                    </div>
                </Modal>

                <Modal
                    title="取消預約"
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    maxWidth="max-w-md"
                >
                    <div className="p-6">
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-brand-text mb-2">
                                場次：{formatSessionDate(selectedRegistration?.session?.date)}
                            </h4>
                            <p className="text-sm text-brand-taupe leading-relaxed">
                                您確定要取消這次的參訪嗎？取消後名額將會釋出。
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            <p className="text-sm font-bold text-brand-text">請選擇取消原因：</p>
                            {cancelReasons.map((reason) => (
                                <label key={reason} className="flex items-center space-x-3 p-3 rounded-xl border border-brand-taupe/10 hover:bg-brand-accent/5 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={cancelReason === reason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="radio radio-primary radio-sm"
                                    />
                                    <span className="text-brand-text text-sm">{reason}</span>
                                </label>
                            ))}
                            {cancelReason === "其他原因" && (
                                <textarea
                                    className="textarea textarea-bordered w-full mt-2 text-sm"
                                    placeholder="請輸入原因..."
                                    rows={2}
                                    onChange={(e) => setCancelReason(`其他：${e.target.value}`)}
                                />
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="btn btn-ghost flex-1 rounded-full"
                            >
                                我再想想
                            </button>
                            <button
                                onClick={handleCancelRegistration}
                                disabled={isCancelling || !cancelReason}
                                className={`btn btn-error flex-1 rounded-full text-white ${isCancelling ? 'loading' : ''}`}
                            >
                                {isCancelling ? '處理中...' : '確認取消'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Container>
    );
}
