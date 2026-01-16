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

// 將 authOptions 改為函數，確保在執行時才讀取環境變數
function getAuthOptions() {
    return {
        adapter: FirestoreAdapter(db),
        trustHost: true,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "9b1d9d9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e",
        debug: true, // 啟用 debug 模式
        skipCSRFCheck: true, // 跳過 CSRF 檢查（用於直接 OAuth）

        logger: {
            error(code: any, metadata: any) {
                console.error(`[NextAuth Error] ${code}`, metadata);
            },
            warn(code: any) {
                console.warn(`[NextAuth Warn] ${code}`);
            },
            debug(code: any, metadata: any) {
                console.log(`[NextAuth Debug] ${code}`, metadata);
            }
        },
        providers: [
            LineProvider({
                clientId: process.env.LINE_CLIENT_ID as string,
                clientSecret: process.env.LINE_CLIENT_SECRET as string,
                issuer: "https://access.line.me",
                wellKnown: "https://access.line.me/.well-known/openid-configuration",
                checks: ["none"], // 禁用 state 檢查（因為我們使用直接 OAuth）

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
        // 在本地開發環境下關閉 secure cookies 以避免 CSRF 驗證失敗
        useSecureCookies: false,
        callbacks: {
            async session({ session, user }: any) {
                if (session.user && user) {
                    session.user.id = user.id;
                }
                return session;
            },
        },
    };
}

// 為了向後兼容，導出一個 getter
export const authOptions: any = new Proxy({} as any, {
    get(target, prop) {
        return getAuthOptions()[prop as keyof ReturnType<typeof getAuthOptions>];
    }
});

// 確保環境變數在最外層生效
export default onRequest({
    cors: true,
    region: "asia-east1",
}, async (req: any, res: any) => {
    // 確保環境變數在請求處理時生效
    // 如果是在 Emulator 運行且有設定 WEB_BASE_URL (例如 Ngrok)，則優先使用之
    if (process.env.WEB_BASE_URL) {
        process.env.NEXTAUTH_URL = `${process.env.WEB_BASE_URL}/api/auth`;
    } else if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
        // 優先檢查 Firebase 環境，如果是部署環境則自動設定
        const projectId = process.env.GCLOUD_PROJECT || (process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG!).projectId : "tongxing-waldorf-website-dev");
        process.env.NEXTAUTH_URL = `https://${projectId}.web.app/api/auth`;
    }

    // 在請求時檢查環境變數（POST signin 時）
    if (req.method === 'POST' && req.url?.includes('/signin/line')) {
        console.log(`[Auth] Runtime Check - LINE_CLIENT_ID: ${process.env.LINE_CLIENT_ID || 'MISSING'} | SECRET: ${process.env.LINE_CLIENT_SECRET ? 'SET' : 'MISSING'}`);
    }

    // 1. 強力解析路徑片段 (由 URL 提取以精確控制)
    const urlStr = req.url || "";
    // 移除 query string 只看路徑
    const urlPath = urlStr.split('?')[0];
    const pathSegments = urlPath.split('/').filter(Boolean);

    // 尋找 'auth' 之後的部分，例如 /api/auth/signin -> ["signin"]
    const authStart = pathSegments.lastIndexOf('auth');
    const nextauth = authStart !== -1 ? pathSegments.slice(authStart + 1) : pathSegments;
    const action = nextauth[0];

    // 2. 超核心修正：使用 Proxy 攔截屬性
    const proxyReq = new Proxy(req, {
        get(target, prop) {
            if (prop === 'query') return { ...target.query, nextauth };
            if (prop === 'action') return action;
            if (prop === 'url') {
                const search = urlStr.includes('?') ? '?' + urlStr.split('?')[1] : '';
                return '/' + nextauth.join('/') + search;
            }
            if (prop === 'headers') {
                const headers = { ...target.headers };
                if (process.env.WEB_BASE_URL) {
                    try {
                        const baseUrl = new URL(process.env.WEB_BASE_URL);
                        // 強制覆寫 host 讓 NextAuth 認為它直接運行在外部網址
                        headers['host'] = baseUrl.host;
                        headers['x-forwarded-host'] = baseUrl.host;
                        headers['x-forwarded-proto'] = "https";
                    } catch (e) { }
                }
                return headers;
            }
            const value = target[prop];
            return typeof value === 'function' ? value.bind(target) : value;
        }
    });

    // 關鍵診斷日誌
    const hasCookie = !!req.headers.cookie;
    const hasBody = !!req.body && Object.keys(req.body).length > 0;
    console.log(`[Auth] ${req.method} ${proxyReq.url} | Cookie: ${hasCookie} | Body: ${hasBody} | Host: ${proxyReq.headers['host']}`);

    // 提取 CSRF token 進行診斷
    if (req.method === 'POST' && action === 'signin') {
        let csrfFromCookie = '';
        let csrfFromBody = '';
        if (req.headers.cookie) {
            const match = req.headers.cookie.match(/next-auth\.csrf-token=([^;]+)/);
            if (match) csrfFromCookie = decodeURIComponent(match[1]).split('|')[0];
        }
        if (req.body && req.body.csrfToken) {
            csrfFromBody = req.body.csrfToken;
        }
        if (csrfFromCookie || csrfFromBody) {
            console.log(`[Auth] CSRF Debug - Cookie: "${csrfFromCookie.substring(0, 30)}..." | Body: "${csrfFromBody.substring(0, 30)}..." | Match: ${csrfFromCookie === csrfFromBody}`);
        }

        // 詳細記錄 body 內容
        console.log(`[Auth] Body Keys: ${Object.keys(req.body || {}).join(', ')}`);
        console.log(`[Auth] Body callbackUrl: ${req.body?.callbackUrl}`);
        console.log(`[Auth] Body json: ${req.body?.json}`);
    }

    // 3. 調用 NextAuth
    try {
        const result = await NextAuth(proxyReq, res, getAuthOptions());

        // 詳細記錄回應狀態
        console.log(`[Auth] Response: ${res.statusCode} | HeadersSent: ${res.headersSent}`);

        // 記錄重定向資訊
        if (res.statusCode >= 300 && res.statusCode < 400) {
            const location = res.getHeader('location');
            console.log(`[Auth] Redirect -> ${location}`);
        }

        // 如果是 POST signin 但沒有重定向，這是異常的
        if (req.method === 'POST' && action === 'signin' && res.statusCode === 200) {
            console.log(`[Auth] WARNING: POST signin returned 200 instead of redirect!`);
        }

        return result;
    } catch (error: any) {
        console.error("[AuthError]", error.message, error.stack);
        if (!res.headersSent) {
            res.status(500).json({ error: "Auth Error" });
        }
    }
});
