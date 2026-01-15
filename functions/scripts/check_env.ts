import { pathToFileURL } from 'url';

async function main() {
    console.log("🔍 Checking Environment Variables...");

    // Default standard
    console.log("1. Process Env:");
    console.log("   - CH_SECRET:", (process.env.LINE_MESSAGING_CHANNEL_SECRET || "").substring(0, 5) + "...");
    console.log("   - EMULATOR:", process.env.FUNCTIONS_EMULATOR);

    // Try to simulate what we did in the code
    try {
        const path = await import("path");
        const dotenv = await import("dotenv");

        console.log("\n2. Loading .env.local manually...");
        const result = dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

        if (result.error) {
            console.log("   ❌ Error loading .env.local:", result.error.message);
        } else {
            console.log("   ✅ Loaded .env.local");
            console.log("   - Parsed CH_SECRET:", (result.parsed?.LINE_MESSAGING_CHANNEL_SECRET || "").substring(0, 5) + "...");
        }

        console.log("\n3. Process Env AFTER Manual Load:");
        console.log("   - CH_SECRET:", (process.env.LINE_MESSAGING_CHANNEL_SECRET || "").substring(0, 5) + "...");

    } catch (e: any) {
        console.error("   ❌ Failed:", e.message);
    }
}

main();
