import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually since we are running this script directly
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = fs.readFileSync(envLocalPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const index = line.indexOf('=');
        if (index > 0) {
            const key = line.substring(0, index).trim();
            const value = line.substring(index + 1).trim();
            process.env[key] = value;
        }
    });
}

const LINE_API = 'https://api.line.me/v2/bot/channel/webhook/endpoint';

async function updateWebhook() {
    console.log('🔄 Updating LINE Webhook URL...');

    const publicUrl = process.env.WEB_BASE_URL;

    if (!publicUrl) {
        console.error('❌ WEB_BASE_URL not found in .env.local. Please run the local development script.');
        process.exit(1);
    }

    const cleanUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    const webhookUrl = `${cleanUrl}/api/lineWebhook`;

    console.log(`📍 Using Public URL: [${publicUrl}]`);
    console.log(`🔗 Target Webhook URL: [${webhookUrl}]`);

    const channelToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
    if (!channelToken) {
        console.error('❌ Missing LINE_MESSAGING_CHANNEL_ACCESS_TOKEN in .env.local');
        process.exit(1);
    }

    console.log('🚀 Updating LINE Messaging API...');
    const lineRes = await fetch(LINE_API, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${channelToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: webhookUrl })
    });

    const responseText = await lineRes.text();

    if (lineRes.ok) {
        console.log('✅ Webhook URL updated successfully!');
        console.log('   Now pointing to:', webhookUrl);
        return true;
    } else {
        console.error(`❌ Failed to update LINE Webhook (Status: ${lineRes.status}):`, responseText);
        return false;
    }
}

async function main() {
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    const delay = 5000;

    while (!success && attempts < maxAttempts) {
        attempts++;
        if (attempts > 1) {
            console.log(`⏳ Retry attempt ${attempts}/${maxAttempts} in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            success = await updateWebhook();
        } catch (error: any) {
            console.error(`❌ Error on attempt ${attempts}:`, error.message);
        }
    }

    if (!success) {
        console.error('❌ Failed to update webhook after multiple attempts.');
        process.exit(1);
    }
}

main();
