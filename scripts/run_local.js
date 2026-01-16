const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Config
const PORTS_TO_KILL = [3000, 5001, 5002, 5003, 4000, 4040, 8080, 9099, 9150]; // Common Next.js, Firebase, Ngrok ports

// Colors
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};

function log(prefix, msg, color = colors.reset) {
    console.log(`${color}[${prefix}] ${msg}${colors.reset}`);
}

// 1. Kill existing processes
function killPorts() {
    log('System', '🧹 Cleaning up ports...', colors.yellow);
    try {
        const ports = PORTS_TO_KILL.join(' ');
        // Find PIDs using lsof
        const pids = execSync(`lsof -t -i:${PORTS_TO_KILL.join(' -i:')} || true`).toString().trim();

        if (pids) {
            const pidList = pids.split('\n').join(' ');
            log('System', `Killing PIDs: ${pidList}`, colors.red);
            execSync(`kill -9 ${pidList}`);
        } else {
            log('System', 'No active processes found on target ports.', colors.green);
        }
    } catch (e) {
        // Ignore errors if no processes found
    }
}

// 2. Start a process
function startProcess(name, command, args, cwd = '.', color = colors.reset) {
    log('System', `🚀 Starting ${name}...`, color);
    const proc = spawn(command, args, { cwd, shell: true, stdio: 'pipe' });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line) console.log(`${color}[${name}] ${line}${colors.reset}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (!line) return;

            // Basic heuristic to detect warnings
            const isWarning = line.includes('Warning') || line.includes('warning');

            if (isWarning) {
                console.log(`${colors.yellow}[${name}:WARN] ${line}${colors.reset}`);
            } else {
                console.error(`${colors.red}[${name}:ERR] ${line}${colors.reset}`);
            }
        });
    });

    return proc;
}

// 5. Wait for Port to be ready
function waitForPort(port) {
    return new Promise((resolve) => {
        log('System', `⏳ Waiting for port ${port} to be ready...`, colors.cyan);
        const interval = setInterval(() => {
            const client = new net.Socket();
            client.connect(port, '127.0.0.1', () => {
                client.destroy();
                clearInterval(interval);
                log('System', `✅ Port ${port} is ready!`, colors.green);
                resolve();
            });
            client.on('error', () => {
                client.destroy();
            });
        }, 1000);
    });
}

// 3. Wait for Ngrok to be ready
function waitForNgrok() {
    return new Promise((resolve) => {
        log('System', '⏳ Waiting for Ngrok to initialize...', colors.cyan);
        const interval = setInterval(() => {
            http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const result = JSON.parse(data);
                            const tunnel = result.tunnels.find(t => t.proto === 'https');
                            if (tunnel) {
                                clearInterval(interval);
                                log('System', `✅ Ngrok is ready at ${tunnel.public_url}`, colors.green);
                                resolve(tunnel.public_url);
                            }
                        } catch (e) {
                            // ignore parse errors
                        }
                    }
                });
            }).on('error', () => {
                // connection refused, retry
            });
        }, 1000);
    });
}

// 4. Update .env.local
// 4. Update .env.local (Functions & Frontend)
function updateEnvFile(url) {
    const sharedEnvPath = path.join(__dirname, '../.env.shared');
    let sharedVars = {};

    if (fs.existsSync(sharedEnvPath)) {
        const sharedContent = fs.readFileSync(sharedEnvPath, 'utf8');
        sharedContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) sharedVars[key.trim()] = value.trim();
        });
    }

    const filesToUpdate = [
        { path: path.join(__dirname, '../functions/.env.local'), isFrontend: false },
        { path: path.join(__dirname, '../frontend/.env.local'), isFrontend: true }
    ];

    filesToUpdate.forEach(({ path: envPath, isFrontend }) => {
        log('System', `📝 Updating ${envPath}...`, colors.cyan);
        let content = '';
        if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, 'utf8');
        }

        // Helper to update or append variable
        const updateVar = (key, val) => {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(content)) {
                content = content.replace(regex, `${key}=${val}`);
            } else {
                content += `\n${key}=${val}`;
            }
        };

        // 1. Sync Shared Vars
        Object.entries(sharedVars).forEach(([key, val]) => {
            updateVar(key, val);
            // Frontend might need NEXT_PUBLIC_ for some vars
            if (isFrontend && !key.startsWith('NEXT_PUBLIC_') && key !== 'LINE_CLIENT_ID') {
                // For now, let's keep it simple. If we need more specific prefixes, we'll add them.
                // LIFF_ID usually needs NEXT_PUBLIC_ in frontend
                if (key === 'LIFF_ID') updateVar('NEXT_PUBLIC_LIFF_ID', val);
            }
        });

        // 2. Sync Web Base URL (from Ngrok)
        updateVar('WEB_BASE_URL', url);
        updateVar('NEXTAUTH_URL', `${url}/api/auth`);

        if (isFrontend) {
            updateVar('NEXT_PUBLIC_WEB_BASE_URL', url);
        }

        fs.writeFileSync(envPath, content.trim() + '\n');
    });

    log('System', '✅ Environment variables synchronized!', colors.green);
}

async function main() {
    // A. Cleanup
    killPorts();

    // B. Start Long-running processes
    // 1. Firebase (Emulator) - Start this first to get backend ready
    startProcess('Firebase', 'npm', ['run', 'serve', '--prefix', 'functions'], '.', colors.yellow);

    // 2. Ngrok - Expose Frontend (Port 3000)
    // We expose 3000 because we want the user to visit the website.
    // Webhook requests will be proxied by Next.js rewrites.
    // Using user provided static domain for stable LIFF development
    const ngrokProc = startProcess('Ngrok', 'ngrok', ['http', '3000', '--domain=nomographically-bridleless-annetta.ngrok-free.dev'], '.', colors.cyan);

    // 3. Wait for Ngrok & Update Environment Variables
    const ngrokUrl = await waitForNgrok();
    updateEnvFile(ngrokUrl);

    // 4. Wait for Firebase Functions Port (5001) to be ready before starting Frontend
    await waitForPort(5001);

    // 5. Frontend - Start this LAST so it picks up the updated .env.local
    startProcess('Frontend', 'npm', ['run', 'dev', '--prefix', 'frontend'], '.', colors.blue);

    // 6. Update Webhook
    log('System', '🔄 Updating LINE Webhook...', colors.green);
    startProcess('Webhook', 'npm', ['run', 'update-webhook', '--prefix', 'functions'], '.', colors.green);

    // 7. Seed Visit Sessions (New)
    log('System', '🌱 Seeding visit sessions...', colors.cyan);
    const seedUrl = 'http://127.0.0.1:5001/tongxing-waldorf-website-dev/asia-east1/seedvisitsessions';

    // Improved retry logic for seeding
    let attempts = 0;
    const maxAttempts = 10;

    const seedWithRetry = () => {
        attempts++;
        const req = http.get(seedUrl, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Collect response body for debugging if needed
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    log('System', `✅ Seeding finished (Status: ${res.statusCode})`, colors.green);
                });
            } else {
                log('System', `⚠️ Seeding attempt ${attempts} responded with status ${res.statusCode}. Retrying...`, colors.yellow);
                if (attempts < maxAttempts) setTimeout(seedWithRetry, 3000);
            }
        });

        req.on('error', (err) => {
            log('System', `⚠️ Seeding attempt ${attempts} failed: ${err.message}. Retrying...`, colors.yellow);
            if (attempts < maxAttempts) setTimeout(seedWithRetry, 3000);
        });
    };

    // Start seeding after a delay to allow Functions to initialize
    setTimeout(seedWithRetry, 5000);
}

main().catch(err => console.error(err));
