/**
 * Visit API Service
 * Encapsulates all visit-related API calls with unified error handling.
 */

const API_BASE = '/api';

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
    }
    return data;
}

export const visitApi = {
    /**
     * Get all open visit sessions
     */
    getSessions: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE}/getVisitSessions`);
        return handleResponse(response);
    },

    /**
     * Register for a visit session
     */
    register: async (sessionId: string, userId: string, formData: any): Promise<any> => {
        const response = await fetch(`${API_BASE}/registerVisit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                userId,
                ...formData
            })
        });
        return handleResponse(response);
    },

    /**
     * Get user's current registrations
     */
    getUserRegistrations: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE}/getUserRegistrations`);
        return handleResponse(response);
    },

    /**
     * Cancel a registration
     */
    cancelRegistration: async (registrationId: string, reason: string): Promise<any> => {
        const response = await fetch(`${API_BASE}/cancelRegistration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId, reason })
        });
        return handleResponse(response);
    }
};
