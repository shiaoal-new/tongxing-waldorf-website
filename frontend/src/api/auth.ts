/**
 * Auth API Service
 * Encapsulates session-related API calls.
 */

const API_BASE = '/api';

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
    }
    return data;
}

export const authApi = {
    /**
     * Get current session
     */
    getSession: async (): Promise<any> => {
        const response = await fetch(`${API_BASE}/getSession`);
        return handleResponse(response);
    },

    /**
     * Logout user
     */
    logout: async (): Promise<any> => {
        const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST'
        });
        return handleResponse(response);
    }
};
