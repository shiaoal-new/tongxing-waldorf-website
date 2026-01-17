import { onRequest } from "firebase-functions/v2/https";
import { VisitService } from "./services/visitService";
import { UserService } from "./services/userService";

// Helper to parse cookies
const parseCookies = (cookieHeader: string) => {
    const list: any = {};
    if (!cookieHeader) return list;
    cookieHeader.split(";").forEach(function (cookie) {
        let [name, ...rest] = cookie.split("=");
        name = name?.trim();
        if (!name) return;
        const value = rest.join("=").trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}

// 獲取使用者已登記的參訪
export const getuserregistrations = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    try {
        const cookies = parseCookies(req.headers.cookie || "");
        const sessionToken = cookies["__Secure-next-auth.session-token"] || cookies["next-auth.session-token"];

        if (!sessionToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const session = await UserService.getSession(sessionToken);
        if (!session) {
            res.status(401).json({ error: "Invalid session" });
            return;
        }

        const registrations = await VisitService.getUserRegistrations(session.user.id);
        res.status(200).json(registrations);
    } catch (error: any) {
        console.error("Error fetching user registrations:", error);
        res.status(500).json({ error: error.message });
    }
});

// 取消參訪預約
export const cancelregistration = onRequest({ cors: true, region: "asia-east1" }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { registrationId, reason } = req.body;

    if (!registrationId) {
        res.status(400).json({ error: 'Missing registrationId' });
        return;
    }

    try {
        const cookies = parseCookies(req.headers.cookie || "");
        const sessionToken = cookies["__Secure-next-auth.session-token"] || cookies["next-auth.session-token"];

        if (!sessionToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const session = await UserService.getSession(sessionToken);
        if (!session) {
            res.status(401).json({ error: "Invalid session" });
            return;
        }

        await VisitService.cancelRegistration(registrationId, session.user.id, reason);
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Cancel registration error:", error);
        res.status(500).json({ error: error.message });
    }
});
