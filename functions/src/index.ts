import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

// 獲取參訪場次
export const getVisitSessions = onRequest({ cors: true }, async (req, res) => {
    try {
        const snapshot = await db.collection("visit_sessions")
            .where("status", "==", "open")
            .orderBy("order", "asc")
            .get();

        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message || error.toString() });
    }
});

// 初始化場次數據 (測試用)
export const seedVisitSessions = onRequest({ cors: true }, async (req, res) => {
    const initialDates = [
        { date: "2024-03-15 (五)", time: "09:30 - 11:30", remaining_seats: 5, total_seats: 20, order: 1, status: "open" },
        { date: "2024-03-29 (五)", time: "09:30 - 11:30", remaining_seats: 12, total_seats: 20, order: 2, status: "open" },
        { date: "2024-04-12 (五)", time: "09:30 - 11:30", remaining_seats: 0, total_seats: 20, order: 3, status: "open" },
        { date: "2024-04-26 (五)", time: "09:30 - 11:30", remaining_seats: 8, total_seats: 20, order: 4, status: "open" }
    ];

    try {
        const batch = db.batch();
        initialDates.forEach((data) => {
            const ref = db.collection("visit_sessions").doc();
            batch.set(ref, data);
        });
        await batch.commit();
        res.status(200).json({ success: true, message: "Seeding successful" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || error.toString() });
    }
});

// 提交預約報名
export const registerVisit = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { sessionId, userId, name, cellphone, visitors } = req.body;

    if (!sessionId || !userId || !name || !cellphone) {
        res.status(400).send('Missing required fields');
        return;
    }

    const visitorCount = parseInt(visitors || 1);

    try {
        await db.runTransaction(async (transaction) => {
            const sessionRef = db.collection("visit_sessions").doc(sessionId);
            const sessionDoc = await transaction.get(sessionRef);

            if (!sessionDoc.exists) {
                throw new Error("SESSION_NOT_FOUND");
            }

            const sessionData = sessionDoc.data();
            const remainingSeats = sessionData?.remaining_seats || 0;

            if (remainingSeats < visitorCount) {
                throw new Error("QUOTA_EXCEEDED");
            }

            // 更新名額
            transaction.update(sessionRef, {
                remaining_seats: remainingSeats - visitorCount
            });

            // 建立報名流水紀錄
            const registrationRef = db.collection("visit_registrations").doc();
            transaction.set(registrationRef, {
                session_id: sessionId,
                user_id: userId,
                name,
                cellphone,
                visitors: visitorCount,
                timestamp: new Date(),
                status: "confirmed"
            });
        });

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Auth.js handler
export { default as auth } from "./auth.js";

// LINE Webhook handler
export * from "./lineWebhook.js";
