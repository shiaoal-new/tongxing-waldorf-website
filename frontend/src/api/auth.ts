/**
 * Auth API Service
 * Encapsulates session-related API calls.
 */

import { handleResponse } from './utils';
import { Session } from '../context/SessionContext';

const API_BASE = '/api';

export const authApi = {
    /**
     * Get current session
     */
    getSession: async (): Promise<Session | null> => {
        const response = await fetch(`${API_BASE}/getSession`);
        return handleResponse(response);
    },

    /**
     * Logout user
     */
    logout: async (): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST'
        });
        return handleResponse(response);
    },

    /**
     * Generate LINE Login URL and set required cookies
     */
    getLineLoginUrl: (clientId: string): string => {
        const baseUrl = window.location.origin;
        const redirectUri = encodeURIComponent(`${baseUrl}/api/lineCallback`);
        const state = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 15);

        // 設置 NextAuth 期望的 state cookie
        document.cookie = `next-auth.state=${state}; path=/; samesite=lax`;

        return `https://access.line.me/oauth2/v2.1/authorize?` +
            `response_type=code&` +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `state=${state}&` +
            `scope=profile%20openid%20email&` +
            `nonce=${nonce}&` +
            `bot_prompt=aggressive`;
    }
};
