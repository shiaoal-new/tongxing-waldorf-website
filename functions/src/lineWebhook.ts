import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
    messagingApi,
    validateSignature,
    WebhookEvent,
    FollowEvent,
    PostbackEvent,
    MessageEvent
} from "@line/bot-sdk";

// 初始化 Firebase Admin
if (!getApps().length) {
    initializeApp();
}
const db = getFirestore();

// 移除全域 config，改在函數執行時獲取，以支援正式環境的 Secrets

/**
 * LINE Webhook 進入點
 */
export const lineWebhook = onRequest({
    cors: true,
    region: "asia-east1",
    secrets: ["LINE_MESSAGING_CHANNEL_SECRET", "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN"]
}, async (req: any, res: any) => {
    // 獲取設定
    const config = {
        channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || "",
        channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET || "",
    };

    const client = new messagingApi.MessagingApiClient({
        channelAccessToken: config.channelAccessToken
    });

    // LINE Webhook 的原始 body 需要用字串驗簽
    const signature = req.headers["x-line-signature"] as string;
    const bodyString = JSON.stringify(req.body);

    // 1. 驗證來源是否合法
    if (!validateSignature(bodyString, config.channelSecret!, signature)) {
        res.status(401).send("Invalid signature");
        return;
    }

    const events: WebhookEvent[] = req.body.events;

    try {
        await Promise.all(
            events.map(async (event) => {
                if (event.type === "follow") {
                    return await handleFollowEvent(event as FollowEvent, client);
                }
                if (event.type === "postback") {
                    return await handlePostbackEvent(event as PostbackEvent, client);
                }
                if (event.type === "message" && event.message.type === "text") {
                    return await handleMessageEvent(event as MessageEvent, client);
                }
                return null;
            })
        );
        res.json({ status: "ok" });
    } catch (err: any) {
        console.error("Webhook Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * 處理「加入好友」事件：自動建立帳號
 */
async function handleFollowEvent(event: FollowEvent, client: messagingApi.MessagingApiClient) {
    const userId = event.source.userId;
    if (!userId) return;

    try {
        // 2. 向 LINE 請求使用者公開資料
        const profile = await client.getProfile(userId);

        // 3. 檢查是否存在相同 lineUserId 的使用者
        const userQuery = await db.collection("users")
            .where("lineUserId", "==", userId)
            .limit(1)
            .get();

        if (userQuery.empty) {
            console.log(`[LINE Webhook] Creating new user for: ${profile.displayName}`);

            // 為了相容 Auth.js，我們在建立 user 的同時也建立 account 對接
            const newUserRef = db.collection("users").doc();
            const userData = {
                name: profile.displayName,
                image: profile.pictureUrl,
                lineUserId: userId,
                provider: "line-webhook", // 標註來源
                createdAt: FieldValue.serverTimestamp(),
            };

            await newUserRef.set(userData);

            // 建立一個 linked account，這樣未來他用 LINE 登入時可以自動對接
            await db.collection("accounts").add({
                userId: newUserRef.id,
                type: "oauth",
                provider: "line",
                providerAccountId: userId,
                createdAt: FieldValue.serverTimestamp(),
            });

            // 4. 回覆歡迎訊息與選單
            await client.replyMessage({
                replyToken: event.replyToken,
                messages: [
                    {
                        type: "text",
                        text: `您好 ${profile.displayName}！感謝您關注同心華德福。\n\n我們預計為您自動建立網站帳號，您現在可以直接點選選單或輸入「預約參訪」來查看近期活動。`
                    },
                    {
                        type: "template",
                        altText: "預約參訪選單",
                        template: {
                            type: "buttons",
                            title: "預約參訪服務",
                            text: "請選擇您要執行的動作：",
                            actions: [
                                { type: "postback", label: "查看已登記參訪", data: "action=view_registrations" },
                                { type: "postback", label: "新登記參訪", data: "action=register_new" }
                            ]
                        }
                    }
                ]
            });
        }

        return { status: "success" };
    } catch (error) {
        console.error("Error in handleFollowEvent:", error);
        throw error;
    }
}
/**
 * 處理「訊息」事件：關鍵字回覆
 */
async function handleMessageEvent(event: MessageEvent, client: messagingApi.MessagingApiClient) {
    if (event.message.type !== "text") return null;

    const text = event.message.text.trim();
    if (text === "預約參訪") {
        return await sendRegistrationMenu(event.replyToken!, client);
    }
    return null;
}

/**
 * 處理「Postback」事件：按鈕動作
 */
async function handlePostbackEvent(event: PostbackEvent, client: messagingApi.MessagingApiClient) {
    const data = event.postback.data;
    const userId = event.source.userId;
    if (!userId) return;

    if (data === "action=view_registrations") {
        return await sendUserRegistrations(event.replyToken!, userId, client);
    } else if (data === "action=register_new") {
        return await sendAvailableSessions(event.replyToken!, client);
    } else if (data.startsWith("action=reserve&sessionId=")) {
        const sessionId = data.split("sessionId=")[1];
        console.log(`User ${userId} requested reservation for session ${sessionId}`);

        return await client.replyMessage({
            replyToken: event.replyToken!,
            messages: [{
                type: "text",
                text: "感謝您的預約意願！為了完成預約，請點擊下方連結填寫聯絡資料：\n\nhttps://tongxing-waldorf.web.app/visit\n\n(系統將自動帶入您的帳號資訊)"
            }]
        });
    } else if (data.startsWith("action=waiting_list&sessionId=")) {
        return await client.replyMessage({
            replyToken: event.replyToken!,
            messages: [{
                type: "text",
                text: "感謝您的候補登記！如果有新的名額釋出，我們會第一時間透過 LINE 通知您。"
            }]
        });
    }

    return null;
}

async function sendRegistrationMenu(replyToken: string, client: messagingApi.MessagingApiClient) {
    return await client.replyMessage({
        replyToken,
        messages: [{
            type: "template",
            altText: "預約參訪選單",
            template: {
                type: "buttons",
                title: "預約參訪服務",
                text: "請選擇您要執行的動作：",
                actions: [
                    { type: "postback", label: "查看已登記參訪", data: "action=view_registrations" },
                    { type: "postback", label: "新登記參訪", data: "action=register_new" }
                ]
            }
        }]
    });
}

async function sendUserRegistrations(replyToken: string, userId: string, client: messagingApi.MessagingApiClient) {
    // 1. 查找使用者對應的網站 userId
    const userQuery = await db.collection("users").where("lineUserId", "==", userId).limit(1).get();
    if (userQuery.empty) {
        return await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "找不到您的帳號資訊，請重新加入好友試試。" }]
        });
    }

    const websiteUserId = userQuery.docs[0].id;

    // 2. 獲取報名紀錄
    const regQuery = await db.collection("visit_registrations")
        .where("user_id", "==", websiteUserId)
        .where("status", "==", "confirmed")
        .get();

    if (regQuery.empty) {
        return await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "您目前沒有已登記的參訪行程。" }]
        });
    }

    // 3. 獲取場次詳細資訊
    const regs = regQuery.docs.map(doc => doc.data());
    let messageText = "您目前的登記參訪日期如下：\n";

    for (const reg of regs) {
        const sessionDoc = await db.collection("visit_sessions").doc(reg.session_id).get();
        const session = sessionDoc.data();
        if (session) {
            messageText += `\n📅 日期：${session.date}\n⏰ 時間：${session.time}\n👤 人數：${reg.visitors}位\n`;
        }
    }

    return await client.replyMessage({
        replyToken,
        messages: [{ type: "text", text: messageText }]
    });
}

