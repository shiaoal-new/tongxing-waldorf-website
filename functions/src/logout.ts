import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

export default onRequest({
    cors: true,
    region: "asia-east1",
}, async (req, res): Promise<void> => {
    try {
        // 從 cookie 中提取 session token
        const cookies = req.headers.cookie || "";
        const sessionTokenMatch = cookies.match(/(?:__Secure-)?next-auth\.session-token=([^;]+)/);

        if (sessionTokenMatch) {
            const sessionToken = sessionTokenMatch[1];
            // 刪除資料庫中的 session
            await db.collection("sessions").doc(sessionToken).delete();
        }

        // 清除 cookie
        res.setHeader("Set-Cookie", [
            `next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            `__Secure-next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
        ]);

        res.status(200).json({ success: true });

    } catch (error: any) {
        console.error("[logout] Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
