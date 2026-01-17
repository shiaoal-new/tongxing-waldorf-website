const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Config
const PORTS_TO_KILL = [3000, 5001, 5002, 5003, 4000, 4040, 8080, 9099, 9150];
const FIXED_DOMAIN = 'https://tongxingwaldorf.dpdns.org';
const TUNNEL_NAME = 'tongxing-dev';

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

// 5. Wait for Port (and HTTP response) to be ready
function waitForPort(port, path = '/') {
    return new Promise((resolve) => {
        log('System', `⏳ Waiting for http://localhost:${port}${path} to be responsive...`, colors.cyan);
        const interval = setInterval(() => {
            const req = http.get({
                hostname: '127.0.0.1',
                port: port,
                path: path,
                timeout: 1000
            }, (res) => {
                // If we get any response, the server is up
                clearInterval(interval);
                log('System', `✅ http://localhost:${port} is ready! (Status: ${res.statusCode})`, colors.green);
                resolve();
            });

            req.on('error', () => {
                // connection refused or other errors, keep waiting
            });

            req.on('timeout', () => {
                req.destroy();
            });
        }, 1500);
    });
}

// 3. Wait for Cloudflare to be ready
function waitForCloudflare(proc) {
    let resolved = false;
    return new Promise((resolve) => {
        log('System', '⏳ Waiting for Cloudflare Tunnel to initialize...', colors.cyan);

        // If we have a fixed domain, we can resolve immediately once the process is alive
        // but we still wait for the "Connected" log to be sure.
        const onData = (data) => {
            if (resolved) return;
            const output = data.toString();

            // Case 1: Fixed Tunnel success message
            if (output.includes('Connected') || output.includes('Registered tunnel connection')) {
                resolved = true;
                log('System', `✅ Cloudflare Persistent Tunnel is ready at ${FIXED_DOMAIN}`, colors.green);
                resolve(FIXED_DOMAIN);
                return;
            }

            // Case 2: Quick Tunnel URL fallback (if someone removes TUNNEL_NAME)
            const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (match) {
                resolved = true;
                const url = match[0].trim();
                log('System', `✅ Cloudflare Quick Tunnel is ready at ${url}`, colors.green);
                resolve(url);
            }
        };
        proc.stdout.on('data', onData);
        proc.stderr.on('data', onData);

        // Timeout fallback for persistent tunnel
        setTimeout(() => {
            if (!resolved && TUNNEL_NAME) {
                resolved = true;
                log('System', `⚠️ Tunnel initialization timeout, assuming ${FIXED_DOMAIN} is ready.`, colors.yellow);
                resolve(FIXED_DOMAIN);
            }
        }, 10000);
    });
}

// 4. Get Public IP (for Localtunnel password)
function getPublicIP() {
    return new Promise((resolve) => {
        http.get('http://ifconfig.me/ip', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        }).on('error', () => resolve('Unknown'));
    });
}

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

    // 2. Cloudflare Tunnel - Expose Frontend (Port 3000)
    const tunnelArgs = TUNNEL_NAME
        ? ['tunnel', '--url', 'http://localhost:3000', 'run', TUNNEL_NAME]
        : ['tunnel', '--url', 'http://localhost:3000'];

    const tunnelProc = startProcess('Tunnel', 'cloudflared', tunnelArgs, '.', colors.cyan);

    // 3. Wait for Tunnel & Update Environment Variables
    const publicUrl = await waitForCloudflare(tunnelProc);
    updateEnvFile(publicUrl);

    // 4. Wait for Firebase Functions Port (5001) to be ready before starting Frontend
    // Note: Emulators don't always respond correctly to GET / so we just check connectivity
    await waitForPort(5001, '/');

    // 5. Frontend - Start this LAST so it picks up the updated .env.local
    startProcess('Frontend', 'npm', ['run', 'dev', '--prefix', 'frontend'], '.', colors.blue);

    // Wait for Frontend to be fully ready (Next.js is serving)
    await waitForPort(3000, '/');

    // Extra delay to let Cloudflare Tunnel settle
    await new Promise(r => setTimeout(r, 2000));

    // 6. Update Webhook
    log('System', '🔄 Updating LINE Webhook...', colors.green);
    startProcess('Webhook', 'npm', ['run', 'update-webhook', '--prefix', 'functions'], '.', colors.green);

    // Say ready
    try {
        execSync('say ready');
        log('System', '🔊 System is ready!', colors.green);
    } catch (e) {
        // Fallback if say command fails
    }

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
