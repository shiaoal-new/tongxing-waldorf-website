
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

// Helper to parse cookies
const parseCookies = (cookieHeader: string) => {
    const list: any = {};
    if (!cookieHeader) return list;
    cookieHeader.split(";").forEach(function (cookie) {
        let [name, ...rest] = cookie.split("=");
        name = name?.trim();
        if (!name) return;
        const value = rest.join("=").trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}

// 獲取使用者已登記的參訪
export const getuserregistrations = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    try {
        const cookies = parseCookies(req.headers.cookie || "");
        const sessionToken = cookies["__Secure-next-auth.session-token"] || cookies["next-auth.session-token"];

        if (!sessionToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const sessionQuery = await db.collection("sessions").where("sessionToken", "==", sessionToken).limit(1).get();
        if (sessionQuery.empty) {
            res.status(401).json({ error: "Invalid session" });
            return;
        }

        const userId = sessionQuery.docs[0].data().userId;

        const regQuery = await db.collection("visit_registrations")
            .where("user_id", "==", userId)
            .where("status", "==", "confirmed")
            .get();

        const registrations: any[] = [];
        for (const doc of regQuery.docs) {
            const reg = doc.data();
            const sessionDoc = await db.collection("visit_sessions").doc(reg.session_id).get();
            if (sessionDoc.exists) {
                registrations.push({
                    ...reg,
                    id: doc.id,
                    session: sessionDoc.data()
                });
            }
        }

        // In-memory sort by timestamp descend (newest first)
        registrations.sort((a, b) => {
            const tA = a.timestamp?._seconds || 0;
            const tB = b.timestamp?._seconds || 0;
            return tB - tA;
        });

        res.status(200).json(registrations);
    } catch (error: any) {
        console.error("Error fetching user registrations:", error);
        res.status(500).json({ error: error.message });
    }
});

// 取消參訪預約
export const cancelregistration = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { registrationId, reason } = req.body;

    if (!registrationId) {
        res.status(400).json({ error: 'Missing registrationId' });
        return;
    }

    try {
        const cookies = parseCookies(req.headers.cookie || "");
        const sessionToken = cookies["__Secure-next-auth.session-token"] || cookies["next-auth.session-token"];

        if (!sessionToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const sessionQuery = await db.collection("sessions").where("sessionToken", "==", sessionToken).limit(1).get();
        if (sessionQuery.empty) {
            res.status(401).json({ error: "Invalid session" });
            return;
        }

        const userId = sessionQuery.docs[0].data().userId;

        await db.runTransaction(async (transaction) => {
            const regRef = db.collection("visit_registrations").doc(registrationId);
            const regDoc = await transaction.get(regRef);

            if (!regDoc.exists) {
                throw new Error("REGISTRATION_NOT_FOUND");
            }

            const regData = regDoc.data();
            if (regData?.user_id !== userId) {
                throw new Error("UNAUTHORIZED_ACTION");
            }

            if (regData?.status === "cancelled") {
                throw new Error("ALREADY_CANCELLED");
            }

            const sessionId = regData?.session_id;
            const visitors = regData?.visitors || 0;

            // 更新預約狀態
            transaction.update(regRef, {
                status: "cancelled",
                cancel_reason: reason || "未提供原因",
                cancelled_at: new Date()
            });

            // 返還名額
            const sessionRef = db.collection("visit_sessions").doc(sessionId);
            transaction.update(sessionRef, {
                remaining_seats: FieldValue.increment(visitors)
            });
        });

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Cancel registration error:", error);
        res.status(500).json({ error: error.message });
    }
});
