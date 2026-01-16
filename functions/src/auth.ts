import NextAuthImport from "next-auth";
import LineProviderImport from "next-auth/providers/line";
import GoogleProviderImport from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

// 處理 ESM 導入
// @ts-ignore
const NextAuth = NextAuthImport.default || NextAuthImport;
// @ts-ignore
const LineProvider = LineProviderImport.default || LineProviderImport;
// @ts-ignore
const GoogleProvider = GoogleProviderImport.default || GoogleProviderImport;

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

export const authOptions: any = {
    adapter: FirestoreAdapter(db),
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID as string,
            clientSecret: process.env.LINE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    bot_prompt: "normal",
                    scope: "profile openid email",
                },
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ session, user }: any) {
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

// 確保環境變數在最外層生效
// 確保環境變數在最外層生效
// 如果是在 Emulator 運行且有設定 WEB_BASE_URL (例如 Ngrok)，則優先使用之
if (process.env.FUNCTIONS_EMULATOR === "true" && process.env.WEB_BASE_URL) {
    process.env.NEXTAUTH_URL = `${process.env.WEB_BASE_URL}/api/auth`;
} else if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    // 優先檢查 Firebase 環境，如果是部署環境則自動設定
    const projectId = process.env.GCLOUD_PROJECT || (process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG!).projectId : "tongxing-waldorf-website-dev");
    process.env.NEXTAUTH_URL = `https://${projectId}.web.app/api/auth`;
}

export default onRequest({
    cors: true,
    region: "asia-east1",
}, async (req: any, res: any) => {
    // 1. 強力解析路徑片段 (由 URL 提取以精確控制)
    const urlStr = req.url || "";
    // 移除 query string 只看路徑
    const urlPath = urlStr.split('?')[0];
    const pathSegments = urlPath.split('/').filter(Boolean);

    // 尋找 'auth' 之後的部分，例如 /api/auth/signin -> ["signin"]
    const authStart = pathSegments.lastIndexOf('auth');
    const nextauth = authStart !== -1 ? pathSegments.slice(authStart + 1) : pathSegments;
    const action = nextauth[0];

    // 2. 超核心修正：使用 Proxy 欄截屬性
    // 這能繞過 Firebase 對象的唯讀限制，並確保 NextAuth 核心能讀到 action 和 query
    const proxyReq = new Proxy(req, {
        get(target, prop) {
            if (prop === 'query') {
                return { ...target.query, nextauth };
            }
            if (prop === 'action') {
                return action;
            }
            // 處理 Express 請求物件中的函數綁定
            const value = target[prop];
            return typeof value === 'function' ? value.bind(target) : value;
        }
    });

    console.log(`[AuthProxy] ${req.method} ${req.url} -> action: ${action}, nextauth: ${JSON.stringify(nextauth)}`);

    // 3. 調用 NextAuth
    try {
        // 傳入 Proxy 過的請求
        return await NextAuth(proxyReq, res, authOptions);
    } catch (error: any) {
        console.error("[AuthError] Fatal Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Auth Error", message: error.message });
        }
    }
});
