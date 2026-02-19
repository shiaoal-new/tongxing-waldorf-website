import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../api/auth";
import { CONFIG } from "../lib/config";

export interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
}

export interface Session {
    user: User;
    expires?: string;
}

export interface SessionContextValue {
    session: Session | null;
    loading: boolean;
    refreshSession: () => void;
    loginWithLine: () => void;
    logout: () => void;
}

const SessionContext = createContext<SessionContextValue>({
    session: null,
    loading: true,
    refreshSession: () => { },
    loginWithLine: () => { },
    logout: () => { },
});

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const data = await authApi.getSession();
            setSession(data && data.user ? data : null);
        } catch (err) {
            console.error("Failed to fetch session:", err);
            setSession(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    const refreshSession = () => {
        setLoading(true);
        fetchSession();
    };

    const loginWithLine = () => {
        window.location.href = authApi.getLineLoginUrl(CONFIG.LINE.CLIENT_ID);
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setSession(null);
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <SessionContext.Provider value={{ session, loading, refreshSession, loginWithLine, logout }}>
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => useContext(SessionContext);
