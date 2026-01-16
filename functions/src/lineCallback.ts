import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const db = getFirestore();

export default onRequest({
    cors: true,
    region: "asia-east1",
}, async (req, res): Promise<void> => {
    try {
        // 1. 從 URL 獲取 authorization code
        const code = req.query.code as string;

        if (!code) {
            res.status(400).send("Missing authorization code");
        }

        console.log("[LINE Callback] Received code, exchanging for token...");

        // 2. 交換 code 獲取 access token
        const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: `${process.env.WEB_BASE_URL || req.headers.origin}/api/lineCallback`,
                client_id: process.env.LINE_CLIENT_ID as string,
                client_secret: process.env.LINE_CLIENT_SECRET as string,
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error("[LINE Callback] Token exchange failed:", error);
            res.status(500).send("Failed to exchange token");
        }

        const tokens = await tokenResponse.json();
        console.log("[LINE Callback] Token received, fetching profile...");

        // 3. 使用 access token 獲取用戶資料
        const profileResponse = await fetch("https://api.line.me/v2/profile", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        if (!profileResponse.ok) {
            console.error("[LINE Callback] Profile fetch failed");
            res.status(500).send("Failed to fetch profile");
        }

        const profile = await profileResponse.json();
        console.log("[LINE Callback] Profile received:", profile.userId);

        // 4. 創建/更新用戶
        const userRef = db.collection("users").doc(profile.userId);
        const userDoc = await userRef.get();

        const userData = {
            name: profile.displayName,
            email: profile.email || `${profile.userId}@line.user`,
            image: profile.pictureUrl,
            provider: "line",
            providerId: profile.userId,
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (!userDoc.exists) {
            await userRef.set({
                ...userData,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log("[LINE Callback] New user created");
        } else {
            await userRef.update(userData);
            console.log("[LINE Callback] User updated");
        }

        // 5. 創建 session（使用 NextAuth 期望的格式）
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // NextAuth FirestoreAdapter 期望的 session 格式
        await db.collection("sessions").doc(sessionToken).set({
            sessionToken: sessionToken,
            userId: profile.userId,
            expires: Timestamp.fromDate(expiresAt),
        });

        console.log("[LINE Callback] Session created, redirecting...");

        // 6. 設置 session cookie 並重定向 (同時設置 Secure 和 Non-Secure 以確保兼容)
        res.setHeader("Set-Cookie", [
            `next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`,
            `__Secure-next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${expiresAt.toUTCString()}`
        ]);


        const redirectUrl = process.env.WEB_BASE_URL || req.headers.origin;
        res.redirect(`${redirectUrl}/visit`);

    } catch (error: any) {
        console.error("[LINE Callback] Error:", error);
        res.status(500).send("Internal server error");
    }
});

function generateSessionToken(): string {
    return Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join("");
}