async function sendAvailableSessions(replyToken: string, client: messagingApi.MessagingApiClient) {
    const snapshot = await db.collection("visit_sessions")
        .where("status", "==", "open")
        .orderBy("order", "asc")
        .get();

    if (snapshot.empty) {
        return await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "目前暫無開放預約的場次。" }]
        });
    }

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    // 使用 Flex Message 顯示場次
    const bubbles: messagingApi.FlexBubble[] = sessions.map(session => ({
        type: "bubble",
        size: "nano",
        header: {
            type: "box",
            layout: "vertical",
            contents: [{ type: "text", text: session.date, weight: "bold", size: "sm" }] as messagingApi.FlexComponent[],
            backgroundColor: "#F7F5F2"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: session.time, size: "xs", color: "#8C7E6A" },
                { type: "text", text: `剩餘：${session.remaining_seats}`, size: "xs", color: session.remaining_seats > 0 ? "#438258" : "#E25E5E", weight: "bold" }
            ] as messagingApi.FlexComponent[],
            spacing: "sm"
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                session.remaining_seats > 0 ? {
                    type: "button",
                    style: "primary",
                    height: "sm",
                    color: "#9D8A74",
                    action: {
                        type: "uri",
                        label: "立即預約",
                        uri: `https://tongxing-waldorf.web.app/visit`
                    }
                } : {
                    type: "button",
                    style: "secondary",
                    height: "sm",
                    action: {
                        type: "postback",
                        label: "已額滿 (候補)",
                        data: `action=waiting_list&sessionId=${session.id}`
                    }
                }
            ] as messagingApi.FlexComponent[]
        }
    }));

    return await client.replyMessage({
        replyToken,
        messages: [{
            type: "flex",
            altText: "可用參訪場次",
            contents: {
                type: "carousel",
                contents: bubbles.slice(0, 10)
            }
        }]
    });
}
