import NextAuth from "next-auth"
import LineProvider from "next-auth/providers/line"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { adminDb } from "./lib/firebase-admin"

export const authOptions = {
    adapter: FirestoreAdapter(adminDb),
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET,
            authorization: {
                params: {
                    bot_prompt: "normal",
                    scope: "profile openid email",
                },
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id
            }
            return session
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as handlers, handler as default }

