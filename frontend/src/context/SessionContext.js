import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";

const SessionContext = createContext({
    session: null,
    loading: true,
    refreshSession: () => { },
});

export function SessionProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const data = await authApi.getSession();
            setSession(data.user ? data : null);
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
        // [Note] clientId remains here as it's a public client ID for LINE Login
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
            `nonce=${nonce}&` +
            `bot_prompt=aggressive`;

        window.location.href = authUrl;
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
