import { onRequest } from "firebase-functions/v2/https";
import { db } from "./utils/firebase.js";
import { formatSessionDate, formatSessionTime } from "./utils/formatters.js";
import { UserService } from "./services/userService.js";
import {
    messagingApi,
    validateSignature,
    WebhookEvent,
    FollowEvent,
    PostbackEvent,
    MessageEvent
} from "@line/bot-sdk";

function getVisitUrl(params: string = "") {
    const liffId = process.env.LIFF_ID;
    const baseUrl = `https://liff.line.me/${liffId}`;
    return params ? `${baseUrl}?${params}` : baseUrl;
}

// 移除全域 config，改在函數執行時獲取，以支援正式環境的 Secrets

/**
 * LINE Webhook 進入點
 */
export const lineWebhook = onRequest({
    cors: true,
    region: "asia-east1",
    secrets: ["LINE_MESSAGING_CHANNEL_SECRET", "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN"]
}, async (req: any, res: any) => {
    // [修正] 當在本地 Emulator 運行時，Firebase 可能會從雲端拉取 Secrets 覆蓋環境變數
    // 這裡強制重新讀取 .env.local 並覆蓋 (override: true) 以確保使用本地開發的設定
    if (process.env.FUNCTIONS_EMULATOR === "true") {
        const path = await import("path");
        const dotenv = await import("dotenv");
        dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
    }

    const config = {
        channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || "",
        channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET || "",
    };

    const client = new messagingApi.MessagingApiClient({
        channelAccessToken: config.channelAccessToken
    });

    // LINE Webhook 的原始 body 需要用字串驗簽
    // 使用 req.rawBody 確保取得最原始的請求內容，避免 JSON.stringify 造成格式差異導致驗簽失敗
    const signature = req.headers["x-line-signature"] as string;
    const bodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

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
        // 1. 檢查是否存在相同 lineUserId 的使用者
        const existingUser = await UserService.getUserByLineId(userId);

        if (!existingUser) {
            console.log(`[LINE Webhook] User ${userId} not found, fetching profile...`);
            // 2. 向 LINE 請求使用者公開資料
            const profile = await client.getProfile(userId);

            // 3. 建立使用者資料 (使用 UserService)
            await UserService.createFollower(userId, profile);
            console.log(`[LINE Webhook] Successfully created follower account for ${profile.displayName}`);
        } else {
            console.log(`[LINE Webhook] User ${userId} already exists, skipping creation.`);
        }

        // 4. 回覆歡迎訊息與選單
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
                {
                    type: "text",
                    text: `您好！感謝您關注同心華德福。\n\n我們預計為您自動建立網站帳號，您現在可以直接點選選單或輸入「預約參訪」來查看近期活動。`
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

    if (data === "action=register_new") {
        return await sendAvailableSessions(event.replyToken!, client);
    } else if (data === "action=view_registrations") {
        const userQuery = await db.collection("users")
            .where("lineUserId", "==", userId)
            .limit(1)
            .get();

        let hasRegistrations = false;
        if (!userQuery.empty) {
            const systemUserId = userQuery.docs[0].id;
            const regQuery = await db.collection("visit_registrations")
                .where("user_id", "==", systemUserId)
                .where("status", "==", "confirmed")
                .limit(1)
                .get();
            if (!regQuery.empty) {
                hasRegistrations = true;
            }
        }

        if (!hasRegistrations) {
            return await sendAvailableSessions(event.replyToken!, client);
        } else {
            return await client.replyMessage({
                replyToken: event.replyToken!,
                messages: [{
                    type: "template",
                    altText: "查看已登記參訪",
                    template: {
                        type: "buttons",
                        title: "已登記參訪",
                        text: "您已有登記的參訪紀錄，請點擊下方按鈕查看：",
                        actions: [
                            {
                                type: "uri",
                                label: "查看/管理我的預約",
                                uri: getVisitUrl("mode=manage")
                            },
                            { type: "postback", label: "新登記參訪", data: "action=register_new" }
                        ]
                    }
                }]
            });
        }
    } else if (data.startsWith("action=reserve&sessionId=")) {
        const sessionId = data.split("sessionId=")[1];
        console.log(`User ${userId} requested reservation for session ${sessionId}`);

        return await client.replyMessage({
            replyToken: event.replyToken!,
            messages: [{
                type: "text",
                text: `感謝您的預約意願！為了完成預約，請點擊下方連結填寫聯絡資料：\n\n${getVisitUrl()}\n\n(系統將自動帶入您的帳號資訊)`
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
    await client.replyMessage({
        replyToken,
        messages: [{
            type: "template",
            altText: "預約參訪選單",
            template: {
                type: "buttons",
                title: "預約參訪服務",
                text: "請選擇您要執行的動作：",
                actions: [
                    {
                        type: "uri",
                        label: "查看/管理我的預約",
                        uri: getVisitUrl("mode=manage")
                    },
                    { type: "postback", label: "新登記參訪", data: "action=register_new" }
                ]
            }
        }]
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
            contents: [{ type: "text", text: formatSessionDate(session.date), weight: "bold", size: "sm" }] as messagingApi.FlexComponent[],
            backgroundColor: "#F7F5F2"
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: formatSessionTime(session.start_time, session.duration), size: "xs", color: "#8C7E6A" },
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
                        uri: getVisitUrl()
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
