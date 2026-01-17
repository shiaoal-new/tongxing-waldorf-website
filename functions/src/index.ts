import { onRequest } from "firebase-functions/v2/https";
import { VisitService } from "./services/visitService.js";

// 獲取參訪場次
export const getvisitsessions = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    try {
        const sessions = await VisitService.getOpenSessions();
        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message || error.toString() });
    }
});

// 初始化場次數據 (測試用)
export const seedvisitsessions = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    const initialDates = [
        { date: new Date("2024-03-15"), start_time: "09:30", duration: 120, remaining_seats: 5, total_seats: 20, order: 1, status: "open" },
        { date: new Date("2024-03-29"), start_time: "09:30", duration: 120, remaining_seats: 12, total_seats: 20, order: 2, status: "open" },
        { date: new Date("2024-04-12"), start_time: "09:30", duration: 120, remaining_seats: 0, total_seats: 20, order: 3, status: "open" },
        { date: new Date("2024-04-26"), start_time: "09:30", duration: 120, remaining_seats: 8, total_seats: 20, order: 4, status: "open" }
    ];

    try {
        // [Note] Seeding logic remains in function for now as it's a dev utility
        const { db } = await import("./utils/firebase.js");
        const batch = db.batch();
        initialDates.forEach((data) => {
            const ref = db.collection("visit_sessions").doc();
            batch.set(ref, data);
        });
        await batch.commit();
        res.status(200).json({ success: true, message: "Seeding successful", count: initialDates.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 提交預約報名
export const registervisit = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { sessionId, userId, name, cellphone, visitors, remark } = req.body;

    if (!sessionId || !userId || !name || !cellphone) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        await VisitService.registerVisit(sessionId, userId, { name, cellphone, visitors, remark });
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({ error: error.message });
    }
});


// LINE Webhook handler
export * from "./lineWebhook.js";

// User Registrations handler
export * from "./userRegistrations.js";

// LINE OAuth Callback handler
export { default as lineCallback } from "./lineCallback.js";

export { default as getSession } from "./getSession.js";
export { default as logout } from "./logout.js";
