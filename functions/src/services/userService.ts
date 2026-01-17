import { db, FieldValue, Timestamp } from "../utils/firebase";

export class UserService {
    static async getUserByLineId(lineUserId: string) {
        const userQuery = await db.collection("users")
            .where("lineUserId", "==", lineUserId)
            .limit(1)
            .get();

        if (userQuery.empty) return null;
        return { id: userQuery.docs[0].id, ...userQuery.docs[0].data() };
    }

    static async createOrUpdateUserFromLine(profile: any) {
        const userRef = db.collection("users").doc(profile.userId);
        const userDoc = await userRef.get();

        const userData: any = {
            name: profile.displayName,
            email: profile.email || `${profile.userId}@line.user`,
            image: profile.pictureUrl,
            provider: "line",
            providerId: profile.userId,
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (!userDoc.exists) {
            userData.createdAt = FieldValue.serverTimestamp();
            await userRef.set(userData);
        } else {
            await userRef.update(userData);
        }

        return { id: profile.userId, ...userData };
    }

    static async createSession(userId: string, tokens: any) {
        const sessionToken = this.generateSessionToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await db.collection("sessions").doc(sessionToken).set({
            sessionToken: sessionToken,
            userId: userId,
            expires: Timestamp.fromDate(expiresAt),
        });

        return { sessionToken, expiresAt };
    }

    static async getSession(sessionToken: string) {
        const sessionDoc = await db.collection("sessions").doc(sessionToken).get();
        if (!sessionDoc.exists) return null;

        const sessionData = sessionDoc.data();
        if (!sessionData) return null;

        if (sessionData.expires && sessionData.expires.toDate() < new Date()) {
            return null;
        }

        const userDoc = await db.collection("users").doc(sessionData?.userId).get();
        if (!userDoc.exists) return null;

        return {
            user: { id: userDoc.id, ...userDoc.data() },
            expires: sessionData.expires.toDate()
        };
    }

    static async createFollower(userId: string, profile: any) {
        // Check if user already exists
        const existingUser = await this.getUserByLineId(userId);
        if (existingUser) return existingUser;

        const newUserRef = db.collection("users").doc();
        const userData = {
            name: profile.displayName,
            image: profile.pictureUrl,
            lineUserId: userId,
            provider: "line-webhook",
            createdAt: FieldValue.serverTimestamp(),
        };

        await newUserRef.set(userData);

        await db.collection("accounts").add({
            userId: newUserRef.id,
            type: "oauth",
            provider: "line",
            providerAccountId: userId,
            createdAt: FieldValue.serverTimestamp(),
        });

        return { id: newUserRef.id, ...userData };
    }

    static async deleteSession(sessionToken: string) {
        await db.collection("sessions").doc(sessionToken).delete();
    }

    private static generateSessionToken(): string {
        return Array.from({ length: 32 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join("");
    }
}
