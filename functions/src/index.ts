import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// 範例：獲取用戶資料
export const getUserProfile = onRequest(async (req, res) => {
    const userId = req.query.uid as string;
    if (!userId) {
        res.status(400).send("Missing userId");
        return;
    }

    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).send("User not found");
        } else {
            res.status(200).json(userDoc.data());
        }
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

// Auth.js handler
export { default as auth } from "./auth";
