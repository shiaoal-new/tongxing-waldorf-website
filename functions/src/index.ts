import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

// 獲取參訪場次
export const getvisitsessions = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
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
export const seedvisitsessions = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    console.log("seedvisitsessions called");
    const initialDates = [
        { date: "2024-03-15 (五)", time: "09:30 - 11:30", remaining_seats: 5, total_seats: 20, order: 1, status: "open" },
        { date: "2024-03-29 (五)", time: "09:30 - 11:30", remaining_seats: 12, total_seats: 20, order: 2, status: "open" },
        { date: "2024-04-12 (五)", time: "09:30 - 11:30", remaining_seats: 0, total_seats: 20, order: 3, status: "open" },
        { date: "2024-04-26 (五)", time: "09:30 - 11:30", remaining_seats: 8, total_seats: 20, order: 4, status: "open" }
    ];

    try {
        console.log("Creating batch write...");
        const batch = db.batch();
        initialDates.forEach((data) => {
            const ref = db.collection("visit_sessions").doc();
            console.log("Adding document to batch:", ref.id);
            batch.set(ref, data);
        });
        console.log("Committing batch...");
        await batch.commit();
        console.log("Batch committed successfully");
        res.status(200).json({ success: true, message: "Seeding successful", count: initialDates.length });
    } catch (error: any) {
        console.error("Error in seedvisitsessions:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            error: error.message || error.toString(),
            code: error.code,
            details: error.details || "No details available"
        });
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

            // 檢查是否已經預約過且狀態為已確認
            const existingRegQuery = db.collection("visit_registrations")
                .where("session_id", "==", sessionId)
                .where("user_id", "==", userId)
                .where("status", "==", "confirmed")
                .limit(1);

            const existingRegs = await transaction.get(existingRegQuery);
            if (!existingRegs.empty) {
                throw new Error("ALREADY_REGISTERED");
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
                remark: remark || "",
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


// LINE Webhook handler
export * from "./lineWebhook.js";

// User Registrations handler
export * from "./userRegistrations.js";

// LINE OAuth Callback handler
export { default as lineCallback } from "./lineCallback.js";

export { default as getSession } from "./getSession.js";
export { default as logout } from "./logout.js";
