import NextAuthImport from "next-auth";
import LineProviderImport from "next-auth/providers/line";
import GoogleProviderImport from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

export const authOptions = {
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

import { onRequest } from "firebase-functions/v2/https";
export default onRequest({
    // Optional: add CORS or other settings
    cors: true,
}, (req, res) => {
    // Auth.js expects a standard Request/Response or a specialized object
    // For Firebase Functions v2, it's basically Express req/res
    return NextAuth(authOptions)(req, res);
});
