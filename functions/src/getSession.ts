import { onRequest } from "firebase-functions/v2/https";
import { db } from "./utils/firebase";

export default onRequest({
    cors: true,
    region: "asia-east1",
}, async (req, res): Promise<void> => {
    try {
        // 從 cookie 中提取 session token
        const cookies = req.headers.cookie || "";
        const sessionTokenMatch = cookies.match(/(?:__Secure-)?next-auth\.session-token=([^;]+)/);

        if (!sessionTokenMatch) {
            res.status(200).json({ user: null });
            return;
        }

        const sessionToken = sessionTokenMatch[1];
        console.log(`[getSession] Looking up session: ${sessionToken}`);

        // 查詢 session
        const sessionDoc = await db.collection("sessions").doc(sessionToken).get();

        if (!sessionDoc.exists) {
            console.log(`[getSession] Session not found`);
            res.status(200).json({ user: null });
            return;
        }

        const sessionData = sessionDoc.data();

        // 檢查是否過期
        if (sessionData?.expires && sessionData.expires.toDate() < new Date()) {
            console.log(`[getSession] Session expired`);
            res.status(200).json({ user: null });
            return;
        }

        // 獲取用戶資料
        const userId = sessionData?.userId;
        if (!userId) {
            console.log(`[getSession] No userId in session`);
            res.status(200).json({ user: null });
            return;
        }

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            console.log(`[getSession] User not found`);
            res.status(200).json({ user: null });
            return;
        }

        const userData = userDoc.data();
        console.log(`[getSession] Session valid for user: ${userId}`);

        // 返回 session 資料（格式與 NextAuth 兼容）
        res.status(200).json({
            user: {
                id: userId,
                name: userData?.name,
                email: userData?.email,
                image: userData?.image,
            },
            expires: sessionData.expires.toDate().toISOString(),
        });

    } catch (error: any) {
        console.error("[getSession] Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
