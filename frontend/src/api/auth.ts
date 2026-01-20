/**
 * Auth API Service
 * Encapsulates session-related API calls.
 */

const API_BASE = '/api';

async function handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');

    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.status}`);
        }
        return data;
    }

    // Handle non-JSON responses
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${text.substring(0, 100)}`);
    }

    // Try to parse as JSON anyway (for cases where content-type is missing)
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
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
