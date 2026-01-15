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
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';
const LINE_API = 'https://api.line.me/v2/bot/channel/webhook/endpoint';

// Try to get Project ID from .firebaserc
let projectId = 'tongxing-waldorf-website-dev'; // default fallback
try {
    const firebasercPath = path.resolve(__dirname, '../../.firebaserc');
    if (fs.existsSync(firebasercPath)) {
        const rc = JSON.parse(fs.readFileSync(firebasercPath, 'utf8'));
        if (rc.projects?.dev) {
            projectId = rc.projects.dev;
        }
    }
} catch (e) {
    console.warn('Failed to read .firebaserc, using default project ID:', projectId);
}

const FUNCTION_REGION = 'asia-east1';
const FUNCTION_NAME = 'lineWebhook';

async function main() {
    console.log('🔄 Fetching ngrok URL...');

    try {
        const ngrokRes = await fetch(NGROK_API);
        const ngrokData: any = await ngrokRes.json();
        const tunnel = ngrokData.tunnels.find((t: any) => t.proto === 'https');

        if (!tunnel) {
            console.error('❌ No HTTPS tunnel found. Is ngrok running?');
            process.exit(1);
        }

        const ngrokUrl = tunnel.public_url;
        const webhookUrl = `${ngrokUrl}/${projectId}/${FUNCTION_REGION}/${FUNCTION_NAME}`;

        console.log(`📍 Ngrok URL: ${ngrokUrl}`);
        console.log(`🔗 Target Webhook URL: ${webhookUrl}`);

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

        if (lineRes.ok) {
            console.log('✅ Webhook URL updated successfully!');
            console.log('   Now pointing to:', webhookUrl);
        } else {
            console.error('❌ Failed to update LINE Webhook:', await lineRes.text());
            process.exit(1);
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.cause?.code === 'ECONNREFUSED') {
            console.error('   Running ngrok? Make sure you started it with `ngrok http 5001`');
        }
    }
}

main();
