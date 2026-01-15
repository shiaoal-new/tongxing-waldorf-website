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
    const filesToUpdate = [
        path.join(__dirname, '../functions/.env.local'),
        path.join(__dirname, '../frontend/.env.local')
    ];

    filesToUpdate.forEach(envPath => {
        log('System', `📝 Updating ${envPath}...`, colors.cyan);
        let content = '';
        if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, 'utf8');
        }

        // Replace or Append WEB_BASE_URL
        const regex = /^WEB_BASE_URL=.*$/m;
        if (regex.test(content)) {
            content = content.replace(regex, `WEB_BASE_URL=${url}`);
        } else {
            content += `\nWEB_BASE_URL=${url}`;
        }

        // For frontend, also set NEXT_PUBLIC_WEB_BASE_URL just in case
        const regex2 = /^NEXT_PUBLIC_WEB_BASE_URL=.*$/m;
        if (regex2.test(content)) {
            content = content.replace(regex2, `NEXT_PUBLIC_WEB_BASE_URL=${url}`);
        } else {
            content += `\nNEXT_PUBLIC_WEB_BASE_URL=${url}`;
        }

        fs.writeFileSync(envPath, content);
    });

    log('System', '✅ Environment variables updated!', colors.green);
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
    // Since we are running from root, updating webhook script path relative to root
    // functions/scripts/update_webhook.ts requires to be run essentially inside functions context for ts-node loading usually
    // but using --prefix functions handles the npm context.
    startProcess('Webhook', 'npm', ['run', 'update-webhook', '--prefix', 'functions'], '.', colors.green);

}

main().catch(err => console.error(err));
