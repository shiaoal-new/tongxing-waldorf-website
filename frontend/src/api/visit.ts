/**
 * Visit API Service
 * Encapsulates all visit-related API calls with unified error handling.
 */

import { handleResponse } from './utils';

const API_BASE = '/api';

export interface VisitSession {
    id: string;
    title: string;
    date: string;
    capacity: number;
    registeredCount: number;
    location?: string;
    description?: string;
}

export interface Registration {
    id: string;
    sessionId: string;
    userId: string;
    status: 'confirmed' | 'cancelled' | 'pending';
    createdAt: string;
    session?: VisitSession;
}

export interface VisitFormData {
    name: string;
    phone: string;
    email: string;
    count: number;
    remark?: string;
    [key: string]: any;
}

export const visitApi = {
    /**
     * Get all open visit sessions
     */
    getSessions: async (): Promise<VisitSession[]> => {
        const response = await fetch(`${API_BASE}/getVisitSessions`);
        return handleResponse(response);
    },

    /**
     * Register for a visit session
     */
    register: async (sessionId: string, userId: string, formData: VisitFormData): Promise<{ success: boolean; registration: Registration }> => {
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
    getUserRegistrations: async (): Promise<Registration[]> => {
        const response = await fetch(`${API_BASE}/getUserRegistrations`);
        return handleResponse(response);
    },

    /**
     * Cancel a registration
     */
    cancelRegistration: async (registrationId: string, reason: string): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_BASE}/cancelRegistration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId, reason })
        });
        return handleResponse(response);
    }
};
