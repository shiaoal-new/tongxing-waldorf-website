const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// 範例：獲取用戶資料
exports.getUserProfile = onRequest(async (req, res) => {
    const userId = req.query.uid;
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
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// 範例：Auth.js 如果需要在 Firebase Functions 上運行，可以導出一個 handler
// 但通常 Next.js 部署到 Firebase 時會自動處理 API routes。
