import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

export const authOptions = {
    adapter: FirestoreAdapter(db),
    providers: [
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

export default NextAuth(authOptions);
