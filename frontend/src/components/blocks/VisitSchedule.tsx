import React, { useState, useEffect } from "react";
import { useSession } from "../../context/SessionContext";
import liff from "@line/liff"; // Import LIFF SDK
import Container from "../ui/Container";
import { ClockIcon, CalendarIcon, TicketIcon } from "@heroicons/react/outline";
import dynamic from "next/dynamic";
import Modal from "../ui/Modal";
import DevComment from "../ui/DevComment";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatSessionDate, formatSessionTime } from "../../lib/formatters";

const VisitRegistrationForm = dynamic(() => import("./VisitRegistrationForm"), {
    loading: () => <div className="p-12 text-center text-gray-500">Loading form...</div>,
    ssr: false,
});

import { visitApi } from "../../api/visit";

// Modularized Components
import RegistrationCard from "./VisitSchedule/RegistrationCard";
import SessionCard from "./VisitSchedule/SessionCard";
import SessionTable from "./VisitSchedule/SessionTable";
import CancelModal from "./VisitSchedule/CancelModal";

export default function VisitSchedule() {
    const router = useRouter();
    const { session, loading: sessionLoading, loginWithLine } = useSession() as any;
    const [dates, setDates] = useState<any[]>([]);
    const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await (visitApi as any).getSessions();
            if (data) setDates(data);
        } catch (err: any) {
            console.error("Failed to fetch sessions:", err);
            setError("暫時無法連線至預約系統，請確認後端服務是否已啟動。");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserRegistrations = async () => {
        if (!session) return;
        try {
            const data = await (visitApi as any).getUserRegistrations();
            setUserRegistrations(data);
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



    // Formatters are now imported from ../lib/formatters

    // Handle "manage" mode from LINE Bot (Legacy/Web fallback)
    useEffect(() => {
        // If not in LIFF (e.g. external browser) but mode=manage is present, also trigger login
        if (router.query.mode === 'manage' && !session && !isLoading) {
            loginWithLine();
        }
    }, [router.query, session, isLoading]);

    const openModal = (sessionObj: any) => {
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

    const handleFormComplete = async (data: any) => {
        if (!selectedSession || !session) return;

        setIsSubmitting(true);
        try {
            await (visitApi as any).register(selectedSession.id, session.user.id, {
                name: data.name,
                cellphone: data.cellphone,
                visitors: data.visitors || 1,
                remark: data.remark || ""
            });

            setIsRegistrationModalOpen(false);
            setSelectedSession(null);
            fetchSessions();
            fetchUserRegistrations();
            alert("預約成功！我們已收到您的申請，將會透過 LINE 通知您後續事宜。");
        } catch (err: any) {
            console.error("Failed to register visit:", err);
            let errMsg = err.message;
            if (errMsg === "ALREADY_REGISTERED") {
                errMsg = "您已經預約過這個場次囉！請查看「我的參訪登記」。";
            } else if (errMsg === "QUOTA_EXCEEDED") {
                errMsg = "抱歉，該場次名額已滿。";
            }
            alert(`預約失敗: ${errMsg}`);
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
            await (visitApi as any).cancelRegistration(selectedRegistration.id, cancelReason);

            setIsCancelModalOpen(false);
            setSelectedRegistration(null);
            setCancelReason("");
            fetchSessions();
            fetchUserRegistrations();
            alert("預約已取消成功。");
        } catch (err: any) {
            console.error("Failed to cancel registration:", err);
            alert(`取消失敗: ${err.message}`);
        } finally {
            setIsCancelling(false);
        }
    };

    const openCancelModal = (reg: any) => {
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

    const LINE_OA_ID = process.env.NEXT_PUBLIC_LINE_OA_ID;
    const LINE_OA_URL = `https://line.me/R/ti/p/${LINE_OA_ID}`;

    const redirectToLine = () => {
        window.open(LINE_OA_URL, "_blank");
    };

    const renderButton = (item: any) => {
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
                                <RegistrationCard
                                    key={reg.id}
                                    reg={reg}
                                    formatSessionDate={formatSessionDate}
                                    formatSessionTime={formatSessionTime}
                                    onCancel={openCancelModal}
                                />
                            ))}
                        </div>
                        <div className="my-8 border-b border-brand-taupe/10"></div>
                    </div>
                )}


                <DevComment text="Visit Schedule Mobile Cards View" />
                {/* Mobile View: Cards */}

                <div className="block md:hidden space-y-component">
                    {dates.map((item) => (
                        <SessionCard
                            key={item.id}
                            item={item}
                            formatSessionDate={formatSessionDate}
                            formatSessionTime={formatSessionTime}
                            renderButton={renderButton}
                        />
                    ))}
                </div>

                <DevComment text="Visit Schedule Desktop Table View" />
                {/* Desktop View: Table */}

                <SessionTable
                    dates={dates}
                    formatSessionDate={formatSessionDate}
                    formatSessionTime={formatSessionTime}
                    renderButton={renderButton}
                />

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

                <CancelModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    selectedRegistration={selectedRegistration}
                    formatSessionDate={formatSessionDate}
                    cancelReasons={cancelReasons}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onConfirm={handleCancelRegistration}
                    isCancelling={isCancelling}
                />
            </div>
        </Container>
    );
}
