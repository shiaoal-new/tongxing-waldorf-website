import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

const appConfig = serviceAccount
    ? { credential: cert(serviceAccount) }
    : {};

if (!getApps().length) {
    initializeApp(appConfig);
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
