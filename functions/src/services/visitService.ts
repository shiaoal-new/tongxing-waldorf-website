import { db, FieldValue } from "../utils/firebase";

export class VisitService {
    static async getOpenSessions() {
        const snapshot = await db.collection("visit_sessions")
            .where("status", "==", "open")
            .orderBy("date", "asc")
            .orderBy("order", "asc")
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async getUserRegistrations(userId: string) {
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

        return registrations.sort((a, b) => {
            const tA = a.timestamp?._seconds || 0;
            const tB = b.timestamp?._seconds || 0;
            return tB - tA;
        });
    }

    static async registerVisit(sessionId: string, userId: string, data: any) {
        const visitorCount = parseInt(data.visitors || 1);

        return await db.runTransaction(async (transaction) => {
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

            // Check if already registered
            const existingRegQuery = db.collection("visit_registrations")
                .where("session_id", "==", sessionId)
                .where("user_id", "==", userId)
                .where("status", "==", "confirmed")
                .limit(1);

            const existingRegs = await transaction.get(existingRegQuery);
            if (!existingRegs.empty) {
                throw new Error("ALREADY_REGISTERED");
            }

            // Update seats
            transaction.update(sessionRef, {
                remaining_seats: remainingSeats - visitorCount
            });

            // Create registration
            const registrationRef = db.collection("visit_registrations").doc();
            transaction.set(registrationRef, {
                session_id: sessionId,
                user_id: userId,
                name: data.name,
                cellphone: data.cellphone,
                visitors: visitorCount,
                remark: data.remark || "",
                timestamp: new Date(),
                status: "confirmed"
            });

            return registrationRef.id;
        });
    }

    static async cancelRegistration(registrationId: string, userId: string, reason: string) {
        return await db.runTransaction(async (transaction) => {
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

            // Update registration status
            transaction.update(regRef, {
                status: "cancelled",
                cancel_reason: reason || "未提供原因",
                cancelled_at: new Date()
            });

            // Return seats
            const sessionRef = db.collection("visit_sessions").doc(sessionId);
            transaction.update(sessionRef, {
                remaining_seats: FieldValue.increment(visitors)
            });

            return true;
        });
    }
}
