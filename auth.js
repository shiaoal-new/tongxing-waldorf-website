import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { adminDb } from "./lib/firebase-admin"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: FirestoreAdapter(adminDb),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id
            return session
        },
    },
})
