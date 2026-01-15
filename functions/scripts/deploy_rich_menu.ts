import { messagingApi } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually parse env file
const loadEnv = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        const envConfig = fs.readFileSync(filePath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value && !key.startsWith('#')) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log(`✅ Loaded config from ${path.basename(filePath)}`);
    }
};

async function main() {
    // 1. Determine Environment
    // Usage: npm run deploy-richmenu -- --env=local
    const args = process.argv.slice(2);
    const envArg = args.find(a => a.startsWith('--env='))?.split('=')[1] || 'local';

    console.log(`🚀 Deploying Rich Menu for environment: [${envArg}]`);

    // 2. Load Credentials based on env
    let envPath = '';
    if (envArg === 'local') {
        envPath = path.resolve(process.cwd(), '.env.local');
    } else if (envArg === 'dev') {
        envPath = path.resolve(process.cwd(), '.env');
    } else if (envArg === 'prod') {
        envPath = path.resolve(process.cwd(), '.env.production');
    }

    if (fs.existsSync(envPath)) {
        loadEnv(envPath);
    } else {
        // Validation: Try to resolve from parent dir if running from functions/
        // Current CWD is likely functions/ based on package.json script usage "node ... scripts/..."
        // but better be safe
        const fallbackPath = path.resolve(process.cwd(), '../' + path.basename(envPath));
        if (fs.existsSync(fallbackPath)) {
            loadEnv(fallbackPath);
        }
    }


    const channelToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
    if (!channelToken) {
        console.error('❌ Error: LINE_MESSAGING_CHANNEL_ACCESS_TOKEN not found.');
        console.error('   Please check your .env files or ensure variables are set.');
        process.exit(1);
    }

    const client = new messagingApi.MessagingApiClient({
        channelAccessToken: channelToken
    });

    // 3. Define the Rich Menu
    const richMenu: messagingApi.RichMenuRequest = {
        size: { width: 2500, height: 843 },
        selected: true,
        name: `Visit Menu (${envArg})`,
        chatBarText: '預約服務',
        areas: [
            {
                bounds: { x: 0, y: 0, width: 2500, height: 843 },
                action: {
                    type: 'message',
                    text: '預約參訪'
                }
            }
        ]
    };

    try {
        // 4. Create Rich Menu
        console.log('📦 Creating Rich Menu...');
        const result = await client.createRichMenu(richMenu);
        const richMenuId = result.richMenuId;
        console.log(`   ID: ${richMenuId}`);

        // 5. Upload Image

        // Fix path resolution: The script is in functions/scripts/, assets is in functions/scripts/assets/
        // If running from functions/ root via npm script:
        // __dirname will be .../functions/scripts
        const imagePath = path.resolve(__dirname, 'assets/richmenu.png');

        if (!fs.existsSync(imagePath)) {
            console.error(`❌ Image not found at: ${imagePath}`);
            console.error('   Please place a 2500x843 png image there and try again.');
            // Clean up
            await client.deleteRichMenu(richMenuId);
            process.exit(1);
        }

        console.log('🖼️  Uploading Image...');
        const buffer = fs.readFileSync(imagePath);

        // Fix for setRichMenuImage type issue:
        // The SDK might require Blob which is available in Node 18+ (fetch global)
        // or it might handle Buffer.
        // Assuming SDK v10 supports Blob.
        const blob = new Blob([buffer], { type: 'image/png' });

        // Use type assertion to bypass potential TS definition mismatch in this specific environment
        await (client as any).setRichMenuImage(richMenuId, blob);

        // 6. Set as Default
        console.log('✅ Setting as Default...');
        await client.setDefaultRichMenu(richMenuId);

        console.log('🎉 Success! Rich Menu deployed.');

    } catch (error: any) {
        console.error('❌ Failed:', error.message || error);
        if (error.originalError) {
            console.error('   Details:', error.originalError.response?.data);
        }
    }
}

main();
